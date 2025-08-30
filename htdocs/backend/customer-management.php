<?php
// backend/customer-management.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Be more restrictive in production
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Enable error reporting for debugging (REMOVE IN PRODUCTION)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle GET request to fetch all customers
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id']) && !isset($_GET['phone'])) {
    $sql = "SELECT c.id, c.name, c.phone, c.avatar_url, c.last_updated, c.address, c.due_date,
                  o.status as order_status
           FROM customers c
           LEFT JOIN orders o ON c.id = o.customer_id AND o.id = (
               SELECT id FROM orders WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1
           )";
    $result = $conn->query($sql);

    $customers = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Get measurements for this customer
            $measurementsSql = "SELECT * FROM measurements WHERE customer_id = ?";
            $measurementsStmt = $conn->prepare($measurementsSql);
            $measurementsStmt->bind_param("s", $row['id']);
            $measurementsStmt->execute();
            $measurementsResult = $measurementsStmt->get_result();
            $measurements = $measurementsResult->fetch_assoc() ?: [];
            $measurementsStmt->close();
            
            // Get blouse details for this customer
            $blouseDetailsSql = "SELECT * FROM blouse_details WHERE customer_id = ?";
            $blouseDetailsStmt = $conn->prepare($blouseDetailsSql);
            $blouseDetailsStmt->bind_param("s", $row['id']);
            $blouseDetailsStmt->execute();
            $blouseDetailsResult = $blouseDetailsStmt->get_result();
            $blouseDetails = $blouseDetailsResult->fetch_assoc() ?: [];
            $blouseDetailsStmt->close();
            
            // Get images for this customer
            $imagesSql = "SELECT image_type, url, notes FROM customer_images WHERE customer_id = ?";
            $imagesStmt = $conn->prepare($imagesSql);
            $imagesStmt->bind_param("s", $row['id']);
            $imagesStmt->execute();
            $imagesResult = $imagesStmt->get_result();
            $images = [];
            while ($imageRow = $imagesResult->fetch_assoc()) {
                $images[$imageRow['image_type']] = [
                    'url' => $imageRow['url'],
                    'notes' => $imageRow['notes']
                ];
            }
            $imagesStmt->close();
            
            // Format the customer data to match the frontend structure
            $customers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'phone' => $row['phone'],
                'avatarUrl' => $row['avatar_url'],
                'address' => $row['address'] ?? '',
                'dueDate' => $row['due_date'] ?? null,
                'orderStatus' => $row['order_status'] ?: 'Pending',
                'lastUpdated' => $row['last_updated'],
                'measurements' => [
                    'fullShoulder' => $measurements['full_shoulder'] ?? '',
                    'shoulderWidth' => $measurements['shoulder_width'] ?? '',
                    'backLength' => $measurements['back_length'] ?? '',
                    'backNeckLength' => $measurements['back_neck_length'] ?? '',
                    'armholeLooseLeft' => $measurements['armhole_loose_left'] ?? '',
                    'armholeLooseRight' => $measurements['armhole_loose_right'] ?? '',
                    'handLength' => $measurements['hand_length'] ?? '',
                    'handLooseAboveElbowLeft' => $measurements['hand_loose_above_elbow_left'] ?? '',
                    'handLooseAboveElbowRight' => $measurements['hand_loose_above_elbow_right'] ?? '',
                    'handLooseBelowElbowLeft' => $measurements['hand_loose_below_elbow_left'] ?? '',
                    'handLooseBelowElbowRight' => $measurements['hand_loose_below_elbow_right'] ?? '',
                    'frontLength' => $measurements['front_length'] ?? '',
                    'frontNeckLength' => $measurements['front_neck_length'] ?? '',
                    'apexLength' => $measurements['apex_length'] ?? '',
                    'apexToApex' => $measurements['apex_to_apex'] ?? '',
                    'chestLoose' => $measurements['chest_loose'] ?? '',
                    'upperChestLoose' => $measurements['upper_chest_loose'] ?? '',
                    'waistLoose' => $measurements['waist_loose'] ?? '',
                    'lehengaLength' => $measurements['lehenga_length'] ?? '',
                    'waistLength' => $measurements['waist_length'] ?? '',
                ],
                'blouseDetails' => [
                    'opening' => $blouseDetails['opening'] ?? '',
                    'doris' => $blouseDetails['doris'] ?? '',
                    'cut' => $blouseDetails['cut'] ?? '',
                    'fastener' => $blouseDetails['fastener'] ?? '',
                    'padding' => $blouseDetails['padding'] ?? '',
                    'piping' => $blouseDetails['piping'] ?? '',
                ],
                'images' => [
                    'saree' => $images['saree'] ?? ['url' => '', 'notes' => ''],
                    'blouseFront' => $images['blouseFront'] ?? ['url' => '', 'notes' => ''],
                    'blouseBack' => $images['blouseBack'] ?? ['url' => '', 'notes' => ''],
                    'blouseHand' => $images['blouseHand'] ?? ['url' => '', 'notes' => ''],
                ]
            ];
        }
    }
    
    echo json_encode($customers);
    $conn->close();
    exit;
}

