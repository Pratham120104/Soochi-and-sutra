<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Allow CORS
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the raw request
file_put_contents('debug_log.txt', date('Y-m-d H:i:s') . " - Raw Request:\n" . file_get_contents('php://input') . "\n\n", FILE_APPEND);

// Log the parsed request
$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('debug_log.txt', date('Y-m-d H:i:s') . " - Parsed Request:\n" . print_r($data, true) . "\n\n", FILE_APPEND);

// Return success
echo json_encode(['success' => true, 'message' => 'Debug information logged']);
?>