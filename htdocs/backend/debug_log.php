<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to log messages
function logMessage($message) {
    $logFile = __DIR__ . '/debug_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Log the request method
logMessage("Request Method: " . $_SERVER['REQUEST_METHOD']);

// Log raw POST data
$rawData = file_get_contents('php://input');
logMessage("Raw POST Data: " . $rawData);

// Try to decode JSON data
try {
    $jsonData = json_decode($rawData, true);
    if ($jsonData !== null) {
        logMessage("Decoded JSON Data: " . print_r($jsonData, true));
        
        // Check if measurements exist in the data
        if (isset($jsonData['measurements'])) {
            logMessage("Measurements found in JSON: " . print_r($jsonData['measurements'], true));
            
            // Check if measurements are empty or null
            $emptyMeasurements = true;
            foreach ($jsonData['measurements'] as $key => $value) {
                if (!empty($value)) {
                    $emptyMeasurements = false;
                    break;
                }
            }
            
            if ($emptyMeasurements) {
                logMessage("WARNING: All measurement values are empty or null!");
            }
        } else {
            logMessage("No measurements found in JSON data");
        }
        
        // Log the structure of the data for debugging
        logMessage("JSON Data Structure: " . print_r(array_keys($jsonData), true));
        
        // Check if this is a customer update or create
        if (isset($jsonData['id'])) {
            logMessage("This appears to be a customer UPDATE operation for ID: " . $jsonData['id']);
        } else {
            logMessage("This appears to be a customer CREATE operation");
        }
    } else {
        logMessage("Failed to decode JSON data. JSON error: " . json_last_error_msg());
    }
} catch (Exception $e) {
    logMessage("Exception while processing data: " . $e->getMessage());
}

// Return a response
header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'message' => 'Debug information logged']);
?>