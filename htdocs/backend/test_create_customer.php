<?php
// Enable error reporting for debugging
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
    die("Database connection failed: " . $conn->connect_error);
}

// Debug function
function debug($message, $data = null) {
    echo "<div style='margin: 10px 0; padding: 10px; background: #f0f0f0; border-left: 4px solid #333;'>";
    echo "<strong>DEBUG:</strong> $message";
    if ($data !== null) {
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
    echo "</div>";
}

// Check if measurements table exists
$tableCheckSql = "SHOW TABLES LIKE 'measurements'";
$tableCheckResult = $conn->query($tableCheckSql);
if ($tableCheckResult->num_rows == 0) {
    die("<h1>Error: 'measurements' table does not exist!</h1>");
}

// Check measurements table structure
$tableStructureSql = "DESCRIBE measurements";
$tableStructureResult = $conn->query($tableStructureSql);
if (!$tableStructureResult) {
    die("<h1>Error: Could not get table structure: " . $conn->error . "</h1>");
}

$columns = [];
while ($row = $tableStructureResult->fetch_assoc()) {
    $columns[] = $row;
}

debug("Measurements table structure", $columns);

// Start transaction
$conn->begin_transaction();

try {
    // Create a test customer with a unique phone number to avoid conflicts
    $customerId = 'CUST-TEST-' . time();
    $name = 'Test Customer';
    $phone = '1234567890' . rand(100, 999); // Add random digits to ensure uniqueness
    
    debug("Attempting to create customer", [
        'id' => $customerId,
        'name' => $name,
        'phone' => $phone
    ]);
    
    // Insert customer
    $insertSql = "INSERT INTO customers (id, name, phone) VALUES (?, ?, ?)";
    $insertStmt = $conn->prepare($insertSql);
    if (!$insertStmt) {
        throw new Exception("Customer prepare failed: " . $conn->error);
    }
    
    $bindResult = $insertStmt->bind_param("sss", $customerId, $name, $phone);
    if (!$bindResult) {
        throw new Exception("Customer binding parameters failed: " . $insertStmt->error);
    }
    
    $executeResult = $insertStmt->execute();
    if (!$executeResult) {
        throw new Exception("Customer execute failed: " . $insertStmt->error);
    }
    
    $insertStmt->close();
    
    // Verify customer was created
    $checkCustomerSql = "SELECT * FROM customers WHERE id = ?";
    $checkCustomerStmt = $conn->prepare($checkCustomerSql);
    $checkCustomerStmt->bind_param("s", $customerId);
    $checkCustomerStmt->execute();
    $checkCustomerResult = $checkCustomerStmt->get_result();
    
    if (!$checkCustomerResult || $checkCustomerResult->num_rows === 0) {
        throw new Exception("Customer was not created successfully");
    }
    
    $customer = $checkCustomerResult->fetch_assoc();
    debug("Customer created successfully", $customer);
    $checkCustomerStmt->close();
    
    debug("Customer created with ID: $customerId");
    
    // Insert measurements
    $insertMeasurementsSql = "INSERT INTO measurements (
        customer_id, full_shoulder, shoulder_width, back_length, back_neck_length,
        armhole_loose_left, armhole_loose_right, hand_length, hand_loose_above_elbow_left, hand_loose_above_elbow_right,
        hand_loose_below_elbow_left, hand_loose_below_elbow_right, front_length, front_neck_length, apex_length, apex_to_apex,
        chest_loose, upper_chest_loose, waist_loose, lehenga_length, waist_length
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; 
    
    $fullShoulder = '15';
    $shoulderWidth = '14';
    $backLength = '16';
    $backNeckLength = '7';
    $armholeLooseLeft = '17';
    $armholeLooseRight = '17';
    $handLength = '22';
    $handLooseAboveElbowLeft = '12';
    $handLooseAboveElbowRight = '12';
    $handLooseBelowElbowLeft = '10';
    $handLooseBelowElbowRight = '10';
    $frontLength = '15';
    $frontNeckLength = '7';
    $apexLength = '10';
    $apexToApex = '7';
    $chestLoose = '36';
    $upperChestLoose = '34';
    $waistLoose = '32';
    $lehengaLength = '40';
    $waistLength = '30';
    
    debug("Measurement values to insert", [
        'customer_id' => $customerId,
        'fullShoulder' => $fullShoulder,
        'shoulderWidth' => $shoulderWidth,
        'backLength' => $backLength,
        'backNeckLength' => $backNeckLength,
        'armholeLooseLeft' => $armholeLooseLeft,
        'armholeLooseRight' => $armholeLooseRight,
        'handLength' => $handLength,
        'handLooseAboveElbowLeft' => $handLooseAboveElbowLeft,
        'handLooseAboveElbowRight' => $handLooseAboveElbowRight,
        'handLooseBelowElbowLeft' => $handLooseBelowElbowLeft,
        'handLooseBelowElbowRight' => $handLooseBelowElbowRight,
        'frontLength' => $frontLength,
        'frontNeckLength' => $frontNeckLength,
        'apexLength' => $apexLength,
        'apexToApex' => $apexToApex,
        'chestLoose' => $chestLoose,
        'upperChestLoose' => $upperChestLoose,
        'waistLoose' => $waistLoose,
        'lehengaLength' => $lehengaLength,
        'waistLength' => $waistLength
    ]);
    
    $insertMeasurementsStmt = $conn->prepare($insertMeasurementsSql);
    if (!$insertMeasurementsStmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $bindResult = $insertMeasurementsStmt->bind_param("sssssssssssssssssssss", 
        $customerId, $fullShoulder, $shoulderWidth, $backLength, $backNeckLength,
        $armholeLooseLeft, $armholeLooseRight, $handLength, $handLooseAboveElbowLeft, $handLooseAboveElbowRight,
        $handLooseBelowElbowLeft, $handLooseBelowElbowRight, $frontLength, $frontNeckLength, $apexLength, $apexToApex,
        $chestLoose, $upperChestLoose, $waistLoose, $lehengaLength, $waistLength);
    
    if (!$bindResult) {
        throw new Exception("Binding parameters failed: " . $insertMeasurementsStmt->error);
    }
    
    $executeResult = $insertMeasurementsStmt->execute();
    if (!$executeResult) {
        throw new Exception("Execute failed: " . $insertMeasurementsStmt->error);
    }
    
    debug("Measurements insert result", $executeResult);
    
    $insertMeasurementsStmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo "<h1>Test Customer Created Successfully</h1>";
    echo "<p>Customer ID: $customerId</p>";
    echo "<p>Name: $name</p>";
    echo "<p>Phone: $phone</p>";
    
    // Check if measurements were inserted
    $measurementsSql = "SELECT * FROM measurements WHERE customer_id = ?";
    $measurementsStmt = $conn->prepare($measurementsSql);
    $measurementsStmt->bind_param("s", $customerId);
    $measurementsStmt->execute();
    $measurementsResult = $measurementsStmt->get_result();
    
    if ($measurementsResult && $measurementsResult->num_rows > 0) {
        $measurements = $measurementsResult->fetch_assoc();
        echo "<h2>Measurements Inserted Successfully</h2>";
        echo "<pre>" . print_r($measurements, true) . "</pre>";
    } else {
        echo "<h2>No Measurements Found</h2>";
        debug("Query executed but no measurements found", [
            'SQL' => $measurementsSql,
            'customer_id' => $customerId,
            'error' => $conn->error
        ]);
        
        // Check if any measurements exist at all
        $allMeasurementsSql = "SELECT COUNT(*) as count FROM measurements";
        $allMeasurementsResult = $conn->query($allMeasurementsSql);
        $allMeasurementsCount = $allMeasurementsResult->fetch_assoc()['count'];
        debug("Total measurements in database", $allMeasurementsCount);
    }
    
    $measurementsStmt->close();
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo "<h1>Error</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
    debug("Exception details", [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}

$conn->close();
?>