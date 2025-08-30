# Boutique Measurement Hub Backend

This is the backend for the Boutique Measurement Hub application. It provides APIs for customer management, order management, and image uploads.

## Setup Instructions

1. Make sure you have XAMPP installed and running.
2. Place all files in the `backend` directory under your XAMPP htdocs folder.
3. Run the database setup scripts in the following order:
   - `setup_database.php` (for employees table)
   - `setup_customers_orders.php` (for customers, measurements, blouse details, images, and orders tables)

## API Endpoints

### Customer Management

**GET `/backend/customer-management.php`**
- Fetches all customers
- No parameters required
- Returns an array of customer objects

**GET `/backend/customer-management.php?id={id}`**
- Fetches a specific customer by ID
- Parameters: `id` (customer ID)
- Returns a customer object or 404 if not found

**GET `/backend/customer-management.php?phone={phone}`**
- Fetches a specific customer by phone number
- Parameters: `phone` (customer phone number)
- Returns a customer object or 404 if not found

**POST `/backend/customer-management.php`**
- Creates a new customer
- Request body: Customer data in JSON format
- Returns the created customer object

**PUT `/backend/customer-management.php`**
- Updates an existing customer
- Request body: Customer data in JSON format with ID
- Returns the updated customer object

**DELETE `/backend/customer-management.php?id={id}`**
- Deletes a customer
- Parameters: `id` (customer ID)
- Returns success message or error

### Order Management

**GET `/backend/order-management.php`**
- Fetches all orders
- No parameters required
- Returns an array of order objects

**GET `/backend/order-management.php?id={id}`**
- Fetches a specific order by ID
- Parameters: `id` (order ID)
- Returns an order object or 404 if not found

**GET `/backend/order-management.php?customer_id={customer_id}`**
- Fetches all orders for a specific customer
- Parameters: `customer_id` (customer ID)
- Returns an array of order objects

**POST `/backend/order-management.php`**
- Creates a new order
- Request body: Order data in JSON format
- Returns the created order object

**PUT `/backend/order-management.php`**
- Updates an existing order
- Request body: Order data in JSON format with ID
- Returns the updated order object

**DELETE `/backend/order-management.php?id={id}`**
- Deletes an order
- Parameters: `id` (order ID)
- Returns success message or error

### Image Upload

**POST `/backend/image-upload.php`**
- Uploads an image for a customer
- Form data parameters:
  - `image`: The image file
  - `customer_id`: The customer ID
  - `image_type`: The type of image (saree, blouseFront, blouseBack, blouseHand)
- Returns the URL of the uploaded image

## Data Structure

### Customer
```json
{
  "id": "CUST-123456789",
  "name": "Customer Name",
  "phone": "1234567890",
  "avatarUrl": "http://example.com/avatar.jpg",
  "orderStatus": "Pending",
  "lastUpdated": "2023-08-01T12:00:00Z",
  "measurements": {
    "fullShoulder": "15",
    "shoulderWidth": "14.5",
    "backLength": "14",
    "backNeckLength": "8",
    "armholeLoose": "16",
    "handLength": "6",
    "handLooseAboveElbow": "11",
    "handLooseBelowElbow": "10",
    "frontLength": "14.5",
    "frontNeckLength": "7",
    "apexLength": "10",
    "apexToApex": "7.5",
    "chestLoose": "36",
    "upperChestLoose": "34",
    "waistLoose": "30"
  },
  "blouseDetails": {
    "opening": "front",
    "doris": "yes",
    "cut": "princess",
    "fastener": "hooks",
    "padding": "yes",
    "piping": "contrast"
  },
  "images": {
    "saree": { "url": "http://example.com/saree.jpg", "notes": "Heavy silk saree for wedding." },
    "blouseFront": { "url": "http://example.com/blouse-front.jpg", "notes": "Deep U-neck design." },
    "blouseBack": { "url": "http://example.com/blouse-back.jpg", "notes": "Backless with doris." },
    "blouseHand": { "url": "http://example.com/blouse-hand.jpg", "notes": "Elbow length sleeves." }
  }
}
```

### Order
```json
{
  "id": "ORD-123456789",
  "customerId": "CUST-123456789",
  "customerName": "Customer Name",
  "customerPhone": "1234567890",
  "status": "Pending",
  "createdAt": "2023-08-01T12:00:00Z",
  "updatedAt": "2023-08-01T12:00:00Z"
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (invalid parameters)
- 404: Resource not found
- 405: Method not allowed
- 500: Server error

Error responses are in JSON format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Security Considerations

- For production, restrict CORS to specific domains
- Implement proper authentication and authorization
- Use HTTPS for all API requests
- Validate and sanitize all user inputs
- Implement rate limiting to prevent abuse