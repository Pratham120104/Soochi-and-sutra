<?php
// backend/setup_customers_orders.php
// Run this script once to set up the customers and orders tables

header('Content-Type: text/html; charset=utf-8');

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

echo "<h2>Setting up customers and orders tables...</h2>";

// Read the SQL file
$sql = file_get_contents('create_customers_orders_tables.sql');

// Execute multi query
$success = true;
if ($conn->multi_query($sql)) {
    do {
        // Store first result set
        if ($result = $conn->store_result()) {
            $result->free();
        }
        // Check for errors
        if ($conn->error) {
            echo "<p style='color: red;'>❌ Error: " . $conn->error . "</p>";
            $success = false;
            break;
        }
    } while ($conn->next_result());
}

if ($success) {
    echo "<p style='color: green;'>✅ Tables created successfully!</p>";
    
    // Show tables in the database
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        echo "<h3>Tables in database:</h3>";
        echo "<ul>";
        while ($row = $result->fetch_row()) {
            echo "<li>" . $row[0] . "</li>";
        }
        echo "</ul>";
    }
} else {
    echo "<p style='color: red;'>❌ Error creating tables: " . $conn->error . "</p>";
}

$conn->close();

echo "<p><a href='customer-management.php'>Go to Customer Management API</a></p>";
?>