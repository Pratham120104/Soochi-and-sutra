<?php
// backend/test-connection.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

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
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// Check if tables exist
$tables = [
    'employees',
    'customers',
    'customer_measurements',
    'customer_blouse_details',
    'customer_images',
    'orders'
];

$results = [];

foreach ($tables as $table) {
    $query = "SHOW TABLES LIKE '$table'";
    $result = $conn->query($query);
    
    $results[$table] = [
        'exists' => $result->num_rows > 0,
        'row_count' => 0,
        'columns' => []
    ];
    
    if ($result->num_rows > 0) {
        // Get row count
        $countQuery = "SELECT COUNT(*) as count FROM $table";
        $countResult = $conn->query($countQuery);
        $count = $countResult->fetch_assoc()['count'];
        $results[$table]['row_count'] = $count;
        
        // Get column information
        $columnsQuery = "SHOW COLUMNS FROM $table";
        $columnsResult = $conn->query($columnsQuery);
        
        while ($column = $columnsResult->fetch_assoc()) {
            $results[$table]['columns'][] = [
                'name' => $column['Field'],
                'type' => $column['Type'],
                'key' => $column['Key']
            ];
        }
    }
}

// Check database version
$versionQuery = "SELECT VERSION() as version";
$versionResult = $conn->query($versionQuery);
$version = $versionResult->fetch_assoc()['version'];

// Return results
echo json_encode([
    'success' => true,
    'message' => 'Database connection successful',
    'database' => [
        'name' => $db,
        'version' => $version
    ],
    'tables' => $results
], JSON_PRETTY_PRINT);

$conn->close();
?>