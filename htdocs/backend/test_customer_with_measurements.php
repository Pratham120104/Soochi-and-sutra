<?php
// test_customer_with_measurements.php
// This script tests the customer creation with measurements

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to log debug information
function debug($message, $data = null) {
    echo "<div style='margin: 10px 0; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;'>";
    echo "<strong>DEBUG:</strong> $message";
    if ($data !== null) {
        echo "<pre>" . print_r($data, true) . "</pre>";
    }
    echo "</div>";
}

// Generate a unique customer ID and phone for testing
$customerId = 'CUST-TEST-' . time();
$customerPhone = 'TEST-' . time();

// Create test data with measurements
$testData = [
    'id' => $customerId,
    'name' => 'Test Customer With Measurements',
    'phone' => $customerPhone,
    'avatarUrl' => '',
    'measurements' => [
        'fullShoulder' => '15',
        'shoulderWidth' => '14',
        'backLength' => '16',
        'backNeckLength' => '7',
        'armholeLooseLeft' => '5.1',
        'armholeLooseRight' => '5.2',
        'handLength' => '22',
        'handLooseAboveElbowLeft' => '12.1',
        'handLooseAboveElbowRight' => '12.2',
        'handLooseBelowElbowLeft' => '10.1',
        'handLooseBelowElbowRight' => '10.2',
        'frontLength' => '15',
        'frontNeckLength' => '6',
        'apexLength' => '10',
        'apexToApex' => '7',
        'chestLoose' => '4',
        'upperChestLoose' => '3',
        'waistLoose' => '2',
        'lehengaLength' => '40',
        'waistLength' => '15'
    ],
    'blouseDetails' => [
        'opening' => 'Front',
        'doris' => 'Yes',
        'cut' => 'Regular',
        'fastener' => 'Hook',
        'padding' => 'Light',
        'piping' => 'Yes'
    ],
    'images' => [
        'saree' => ['url' => 'test_saree.jpg', 'notes' => 'Test saree notes'],
        'blouseFront' => ['url' => 'test_blouse_front.jpg', 'notes' => 'Test blouse front notes'],
        'blouseBack' => ['url' => 'test_blouse_back.jpg', 'notes' => 'Test blouse back notes'],
        'blouseHand' => ['url' => 'test_blouse_hand.jpg', 'notes' => 'Test blouse hand notes']
    ]
];

// Convert data to JSON
$jsonData = json_encode($testData);

debug("Test data prepared", $testData);

// Set up cURL to make the request
$ch = curl_init('http://localhost/backend/customer-management.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonData)
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

debug("HTTP Response Code", $httpCode);
debug("Response", $response);

// Decode the response
$responseData = json_decode($response, true);
debug("Decoded Response", $responseData);

// Verify the customer was created
if ($responseData && isset($responseData['id']) && $responseData['id'] === $customerId) {
    debug("Customer created successfully with ID: {$responseData['id']}");
    
    // Now fetch the customer to verify measurements were saved
    $ch = curl_init("http://localhost/backend/customer-management.php?id=$customerId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $fetchResponse = curl_exec($ch);
    $fetchHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    debug("Fetch HTTP Response Code", $fetchHttpCode);
    
    $fetchedCustomer = json_decode($fetchResponse, true);
    debug("Fetched Customer Data", $fetchedCustomer);
    
    // Verify measurements
    if (isset($fetchedCustomer['measurements'])) {
        debug("Measurements verification", [
            'Expected' => $testData['measurements'],
            'Actual' => $fetchedCustomer['measurements']
        ]);
        
        $measurementsMatch = true;
        foreach ($testData['measurements'] as $key => $value) {
            if ($fetchedCustomer['measurements'][$key] != $value) {
                debug("Measurement mismatch for $key", [
                    'Expected' => $value,
                    'Actual' => $fetchedCustomer['measurements'][$key]
                ]);
                $measurementsMatch = false;
            }
        }
        
        if ($measurementsMatch) {
            echo "<h2 style='color: green;'>TEST PASSED: All measurements were saved correctly!</h2>";
        } else {
            echo "<h2 style='color: red;'>TEST FAILED: Some measurements did not match!</h2>";
        }
    } else {
        echo "<h2 style='color: red;'>TEST FAILED: No measurements found in fetched customer data!</h2>";
    }
    
    // Verify blouse details
    if (isset($fetchedCustomer['blouseDetails'])) {
        debug("Blouse Details verification", [
            'Expected' => $testData['blouseDetails'],
            'Actual' => $fetchedCustomer['blouseDetails']
        ]);
        
        $blouseDetailsMatch = true;
        foreach ($testData['blouseDetails'] as $key => $value) {
            if ($fetchedCustomer['blouseDetails'][$key] != $value) {
                debug("Blouse detail mismatch for $key", [
                    'Expected' => $value,
                    'Actual' => $fetchedCustomer['blouseDetails'][$key]
                ]);
                $blouseDetailsMatch = false;
            }
        }
        
        if ($blouseDetailsMatch) {
            echo "<h2 style='color: green;'>TEST PASSED: All blouse details were saved correctly!</h2>";
        } else {
            echo "<h2 style='color: red;'>TEST FAILED: Some blouse details did not match!</h2>";
        }
    } else {
        echo "<h2 style='color: red;'>TEST FAILED: No blouse details found in fetched customer data!</h2>";
    }
    
    // Verify images
    if (isset($fetchedCustomer['images'])) {
        debug("Images verification", [
            'Expected' => $testData['images'],
            'Actual' => $fetchedCustomer['images']
        ]);
        
        $imagesMatch = true;
        foreach ($testData['images'] as $key => $value) {
            if (!isset($fetchedCustomer['images'][$key]) || 
                $fetchedCustomer['images'][$key]['url'] != $value['url'] || 
                $fetchedCustomer['images'][$key]['notes'] != $value['notes']) {
                debug("Image mismatch for $key", [
                    'Expected' => $value,
                    'Actual' => $fetchedCustomer['images'][$key] ?? 'Not found'
                ]);
                $imagesMatch = false;
            }
        }
        
        if ($imagesMatch) {
            echo "<h2 style='color: green;'>TEST PASSED: All images were saved correctly!</h2>";
        } else {
            echo "<h2 style='color: red;'>TEST FAILED: Some images did not match!</h2>";
        }
    } else {
        echo "<h2 style='color: red;'>TEST FAILED: No images found in fetched customer data!</h2>";
    }
} else {
    echo "<h2 style='color: red;'>TEST FAILED: Customer creation failed!</h2>";
    if ($responseData && isset($responseData['message'])) {
        debug("Error message", $responseData['message']);
    }
}
?>