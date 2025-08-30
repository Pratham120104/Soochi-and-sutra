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

echo "<h1>Customers Table Structure</h1>";

// Check customers table structure
$tableStructureSql = "DESCRIBE customers";
$tableStructureResult = $conn->query($tableStructureSql);
if (!$tableStructureResult) {
    die("<h1>Error: Could not get table structure: " . $conn->error . "</h1>");
}

echo "<pre>";
while ($row = $tableStructureResult->fetch_assoc()) {
    print_r($row);
}
echo "</pre>";

// Check for any customers in the database
echo "<h1>Sample Customers</h1>";
$customersSql = "SELECT * FROM customers LIMIT 5";
$customersResult = $conn->query($customersSql);

if ($customersResult && $customersResult->num_rows > 0) {
    echo "<pre>";
    while ($customer = $customersResult->fetch_assoc()) {
        print_r($customer);
    }
    echo "</pre>";
} else {
    echo "<p>No customers found in the database.</p>";
}

$conn->close();
?>