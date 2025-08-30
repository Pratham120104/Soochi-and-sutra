<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection
$conn = new mysqli("localhost", "root", "", "soochiandsutra"); // <-- use your real DB name
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$phone = $conn->real_escape_string($data['phone']);
$password = $data['password'];

$sql = "SELECT * FROM employees WHERE mobile = '$phone'"; // <-- use your real table name
$result = $conn->query($sql);

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $_SESSION['user'] = $user;
        echo json_encode([
            "message" => "Login successful",
            "designation" => $user['designation']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid password"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
}
$conn->close();
?>
