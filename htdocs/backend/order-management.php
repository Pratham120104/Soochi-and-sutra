<?php
// backend/order-management.php

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

// Handle GET request to fetch all orders
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id']) && !isset($_GET['customer_id'])) {
    $sql = "SELECT o.id, o.customer_id, o.status, o.created_at, o.updated_at, c.name, c.phone, c.address, c.due_date 
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           ORDER BY o.created_at DESC";
    $result = $conn->query($sql);

    $orders = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = [
                'id' => $row['id'],
                'customerId' => $row['customer_id'],
                'customerName' => $row['name'],
                'customerPhone' => $row['phone'],
                'customerAddress' => $row['address'] ?? '',
                'dueDate' => $row['due_date'] ?? null,
                'status' => $row['status'],
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at']
            ];
        }
    }
    
    echo json_encode($orders);
    $conn->close();
    exit;
}

// Handle GET request to fetch a specific order by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "SELECT o.id, o.customer_id, o.status, o.created_at, o.updated_at, c.name, c.phone, c.address, c.due_date 
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           WHERE o.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $order = [
            'id' => $row['id'],
            'customerId' => $row['customer_id'],
            'customerName' => $row['name'],
            'customerPhone' => $row['phone'],
            'customerAddress' => $row['address'] ?? '',
            'dueDate' => $row['due_date'] ?? null,
            'status' => $row['status'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
        
        echo json_encode($order);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// Handle GET request to fetch orders for a specific customer
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['customer_id'])) {
    $customerId = $_GET['customer_id'];
    $sql = "SELECT o.id, o.customer_id, o.status, o.created_at, o.updated_at, c.name, c.phone, c.address, c.due_date 
           FROM orders o
           JOIN customers c ON o.customer_id = c.id
           WHERE o.customer_id = ?
           ORDER BY o.created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $customerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = [
                'id' => $row['id'],
                'customerId' => $row['customer_id'],
                'customerName' => $row['name'],
                'customerPhone' => $row['phone'],
                'customerAddress' => $row['address'] ?? '',
                'dueDate' => $row['due_date'] ?? null,
                'status' => $row['status'],
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at']
            ];
        }
    }
    
    echo json_encode($orders);
    $stmt->close();
    $conn->close();
    exit;
}

// Handle POST request to create a new order
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the POSTed JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input or empty request body.']);
        exit;
    }

    // Validate required fields
    if (!isset($data['customerId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required field: customerId']);
        exit;
    }

    // Generate order ID if not provided
    $orderId = isset($data['id']) ? $data['id'] : 'ORD-' . time();
    $status = isset($data['status']) ? $data['status'] : 'Pending';

    // Start transaction
    $conn->begin_transaction();

    try {
        // Check if customer exists
        $checkSql = "SELECT id FROM customers WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("s", $data['customerId']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            // Customer doesn't exist
            $conn->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Customer not found']);
            $checkStmt->close();
            $conn->close();
            exit;
        }
        
        $checkStmt->close();
        
        // Insert new order
        $insertSql = "INSERT INTO orders (id, customer_id, status) VALUES (?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param("sss", $orderId, $data['customerId'], $status);
        $insertStmt->execute();
        $insertStmt->close();
        
        // Commit transaction
        $conn->commit();
        
        // Get customer details
        $customerSql = "SELECT name, phone FROM customers WHERE id = ?";
        $customerStmt = $conn->prepare($customerSql);
        $customerStmt->bind_param("s", $data['customerId']);
        $customerStmt->execute();
        $customerResult = $customerStmt->get_result();
        $customer = $customerResult->fetch_assoc();
        $customerStmt->close();
        
        // Return the order data
        echo json_encode([
            'id' => $orderId,
            'customerId' => $data['customerId'],
            'customerName' => $customer['name'],
            'customerPhone' => $customer['phone'],
            'status' => $status,
            'createdAt' => date('Y-m-d H:i:s'),
            'updatedAt' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error creating order: ' . $e->getMessage()]);
    }
    
    $conn->close();
    exit;
}

// Handle PUT request to update an order
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get the PUTed JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input or missing order ID.']);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update order status
        $updateSql = "UPDATE orders SET status = ? WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("ss", $data['status'], $data['id']);
        $updateStmt->execute();
        
        if ($updateStmt->affected_rows === 0) {
            // Order not found
            $conn->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            $updateStmt->close();
            $conn->close();
            exit;
        }
        
        $updateStmt->close();
        
        // Commit transaction
        $conn->commit();
        
        // Return success
        echo json_encode([
            'success' => true,
            'message' => 'Order updated successfully',
            'id' => $data['id'],
            'status' => $data['status'],
            'updatedAt' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating order: ' . $e->getMessage()]);
    }
    
    $conn->close();
    exit;
}

// Handle DELETE request to delete an order
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get the order ID from the URL parameter
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing order ID']);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Delete order
        $deleteSql = "DELETE FROM orders WHERE id = ?";
        $deleteStmt = $conn->prepare($deleteSql);
        $deleteStmt->bind_param("s", $id);
        $deleteStmt->execute();
        
        if ($deleteStmt->affected_rows > 0) {
            // Commit transaction
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
        } else {
            // Rollback transaction
            $conn->rollback();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found']);
        }
        
        $deleteStmt->close();
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting order: ' . $e->getMessage()]);
    }
    
    $conn->close();
    exit;
}

// If we get here, the request method is not supported
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
$conn->close();
?>