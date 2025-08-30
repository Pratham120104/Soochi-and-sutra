<?php
// backend/image-upload.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Be more restrictive in production
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Enable error reporting for debugging (REMOVE IN PRODUCTION)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'No file uploaded or upload error: ' . ($_FILES['image']['error'] ?? 'Unknown error')
    ]);
    exit;
}

// Get customer ID and image type from request
$customerId = $_POST['customer_id'] ?? null;
$imageType = $_POST['image_type'] ?? null;

if (!$customerId || !$imageType) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing customer_id or image_type']);
    exit;
}

// Validate image type
$allowedTypes = ['saree', 'blouseFront', 'blouseBack', 'blouseHand'];
if (!in_array($imageType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid image type']);
    exit;
}

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . '/uploads/' . $customerId;
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Get file info
$file = $_FILES['image'];
$fileName = $file['name'];
$fileTmpName = $file['tmp_name'];
$fileSize = $file['size'];
$fileError = $file['error'];

// Get file extension
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

// Allowed file extensions
$allowedExts = ['jpg', 'jpeg', 'png', 'gif'];

// Validate file extension
if (!in_array($fileExt, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.']);
    exit;
}

// Validate file size (max 5MB)
if ($fileSize > 5000000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File is too large. Maximum file size is 5MB.']);
    exit;
}

// Generate unique filename
$newFileName = $imageType . '_' . time() . '.' . $fileExt;
$uploadPath = $uploadDir . '/' . $newFileName;

// Move uploaded file to destination
if (move_uploaded_file($fileTmpName, $uploadPath)) {
    // Generate URL for the uploaded file
    // Use hardcoded domain for production
    $baseUrl = "https://soochiandsutra.in";
    // Fallback to server host if needed (for development)
    if ($_SERVER['HTTP_HOST'] === 'localhost') {
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
    }
    $fileUrl = $baseUrl . '/backend/uploads/' . $customerId . '/' . $newFileName;
    
    // Database credentials
    $host = 'localhost';
    $db   = 'soochiandsutra';
    $user = 'root';
    $pass = '';

    // Connect to MySQL
    $conn = new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Check if customer exists
        $checkSql = "SELECT id FROM customers WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("s", $customerId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            // Customer doesn't exist
            $conn->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Customer not found']);
            $checkStmt->close();
            $conn->close();
            exit;
        }
        
        $checkStmt->close();
        
        // Check if image already exists for this customer and type
        $checkImageSql = "SELECT id FROM customer_images WHERE customer_id = ? AND image_type = ?";
        $checkImageStmt = $conn->prepare($checkImageSql);
        $checkImageStmt->bind_param("ss", $customerId, $imageType);
        $checkImageStmt->execute();
        $checkImageResult = $checkImageStmt->get_result();
        
        if ($checkImageResult->num_rows > 0) {
            // Update existing image
            $imageRow = $checkImageResult->fetch_assoc();
            $updateSql = "UPDATE customer_images SET url = ? WHERE id = ?";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param("si", $fileUrl, $imageRow['id']);
            $updateStmt->execute();
            $updateStmt->close();
        } else {
            // Insert new image
            $insertSql = "INSERT INTO customer_images (customer_id, image_type, url) VALUES (?, ?, ?)";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bind_param("sss", $customerId, $imageType, $fileUrl);
            $insertStmt->execute();
            $insertStmt->close();
        }
        
        $checkImageStmt->close();
        
        // Commit transaction
        $conn->commit();
        
        // Return success response
        echo json_encode([
            'success' => true, 
            'message' => 'File uploaded successfully',
            'url' => $fileUrl,
            'customerId' => $customerId,
            'imageType' => $imageType
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error saving image to database: ' . $e->getMessage()]);
    }
    
    $conn->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
}
?>