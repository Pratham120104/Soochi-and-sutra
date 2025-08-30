<?php
// backend/employee-management.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Be more restrictive in production
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Added PUT

// Enable error reporting for debugging (REMOVE IN PRODUCTION)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database credentials
$host = 'localhost';
$db   = 'soochiandsutra'; // Your database name
$user = 'root';         // Your database username
$pass = '';             // Your database password (set if you have one)

// Connect to MySQL
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle GET request to fetch employees
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, name, mobile, designation, customer_id FROM employees"; // Exclude password since it's hashed
    $result = $conn->query($sql);

    $employees = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }
    }
    echo json_encode(['success' => true, 'employees' => $employees]);
    $conn->close();
    exit;
}

// Handle GET request to fetch a specific employee for editing
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "SELECT id, name, mobile, designation, customer_id FROM employees WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $employee = $result->fetch_assoc();
        echo json_encode(['success' => true, 'employee' => $employee]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Employee not found']);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// Handle POST request to add a new employee
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the POSTed JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input or empty request body.']);
        exit;
    }

    // Validate required fields
    $required = ['name', 'mobile', 'password', 'designation'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            echo json_encode(['success' => false, 'message' => "Missing or empty field: $field"]);
            exit;
        }
    }

    // Generate automatic customer ID
    $customerId = generateCustomerId($conn);

    // Check for duplicate mobile number
    $checkMobile = $conn->prepare("SELECT id FROM employees WHERE mobile = ?");
    $checkMobile->bind_param("s", $data['mobile']);
    $checkMobile->execute();
    if ($checkMobile->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Mobile number already exists. Please use a different mobile number.']);
        $checkMobile->close();
        $conn->close();
        exit;
    }
    $checkMobile->close();

    // Hash the password securely
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // Prepare and execute the insert query
    $stmt = $conn->prepare("INSERT INTO employees (name, mobile, password, designation, customer_id) VALUES (?, ?, ?, ?, ?)");

    if ($stmt === false) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare statement: ' . $conn->error]);
        $conn->close();
        exit;
    }

    $stmt->bind_param("sssss", $data['name'], $data['mobile'], $hashedPassword, $data['designation'], $customerId);

    if ($stmt->execute()) {
        $newEmployeeId = $conn->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Employee added successfully!',
            'employee' => [
                'id' => $newEmployeeId,
                'name' => $data['name'],
                'mobile' => $data['mobile'],
                'password' => $data['password'], // Return plain password for display
                'designation' => $data['designation'],
                'customerId' => $customerId
            ]
        ]);
    } else {
        // Check if it's a duplicate key error
        if ($conn->errno === 1062) {
            echo json_encode(['success' => false, 'message' => 'Employee with this mobile number or customer ID already exists.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $stmt->error]);
        }
    }

    $stmt->close();
    $conn->close();
}

// Handle PUT request to update an employee
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get the PUTed JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input or missing employee ID.']);
        exit;
    }

    // Validate required fields
    $required = ['name', 'mobile', 'designation'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            echo json_encode(['success' => false, 'message' => "Missing or empty field: $field"]);
            exit;
        }
    }

    // Check for duplicate mobile number (excluding current employee)
    $checkMobile = $conn->prepare("SELECT id FROM employees WHERE mobile = ? AND id != ?");
    $checkMobile->bind_param("si", $data['mobile'], $data['id']);
    $checkMobile->execute();
    if ($checkMobile->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Mobile number already exists. Please use a different mobile number.']);
        $checkMobile->close();
        $conn->close();
        exit;
    }
    $checkMobile->close();

    // Check if password is being updated
    $passwordUpdate = '';
    $passwordParam = '';
    if (isset($data['password']) && $data['password'] !== '') {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $passwordUpdate = ', password = ?';
        $passwordParam = $hashedPassword;
    }

    // Prepare and execute the update query
    $sql = "UPDATE employees SET name = ?, mobile = ?, designation = ?" . $passwordUpdate . " WHERE id = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare update statement: ' . $conn->error]);
        $conn->close();
        exit;
    }

    if ($passwordUpdate) {
        $stmt->bind_param("ssssi", $data['name'], $data['mobile'], $data['designation'], $passwordParam, $data['id']);
    } else {
        $stmt->bind_param("sssi", $data['name'], $data['mobile'], $data['designation'], $data['id']);
    }

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Employee updated successfully!',
                'employee' => [
                    'id' => $data['id'],
                    'name' => $data['name'],
                    'mobile' => $data['mobile'],
                    'password' => $data['password'] ?? '', // Return password if provided
                    'designation' => $data['designation'],
                    'customerId' => $data['customerId'] ?? ''
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Employee not found or no changes made']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// Handle DELETE request to remove an employee
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get the employee ID from the URL parameter
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if (!$id || $id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid employee ID provided']);
        exit;
    }
    
    // Prepare and execute the delete query
    $stmt = $conn->prepare("DELETE FROM employees WHERE id = ?");
    
    if ($stmt === false) {
        echo json_encode(['success' => false, 'message' => 'Failed to prepare delete statement: ' . $conn->error]);
        $conn->close();
        exit;
    }
    
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Employee not found or already deleted']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Delete failed: ' . $stmt->error]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// Function to generate automatic customer ID
function generateCustomerId($conn) {
    // Get the current year
    $year = date('Y');
    
    // Get the count of employees for this year
    $sql = "SELECT COUNT(*) as count FROM employees WHERE customer_id LIKE ?";
    $stmt = $conn->prepare($sql);
    $pattern = $year . '%';
    $stmt->bind_param("s", $pattern);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $count = $row['count'] + 1;
    $stmt->close();
    
    // Format: YYYY-XXXX (e.g., 2024-0001)
    return $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
}

// Add handling for PUT methods if needed for full CRUD operations
?>