// Handle GET request to fetch a specific customer by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "SELECT c.id, c.name, c.phone, c.avatar_url, c.last_updated, c.address, c.due_date,
                  o.status as order_status
           FROM customers c
           LEFT JOIN orders o ON c.id = o.customer_id AND o.id = (
               SELECT id FROM orders WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1
           )
           WHERE c.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Get measurements for this customer
        $measurementsSql = "SELECT * FROM measurements WHERE customer_id = ?";
        $measurementsStmt = $conn->prepare($measurementsSql);
        $measurementsStmt->bind_param("s", $id);
        $measurementsStmt->execute();
        $measurementsResult = $measurementsStmt->get_result();
        $measurements = $measurementsResult->fetch_assoc() ?: [];
        $measurementsStmt->close();
        
        // Get blouse details for this customer
        $blouseDetailsSql = "SELECT * FROM blouse_details WHERE customer_id = ?";
        $blouseDetailsStmt = $conn->prepare($blouseDetailsSql);
        $blouseDetailsStmt->bind_param("s", $id);
        $blouseDetailsStmt->execute();
        $blouseDetailsResult = $blouseDetailsStmt->get_result();
        $blouseDetails = $blouseDetailsResult->fetch_assoc() ?: [];
        $blouseDetailsStmt->close();
        
        // Get images for this customer
        $imagesSql = "SELECT image_type, url, notes FROM customer_images WHERE customer_id = ?";
        $imagesStmt = $conn->prepare($imagesSql);
        $imagesStmt->bind_param("s", $id);
        $imagesStmt->execute();
        $imagesResult = $imagesStmt->get_result();
        $images = [];
        while ($imageRow = $imagesResult->fetch_assoc()) {
            $images[$imageRow['image_type']] = [
                'url' => $imageRow['url'],
                'notes' => $imageRow['notes']
            ];
        }
        $imagesStmt->close();
        
        // Format the customer data to match the frontend structure
        $customer = [
            'id' => $row['id'],
            'name' => $row['name'],
            'phone' => $row['phone'],
            'avatarUrl' => $row['avatar_url'],
            'address' => $row['address'] ?? '',
            'dueDate' => $row['due_date'] ?? null,
            'orderStatus' => $row['order_status'] ?: 'Pending',
            'lastUpdated' => $row['last_updated'],
            'measurements' => [
                'fullShoulder' => $measurements['full_shoulder'] ?? '',
                'shoulderWidth' => $measurements['shoulder_width'] ?? '',
                'backLength' => $measurements['back_length'] ?? '',
                'backNeckLength' => $measurements['back_neck_length'] ?? '',
                'armholeLooseLeft' => $measurements['armhole_loose_left'] ?? '',
                'armholeLooseRight' => $measurements['armhole_loose_right'] ?? '',
                'handLength' => $measurements['hand_length'] ?? '',
                'handLooseAboveElbowLeft' => $measurements['hand_loose_above_elbow_left'] ?? '',
                'handLooseAboveElbowRight' => $measurements['hand_loose_above_elbow_right'] ?? '',
                'handLooseBelowElbowLeft' => $measurements['hand_loose_below_elbow_left'] ?? '',
                'handLooseBelowElbowRight' => $measurements['hand_loose_below_elbow_right'] ?? '',
                'frontLength' => $measurements['front_length'] ?? '',
                'frontNeckLength' => $measurements['front_neck_length'] ?? '',
                'apexLength' => $measurements['apex_length'] ?? '',
                'apexToApex' => $measurements['apex_to_apex'] ?? '',
                'chestLoose' => $measurements['chest_loose'] ?? '',
                'upperChestLoose' => $measurements['upper_chest_loose'] ?? '',
                'waistLoose' => $measurements['waist_loose'] ?? '',
                'lehengaLength' => $measurements['lehenga_length'] ?? '',
                'waistLength' => $measurements['waist_length'] ?? '',
            ],
            'blouseDetails' => [
                'opening' => $blouseDetails['opening'] ?? '',
                'doris' => $blouseDetails['doris'] ?? '',
                'cut' => $blouseDetails['cut'] ?? '',
                'fastener' => $blouseDetails['fastener'] ?? '',
                'padding' => $blouseDetails['padding'] ?? '',
                'piping' => $blouseDetails['piping'] ?? '',
            ],
            'images' => [
                'saree' => $images['saree'] ?? ['url' => '', 'notes' => ''],
                'blouseFront' => $images['blouseFront'] ?? ['url' => '', 'notes' => ''],
                'blouseBack' => $images['blouseBack'] ?? ['url' => '', 'notes' => ''],
                'blouseHand' => $images['blouseHand'] ?? ['url' => '', 'notes' => ''],
            ]
        ];
        
        echo json_encode($customer);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// Handle GET request to fetch a specific customer by phone number
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['phone'])) {
    $phone = $_GET['phone'];
    $sql = "SELECT c.id, c.name, c.phone, c.avatar_url, c.last_updated, c.address, c.due_date,
                  o.status as order_status
           FROM customers c
           LEFT JOIN orders o ON c.id = o.customer_id AND o.id = (
               SELECT id FROM orders WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1
           )
           WHERE c.phone = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $phone);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $id = $row['id'];
        
        // Get measurements for this customer
        $measurementsSql = "SELECT * FROM measurements WHERE customer_id = ?";
        $measurementsStmt = $conn->prepare($measurementsSql);
        $measurementsStmt->bind_param("s", $id);
        $measurementsStmt->execute();
        $measurementsResult = $measurementsStmt->get_result();
        $measurements = $measurementsResult->fetch_assoc() ?: [];
        $measurementsStmt->close();
        
        // Get blouse details for this customer
        $blouseDetailsSql = "SELECT * FROM blouse_details WHERE customer_id = ?";
        $blouseDetailsStmt = $conn->prepare($blouseDetailsSql);
        $blouseDetailsStmt->bind_param("s", $id);
        $blouseDetailsStmt->execute();
        $blouseDetailsResult = $blouseDetailsStmt->get_result();
        $blouseDetails = $blouseDetailsResult->fetch_assoc() ?: [];
        $blouseDetailsStmt->close();
        
        // Get images for this customer
        $imagesSql = "SELECT image_type, url, notes FROM customer_images WHERE customer_id = ?";
        $imagesStmt = $conn->prepare($imagesSql);
        $imagesStmt->bind_param("s", $id);
        $imagesStmt->execute();
        $imagesResult = $imagesStmt->get_result();
        $images = [];
        while ($imageRow = $imagesResult->fetch_assoc()) {
            $images[$imageRow['image_type']] = [
                'url' => $imageRow['url'],
                'notes' => $imageRow['notes']
            ];
        }
        $imagesStmt->close();
        
        // Format the customer data to match the frontend structure
        $customer = [
            'id' => $row['id'],
            'name' => $row['name'],
            'phone' => $row['phone'],
            'avatarUrl' => $row['avatar_url'],
            'address' => $row['address'] ?? '',
            'dueDate' => $row['due_date'] ?? null,
            'orderStatus' => $row['order_status'] ?: 'Pending',
            'lastUpdated' => $row['last_updated'],
            'measurements' => [
                'fullShoulder' => $measurements['full_shoulder'] ?? '',
                'shoulderWidth' => $measurements['shoulder_width'] ?? '',
                'backLength' => $measurements['back_length'] ?? '',
                'backNeckLength' => $measurements['back_neck_length'] ?? '',
                'armholeLooseLeft' => $measurements['armhole_loose_left'] ?? '',
                'armholeLooseRight' => $measurements['armhole_loose_right'] ?? '',
                'handLength' => $measurements['hand_length'] ?? '',
                'handLooseAboveElbowLeft' => $measurements['hand_loose_above_elbow_left'] ?? '',
                'handLooseAboveElbowRight' => $measurements['hand_loose_above_elbow_right'] ?? '',
                'handLooseBelowElbowLeft' => $measurements['hand_loose_below_elbow_left'] ?? '',
                'handLooseBelowElbowRight' => $measurements['hand_loose_below_elbow_right'] ?? '',
                'frontLength' => $measurements['front_length'] ?? '',
                'frontNeckLength' => $measurements['front_neck_length'] ?? '',
                'apexLength' => $measurements['apex_length'] ?? '',
                'apexToApex' => $measurements['apex_to_apex'] ?? '',
                'chestLoose' => $measurements['chest_loose'] ?? '',
                'upperChestLoose' => $measurements['upper_chest_loose'] ?? '',
                'waistLoose' => $measurements['waist_loose'] ?? '',
                'lehengaLength' => $measurements['lehenga_length'] ?? '',
                'waistLength' => $measurements['waist_length'] ?? '',
            ],
            'blouseDetails' => [
                'opening' => $blouseDetails['opening'] ?? '',
                'doris' => $blouseDetails['doris'] ?? '',
                'cut' => $blouseDetails['cut'] ?? '',
                'fastener' => $blouseDetails['fastener'] ?? '',
                'padding' => $blouseDetails['padding'] ?? '',
                'piping' => $blouseDetails['piping'] ?? '',
            ],
            'images' => [
                'saree' => $images['saree'] ?? ['url' => '', 'notes' => ''],
                'blouseFront' => $images['blouseFront'] ?? ['url' => '', 'notes' => ''],
                'blouseBack' => $images['blouseBack'] ?? ['url' => '', 'notes' => ''],
                'blouseHand' => $images['blouseHand'] ?? ['url' => '', 'notes' => ''],
            ]
        ];
        
        echo json_encode($customer);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Customer not found']);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// Handle POST request to create a new customer
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the POSTed JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input or empty request body.']);
        exit;
    }

    // Validate required fields
    if (!isset($data['id']) || !isset($data['name']) || !isset($data['phone'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields: id, name, phone']);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Check if customer already exists
        $checkSql = "SELECT id FROM customers WHERE id = ? OR phone = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ss", $data['id'], $data['phone']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // Customer exists, update basic info
            $updateSql = "UPDATE customers SET name = ?, avatar_url = ?, address = ?, due_date = ? WHERE id = ? OR phone = ?";
            $updateStmt = $conn->prepare($updateSql);
            $avatarUrl = $data['avatarUrl'] ?? '';
            $address = $data['address'] ?? '';
            $dueDate = $data['dueDate'] ?? null;
            $updateStmt->bind_param("ssssss", $data['name'], $avatarUrl, $address, $dueDate, $data['id'], $data['phone']);
            $updateStmt->execute();
            $updateStmt->close();
            
            // Get the existing customer ID
            $existingCustomer = $checkResult->fetch_assoc();
            $customerId = $existingCustomer['id'];
        } else {
            // Insert new customer
            $insertSql = "INSERT INTO customers (id, name, phone, avatar_url, address, due_date) VALUES (?, ?, ?, ?, ?, ?)";
            $insertStmt = $conn->prepare($insertSql);
            $avatarUrl = $data['avatarUrl'] ?? '';
            $address = $data['address'] ?? '';
            $dueDate = $data['dueDate'] ?? null;
            $insertStmt->bind_param("ssssss", $data['id'], $data['name'], $data['phone'], $avatarUrl, $address, $dueDate);
            $insertStmt->execute();
            $insertStmt->close();
            
            $customerId = $data['id'];
        }
        
        $checkStmt->close();
        
        // Process measurements if provided
        if (isset($data['measurements'])) {
            $measurements = $data['measurements'];
            
            // Check if measurements exist for this customer
            $checkMeasurementsSql = "SELECT id FROM measurements WHERE customer_id = ?";
            $checkMeasurementsStmt = $conn->prepare($checkMeasurementsSql);
            $checkMeasurementsStmt->bind_param("s", $customerId);
            $checkMeasurementsStmt->execute();
            $checkMeasurementsResult = $checkMeasurementsStmt->get_result();
            
            if ($checkMeasurementsResult->num_rows > 0) {
                // Update existing measurements
                $updateMeasurementsSql = "UPDATE measurements SET 
                    full_shoulder = ?, shoulder_width = ?, back_length = ?, back_neck_length = ?,
                    armhole_loose_left = ?, armhole_loose_right = ?, 
                    hand_length = ?, hand_loose_above_elbow_left = ?, hand_loose_above_elbow_right = ?, 
                    hand_loose_below_elbow_left = ?, hand_loose_below_elbow_right = ?,
                    front_length = ?, front_neck_length = ?, apex_length = ?, apex_to_apex = ?,
                    chest_loose = ?, upper_chest_loose = ?, waist_loose = ?, lehenga_length = ?, waist_length = ?
                    WHERE customer_id = ?";
                $updateMeasurementsStmt = $conn->prepare($updateMeasurementsSql);
                $updateMeasurementsStmt->bind_param("sssssssssssssssssssss", 
                    $measurements['fullShoulder'], $measurements['shoulderWidth'], $measurements['backLength'], $measurements['backNeckLength'],
                    $measurements['armholeLooseLeft'], $measurements['armholeLooseRight'],
                    $measurements['handLength'], $measurements['handLooseAboveElbowLeft'], $measurements['handLooseAboveElbowRight'],
                    $measurements['handLooseBelowElbowLeft'], $measurements['handLooseBelowElbowRight'],
                    $measurements['frontLength'], $measurements['frontNeckLength'], $measurements['apexLength'], $measurements['apexToApex'],
                    $measurements['chestLoose'], $measurements['upperChestLoose'], $measurements['waistLoose'], $measurements['lehengaLength'], $measurements['waistLength'],
                    $customerId);
                $updateMeasurementsStmt->execute();
                $updateMeasurementsStmt->close();
            } else {
                // Insert new measurements
                $insertMeasurementsSql = "INSERT INTO measurements (customer_id, full_shoulder, shoulder_width, back_length, back_neck_length,
                    armhole_loose_left, armhole_loose_right, hand_length, hand_loose_above_elbow_left, hand_loose_above_elbow_right,
                    hand_loose_below_elbow_left, hand_loose_below_elbow_right, front_length, front_neck_length, apex_length, apex_to_apex,
                    chest_loose, upper_chest_loose, waist_loose, lehenga_length, waist_length) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $insertMeasurementsStmt = $conn->prepare($insertMeasurementsSql);
                $insertMeasurementsStmt->bind_param("sssssssssssssssssssss", 
                    $customerId, $measurements['fullShoulder'], $measurements['shoulderWidth'], $measurements['backLength'], $measurements['backNeckLength'],
                    $measurements['armholeLooseLeft'], $measurements['armholeLooseRight'],
                    $measurements['handLength'], $measurements['handLooseAboveElbowLeft'], $measurements['handLooseAboveElbowRight'],
                    $measurements['handLooseBelowElbowLeft'], $measurements['handLooseBelowElbowRight'],
                    $measurements['frontLength'], $measurements['frontNeckLength'], $measurements['apexLength'], $measurements['apexToApex'],
                    $measurements['chestLoose'], $measurements['upperChestLoose'], $measurements['waistLoose'], $measurements['lehengaLength'], $measurements['waistLength']);
                $insertMeasurementsStmt->execute();
                $insertMeasurementsStmt->close();
            }
            
            $checkMeasurementsStmt->close();
        }
        
        // Process blouse details if provided
        if (isset($data['blouseDetails'])) {
            $blouseDetails = $data['blouseDetails'];
            
            // Check if blouse details exist for this customer
            $checkBlouseDetailsSql = "SELECT id FROM blouse_details WHERE customer_id = ?";
            $checkBlouseDetailsStmt = $conn->prepare($checkBlouseDetailsSql);
            $checkBlouseDetailsStmt->bind_param("s", $customerId);
            $checkBlouseDetailsStmt->execute();
            $checkBlouseDetailsResult = $checkBlouseDetailsStmt->get_result();
            
            if ($checkBlouseDetailsResult->num_rows > 0) {
                // Update existing blouse details
                $updateBlouseDetailsSql = "UPDATE blouse_details SET 
                    opening = ?, doris = ?, cut = ?, fastener = ?, padding = ?, piping = ?
                    WHERE customer_id = ?";
                $updateBlouseDetailsStmt = $conn->prepare($updateBlouseDetailsSql);
                $updateBlouseDetailsStmt->bind_param("sssssss", 
                    $blouseDetails['opening'], $blouseDetails['doris'], $blouseDetails['cut'], 
                    $blouseDetails['fastener'], $blouseDetails['padding'], $blouseDetails['piping'],
                    $customerId);
                $updateBlouseDetailsStmt->execute();
                $updateBlouseDetailsStmt->close();
            } else {
                // Insert new blouse details
                $insertBlouseDetailsSql = "INSERT INTO blouse_details (
                    customer_id, opening, doris, cut, fastener, padding, piping
                ) VALUES (?, ?, ?, ?, ?, ?, ?)";
                $insertBlouseDetailsStmt = $conn->prepare($insertBlouseDetailsSql);
                $insertBlouseDetailsStmt->bind_param("sssssss", 
                    $customerId, $blouseDetails['opening'], $blouseDetails['doris'], $blouseDetails['cut'], 
                    $blouseDetails['fastener'], $blouseDetails['padding'], $blouseDetails['piping']);
                $insertBlouseDetailsStmt->execute();
                $insertBlouseDetailsStmt->close();
            }
            
            $checkBlouseDetailsStmt->close();
        }
        
        // Process images if provided
        if (isset($data['images'])) {
            $images = $data['images'];
            
            // Process each image type
            $imageTypes = ['saree', 'blouseFront', 'blouseBack', 'blouseHand'];
            
            foreach ($imageTypes as $imageType) {
                if (isset($images[$imageType]) && !empty($images[$imageType]['url'])) {
                    $image = $images[$imageType];
                    
                    // Check if this image type exists for this customer
                    $checkImageSql = "SELECT id FROM customer_images WHERE customer_id = ? AND image_type = ?";
                    $checkImageStmt = $conn->prepare($checkImageSql);
                    $checkImageStmt->bind_param("ss", $customerId, $imageType);
                    $checkImageStmt->execute();
                    $checkImageResult = $checkImageStmt->get_result();
                    
                    if ($checkImageResult->num_rows > 0) {
                        // Update existing image
                        $updateImageSql = "UPDATE customer_images SET url = ?, notes = ? WHERE customer_id = ? AND image_type = ?";
                        $updateImageStmt = $conn->prepare($updateImageSql);
                        $updateImageStmt->bind_param("ssss", $image['url'], $image['notes'], $customerId, $imageType);
                        $updateImageStmt->execute();
                        $updateImageStmt->close();
                    } else {
                        // Insert new image
                        $insertImageSql = "INSERT INTO customer_images (customer_id, image_type, url, notes) VALUES (?, ?, ?, ?)";
                        $insertImageStmt = $conn->prepare($insertImageSql);
                        $insertImageStmt->bind_param("ssss", $customerId, $imageType, $image['url'], $image['notes']);
                        $insertImageStmt->execute();
                        $insertImageStmt->close();
                    }
                    
                    $checkImageStmt->close();
                }
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        // Return the customer data
        echo json_encode([
            'id' => $customerId,
            'name' => $data['name'],
            'phone' => $data['phone'],
            'avatarUrl' => $data['avatarUrl'] ?? '',
            'orderStatus' => 'Pending',
            'lastUpdated' => date('Y-m-d H:i:s'),
            'measurements' => [],
            'blouseDetails' => [],
            'images' => [
                'saree' => ['url' => '', 'notes' => ''],
                'blouseFront' => ['url' => '', 'notes' => ''],
                'blouseBack' => ['url' => '', 'notes' => ''],
                'blouseHand' => ['url' => '', 'notes' => ''],
            ]
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error creating customer: ' . $e->getMessage()]);
    }
    
    $conn->close();
    exit;
}

// Handle PUT request to update a customer
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get the PUTed JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input or missing customer ID.']);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update customer basic info
        $name = $data['name'];
        $phone = $data['phone'];
        $avatarUrl = $data['avatarUrl'] ?? '';
        $address = $data['address'] ?? '';
        $dueDate = $data['dueDate'] ?? null;
        $id = $data['id'];
        
        // First check if this phone number already exists for a different customer
        $checkPhoneSql = "SELECT id FROM customers WHERE phone = '$phone' AND id != '$id'";
        $checkPhoneResult = $conn->query($checkPhoneSql);
        
        if ($checkPhoneResult->num_rows > 0) {
            // Use the existing phone number from the database
            $getExistingPhoneSql = "SELECT phone FROM customers WHERE id = '$id'";
            $existingPhoneResult = $conn->query($getExistingPhoneSql);
            $existingPhoneRow = $existingPhoneResult->fetch_assoc();
            $phone = $existingPhoneRow['phone'];
        }
        
        // Use prepared statement to properly handle NULL values
        $updateSql = "UPDATE customers SET name = ?, phone = ?, avatar_url = ?, address = ?, due_date = ?, last_updated = NOW() WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        
        // Convert empty string to NULL for address and dueDate
        $addressParam = empty($address) ? null : $address;
        $dueDateParam = empty($dueDate) ? null : $dueDate;
        
        // Bind parameters with appropriate types
        $updateStmt->bind_param("ssssss", $name, $phone, $avatarUrl, $addressParam, $dueDateParam, $id);
        $result = $updateStmt->execute();
        
        if (!$result) {
            throw new Exception("Error updating customer: " . $updateStmt->error);
        }
        
        $updateStmt->close();
        
        if (!$result) {
            throw new Exception("Error updating customer: " . $conn->error);
        }
        
        // Update or insert measurements
        if (isset($data['measurements'])) {
            $measurements = $data['measurements'];
            
            // Check if measurements exist for this customer
            $checkMeasurementsSql = "SELECT id FROM measurements WHERE customer_id = ?";
            $checkMeasurementsStmt = $conn->prepare($checkMeasurementsSql);
            $checkMeasurementsStmt->bind_param("s", $data['id']);
            $checkMeasurementsStmt->execute();
            $checkMeasurementsResult = $checkMeasurementsStmt->get_result();
            
            if ($checkMeasurementsResult->num_rows > 0) {
                // Update existing measurements
                $updateMeasurementsSql = "UPDATE measurements SET 
                    full_shoulder = ?, shoulder_width = ?, back_length = ?, back_neck_length = ?,
                    armhole_loose_left = ?, armhole_loose_right = ?, 
                    hand_length = ?, hand_loose_above_elbow_left = ?, hand_loose_above_elbow_right = ?, 
                    hand_loose_below_elbow_left = ?, hand_loose_below_elbow_right = ?,
                    front_length = ?, front_neck_length = ?, apex_length = ?, apex_to_apex = ?,
                    chest_loose = ?, upper_chest_loose = ?, waist_loose = ?, lehenga_length = ?, waist_length = ?,
                    last_updated = NOW()
                    WHERE customer_id = ?";
                $updateMeasurementsStmt = $conn->prepare($updateMeasurementsSql);
                $updateMeasurementsStmt->bind_param("sssssssssssssssssssss", 
                    $measurements['fullShoulder'], $measurements['shoulderWidth'], $measurements['backLength'], $measurements['backNeckLength'],
                    $measurements['armholeLooseLeft'], $measurements['armholeLooseRight'],
                    $measurements['handLength'], $measurements['handLooseAboveElbowLeft'], $measurements['handLooseAboveElbowRight'],
                    $measurements['handLooseBelowElbowLeft'], $measurements['handLooseBelowElbowRight'],
                    $measurements['frontLength'], $measurements['frontNeckLength'], $measurements['apexLength'], $measurements['apexToApex'],
                    $measurements['chestLoose'], $measurements['upperChestLoose'], $measurements['waistLoose'], $measurements['lehengaLength'], $measurements['waistLength'],
                    $data['id']);
                $updateMeasurementsStmt->execute();
                $updateMeasurementsStmt->close();
                
                // Also update the last_updated field in customers table
                $updateCustomerSql = "UPDATE customers SET last_updated = NOW() WHERE id = ?";
                $updateCustomerStmt = $conn->prepare($updateCustomerSql);
                $updateCustomerStmt->bind_param("s", $data['id']);
                $updateCustomerStmt->execute();
                $updateCustomerStmt->close();
            } else {
                // Insert new measurements
                $insertMeasurementsSql = "INSERT INTO measurements (
                    customer_id, full_shoulder, shoulder_width, back_length, back_neck_length,
                    armhole_loose_left, armhole_loose_right, hand_length, hand_loose_above_elbow_left, hand_loose_above_elbow_right,
                    hand_loose_below_elbow_left, hand_loose_below_elbow_right, front_length, front_neck_length, apex_length, apex_to_apex,
                    chest_loose, upper_chest_loose, waist_loose, lehenga_length, waist_length
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $insertMeasurementsStmt = $conn->prepare($insertMeasurementsSql);
                $insertMeasurementsStmt->bind_param("sssssssssssssssssssss", 
                    $data['id'], $measurements['fullShoulder'], $measurements['shoulderWidth'], $measurements['backLength'], $measurements['backNeckLength'],
                    $measurements['armholeLooseLeft'], $measurements['armholeLooseRight'],
                    $measurements['handLength'], $measurements['handLooseAboveElbowLeft'], $measurements['handLooseAboveElbowRight'],
                    $measurements['handLooseBelowElbowLeft'], $measurements['handLooseBelowElbowRight'],
                    $measurements['frontLength'], $measurements['frontNeckLength'], $measurements['apexLength'], $measurements['apexToApex'],
                    $measurements['chestLoose'], $measurements['upperChestLoose'], $measurements['waistLoose'], $measurements['lehengaLength'], $measurements['waistLength']);
                $insertMeasurementsStmt->execute();
                $insertMeasurementsStmt->close();
                
                // Also update the last_updated field in customers table
                $updateCustomerSql = "UPDATE customers SET last_updated = NOW() WHERE id = ?";
                $updateCustomerStmt = $conn->prepare($updateCustomerSql);
                $updateCustomerStmt->bind_param("s", $data['id']);
                $updateCustomerStmt->execute();
                $updateCustomerStmt->close();
            }
            
            $checkMeasurementsStmt->close();
        }
        
        // Update or insert blouse details
        if (isset($data['blouseDetails'])) {
            $blouseDetails = $data['blouseDetails'];
            
            // Check if blouse details exist for this customer
            $checkBlouseDetailsSql = "SELECT id FROM blouse_details WHERE customer_id = ?";
            $checkBlouseDetailsStmt = $conn->prepare($checkBlouseDetailsSql);
            $checkBlouseDetailsStmt->bind_param("s", $data['id']);
            $checkBlouseDetailsStmt->execute();
            $checkBlouseDetailsResult = $checkBlouseDetailsStmt->get_result();
            
            if ($checkBlouseDetailsResult->num_rows > 0) {
                // Update existing blouse details
                $updateBlouseDetailsSql = "UPDATE blouse_details SET 
                    opening = ?, doris = ?, cut = ?, fastener = ?, padding = ?, piping = ?
                    WHERE customer_id = ?";
                $updateBlouseDetailsStmt = $conn->prepare($updateBlouseDetailsSql);
                $updateBlouseDetailsStmt->bind_param("sssssss", 
                    $blouseDetails['opening'], $blouseDetails['doris'], $blouseDetails['cut'], 
                    $blouseDetails['fastener'], $blouseDetails['padding'], $blouseDetails['piping'],
                    $data['id']);
                $updateBlouseDetailsStmt->execute();
                $updateBlouseDetailsStmt->close();
            } else {
                // Insert new blouse details
                $insertBlouseDetailsSql = "INSERT INTO blouse_details (
                    customer_id, opening, doris, cut, fastener, padding, piping
                ) VALUES (?, ?, ?, ?, ?, ?, ?)";
                $insertBlouseDetailsStmt = $conn->prepare($insertBlouseDetailsSql);
                $insertBlouseDetailsStmt->bind_param("sssssss", 
                    $data['id'], $blouseDetails['opening'], $blouseDetails['doris'], $blouseDetails['cut'], 
                    $blouseDetails['fastener'], $blouseDetails['padding'], $blouseDetails['piping']);
                $insertBlouseDetailsStmt->execute();
                $insertBlouseDetailsStmt->close();
            }
            
            $checkBlouseDetailsStmt->close();
        }
        
        // Update or insert images
        if (isset($data['images'])) {
            $images = $data['images'];
            
            // Process each image type
            $imageTypes = ['saree', 'blouseFront', 'blouseBack', 'blouseHand'];
            
            foreach ($imageTypes as $imageType) {
                if (isset($images[$imageType])) {
                    $image = $images[$imageType];
                    
                    // Check if this image type exists for this customer
                    $checkImageSql = "SELECT id FROM customer_images WHERE customer_id = ? AND image_type = ?";
                    $checkImageStmt = $conn->prepare($checkImageSql);
                    $checkImageStmt->bind_param("ss", $data['id'], $imageType);
                    $checkImageStmt->execute();
                    $checkImageResult = $checkImageStmt->get_result();
                    
                    if ($checkImageResult->num_rows > 0) {
                        // Update existing image
                        $updateImageSql = "UPDATE customer_images SET url = ?, notes = ? WHERE customer_id = ? AND image_type = ?";
                        $updateImageStmt = $conn->prepare($updateImageSql);
                        $updateImageStmt->bind_param("ssss", $image['url'], $image['notes'], $data['id'], $imageType);
                        $updateImageStmt->execute();
                        $updateImageStmt->close();
                    } else {
                        // Insert new image
                        $insertImageSql = "INSERT INTO customer_images (customer_id, image_type, url, notes) VALUES (?, ?, ?, ?)";
                        $insertImageStmt = $conn->prepare($insertImageSql);
                        $insertImageStmt->bind_param("ssss", $data['id'], $imageType, $image['url'], $image['notes']);
                        $insertImageStmt->execute();
                        $insertImageStmt->close();
                    }
                    
                    $checkImageStmt->close();
                }
            }
        }
        
        // Update or create order if order status is provided
        if (isset($data['orderStatus'])) {
            // Check if there's an existing order for this customer
            $checkOrderSql = "SELECT id FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1";
            $checkOrderStmt = $conn->prepare($checkOrderSql);
            $checkOrderStmt->bind_param("s", $data['id']);
            $checkOrderStmt->execute();
            $checkOrderResult = $checkOrderStmt->get_result();
            
            if ($checkOrderResult->num_rows > 0) {
                // Update existing order
                $orderRow = $checkOrderResult->fetch_assoc();
                $updateOrderSql = "UPDATE orders SET status = ? WHERE id = ?";
                $updateOrderStmt = $conn->prepare($updateOrderSql);
                $updateOrderStmt->bind_param("ss", $data['orderStatus'], $orderRow['id']);
                $updateOrderStmt->execute();
                $updateOrderStmt->close();
            } else {
                // Create new order with generated ID
                $orderId = 'ORD-' . time();
                $insertOrderSql = "INSERT INTO orders (id, customer_id, status) VALUES (?, ?, ?)";
                $insertOrderStmt = $conn->prepare($insertOrderSql);
                $insertOrderStmt->bind_param("sss", $orderId, $data['id'], $data['orderStatus']);
                $insertOrderStmt->execute();
                $insertOrderStmt->close();
            }
            
            $checkOrderStmt->close();
        }
        
        // Commit transaction
        $conn->commit();
        
        // Return success with updated customer data
        echo json_encode([
            'success' => true,
            'message' => 'Customer updated successfully',
            'id' => $data['id'],
            'name' => $data['name'],
            'phone' => $data['phone'],
            'address' => $address,
            'dueDate' => $dueDate,
            'avatarUrl' => $avatarUrl,
            'lastUpdated' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating customer: ' . $e->getMessage()]);
    }
    
    $conn->close();
    exit;
}

// Handle DELETE request to delete a customer
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get the customer ID from the URL parameter
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing customer ID']);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Delete customer (cascade will delete related records)
        $deleteSql = "DELETE FROM customers WHERE id = ?";
        $deleteStmt = $conn->prepare($deleteSql);
        $deleteStmt->bind_param("s", $id);
        $deleteStmt->execute();
        
        if ($deleteStmt->affected_rows > 0) {
            // Commit transaction
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Customer deleted successfully']);
        } else {
            // Rollback transaction
            $conn->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Customer not found']);
        }
        
        $deleteStmt->close();
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting customer: ' . $e->getMessage()]);
    }
    
    $conn->close();
    exit;
}

// If we get here, the request method is not supported
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>