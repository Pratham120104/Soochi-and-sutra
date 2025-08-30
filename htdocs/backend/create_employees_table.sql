-- Create employees table for the boutique measurement hub
-- Run this script in your MySQL database (soochiandsutra)

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

-- Insert some sample data (optional)
-- INSERT INTO employees (name, mobile, password, designation, customer_id) VALUES
-- ('John Doe', '1234567890', '$2y$10$example_hash', 'admin', 'admin1'),
-- ('Jane Smith', '9876543210', '$2y$10$example_hash', 'tailor', 'tailor1'); 