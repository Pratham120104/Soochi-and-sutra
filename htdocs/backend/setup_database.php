<?php
// backend/setup_database.php
// Run this script once to set up the employees table

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

echo "<h2>Setting up employees table...</h2>";

// SQL to create the employees table
$sql = "
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `designation` enum('employee','admin','tailor') NOT NULL DEFAULT 'employee',
  `customer_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile` (`mobile`),
  UNIQUE KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

// Add unique constraints if they don't exist
$addConstraints = "
ALTER TABLE `employees` 
ADD UNIQUE KEY IF NOT EXISTS `mobile` (`mobile`),
ADD UNIQUE KEY IF NOT EXISTS `customer_id` (`customer_id`);
";

if ($conn->query($sql) === TRUE) {
    echo "<p style='color: green;'>✅ Employees table created successfully!</p>";
    
    // Try to add unique constraints
    if ($conn->query($addConstraints) === TRUE) {
        echo "<p style='color: green;'>✅ Unique constraints added successfully!</p>";
    } else {
        echo "<p style='color: orange;'>⚠️ Unique constraints may already exist: " . $conn->error . "</p>";
    }
    
    // Check if table exists and show its structure
    $result = $conn->query("DESCRIBE employees");
    if ($result) {
        echo "<h3>Table structure:</h3>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
} else {
    echo "<p style='color: red;'>❌ Error creating table: " . $conn->error . "</p>";
}

$conn->close();

echo "<p><a href='employee-management.php'>Go to Employee Management API</a></p>";
?> 