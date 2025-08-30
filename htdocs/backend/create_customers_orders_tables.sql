-- Create customers and orders tables for the boutique measurement hub
-- Run this script in your MySQL database (soochiandsutra)

-- Create customers table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create measurements table
CREATE TABLE IF NOT EXISTS `measurements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(50) NOT NULL,
  `full_shoulder` varchar(20) DEFAULT NULL,
  `shoulder_width` varchar(20) DEFAULT NULL,
  `back_length` varchar(20) DEFAULT NULL,
  `back_neck_length` varchar(20) DEFAULT NULL,
  `armhole_loose` varchar(20) DEFAULT NULL,
  `hand_length` varchar(20) DEFAULT NULL,
  `hand_loose_above_elbow` varchar(20) DEFAULT NULL,
  `hand_loose_below_elbow` varchar(20) DEFAULT NULL,
  `front_length` varchar(20) DEFAULT NULL,
  `front_neck_length` varchar(20) DEFAULT NULL,
  `apex_length` varchar(20) DEFAULT NULL,
  `apex_to_apex` varchar(20) DEFAULT NULL,
  `chest_loose` varchar(20) DEFAULT NULL,
  `upper_chest_loose` varchar(20) DEFAULT NULL,
  `waist_loose` varchar(20) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `measurements_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create blouse_details table
CREATE TABLE IF NOT EXISTS `blouse_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(50) NOT NULL,
  `opening` enum('front','back','') DEFAULT NULL,
  `doris` enum('yes','no','') DEFAULT NULL,
  `cut` enum('princess','3dart','') DEFAULT NULL,
  `fastener` enum('zip','hooks','') DEFAULT NULL,
  `padding` enum('yes','no','') DEFAULT NULL,
  `piping` enum('self','contrast','') DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `blouse_details_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create customer_images table
CREATE TABLE IF NOT EXISTS `customer_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(50) NOT NULL,
  `image_type` enum('saree','blouseFront','blouseBack','blouseHand') NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_image_type` (`customer_id`, `image_type`),
  CONSTRAINT `customer_images_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `status` enum('Pending','In Progress','Alteration','Completed','Delivered') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
-- INSERT INTO customers (id, name, phone, avatar_url) VALUES
-- ('CUST-001', 'Priya Sharma', '9876543210', 'https://picsum.photos/seed/priya/200'),
-- ('CUST-002', 'Anjali Verma', '8765432109', 'https://picsum.photos/seed/anjali/200'),
-- ('CUST-003', 'Sneha Reddy', '7654321098', 'https://picsum.photos/seed/sneha/200');