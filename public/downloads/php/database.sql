-- Elite Chauffeur Database Schema
-- MySQL 5.7+ / MariaDB 10.3+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table: cars
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cars` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `year` INT(4) NOT NULL,
  `category` ENUM('sedan','suv','van','limousine','electric','sports') NOT NULL DEFAULT 'sedan',
  `capacity` INT(2) NOT NULL DEFAULT 4,
  `price_per_km` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `base_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `driver_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `description` TEXT,
  `features` TEXT COMMENT 'JSON array stored as text',
  `photo_url` VARCHAR(500),
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `available_for_hourly` TINYINT(1) NOT NULL DEFAULT 0,
  `internal_name` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: drivers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30),
  `email` VARCHAR(100),
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `experience` INT(3) NOT NULL DEFAULT 0 COMMENT 'Years of experience',
  `languages` VARCHAR(255),
  `photo_url` VARCHAR(500),
  `daily_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: reservations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(30),
  `pickup_location` VARCHAR(500) NOT NULL,
  `dropoff_location` VARCHAR(500) NOT NULL,
  `pickup_date` DATE NOT NULL,
  `pickup_time` TIME NOT NULL,
  `distance_km` DECIMAL(10,2) DEFAULT 0.00,
  `car_id` INT(11),
  `driver_id` INT(11),
  `with_driver` TINYINT(1) NOT NULL DEFAULT 1,
  `driver_fee` DECIMAL(10,2) DEFAULT 0.00,
  `total_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT,
  `status` ENUM('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_car` (`car_id`),
  KEY `fk_driver` (`driver_id`),
  CONSTRAINT `fk_reservations_car` FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reservations_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: pricing
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pricing` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50),
  `price_per_km` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `base_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: services
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(50) COMMENT 'Font Awesome class e.g. fa-car',
  `image_url` VARCHAR(500),
  `sort_order` INT(3) NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: terms_sections
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `terms_sections` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `content` TEXT NOT NULL,
  `sort_order` INT(3) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: users (staff admin accounts)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','super_admin') NOT NULL DEFAULT 'admin',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: site_settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- SEED DATA
-- --------------------------------------------------------

-- Insert sample cars
INSERT INTO `cars` (`brand`, `model`, `year`, `category`, `capacity`, `price_per_km`, `base_fee`, `driver_fee`, `description`, `features`, `photo_url`, `available`, `available_for_hourly`, `internal_name`) VALUES
('BMW', '760i', 2024, 'sedan', 4, 4.20, 75.00, 150.00, 'Executive flagship with Sky Lounge panoramic roof and Executive Lounge rear seating.', '["Executive Lounge Seats", "Sky Lounge Roof", "Harman Kardon Audio", "Massage Seats", "Ambient Lighting", "Rear Entertainment"]', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', 1, 0, 'BMW-760i'),
('Bentley', 'Flying Spur', 2023, 'sedan', 4, 8.00, 150.00, 200.00, 'Handcrafted British luxury at its finest — a grand touring saloon with unparalleled refinement.', '["Handcrafted Interior", "Naim Audio", "Massaging Seats", "Diamond Quilting", "Rotating Display", "Night Vision"]', 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80', 1, 0, 'BENT-FS'),
('Land Rover', 'Range Rover Autobiography', 2024, 'suv', 5, 5.50, 100.00, 175.00, 'Ultimate SUV luxury — commanding presence with rear executive seating and air suspension.', '["Executive Rear Seats", "Meridian Audio", "Heated/Cooled Seats", "Air Suspension", "Terrain Response", "Pixel LED"]', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80', 1, 0, 'RR-AUTO'),
('Rolls-Royce', 'Ghost', 2023, 'limousine', 4, 15.00, 350.00, 400.00, 'The whisper of luxury — post-opulent design with the iconic Spirit of Ecstasy.', '["Starlight Headliner", "Bespoke Audio", "Self-Closing Doors", "Champagne Cooler", "Lamb Wool Mats", "Planar Suspension"]', 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=80', 1, 0, 'RR-GHOST');

-- Insert sample drivers
INSERT INTO `drivers` (`name`, `phone`, `email`, `rating`, `experience`, `languages`, `photo_url`, `daily_rate`, `available`) VALUES
('James Richardson', '+1 555-0101', 'james.r@elitechauffeur.com', 4.9, 12, 'English, French, Spanish', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 350.00, 1),
('Michael Chen', '+1 555-0102', 'michael.c@elitechauffeur.com', 4.8, 8, 'English, Mandarin, Cantonese', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', 320.00, 1),
('David Williams', '+1 555-0103', 'david.w@elitechauffeur.com', 5.0, 15, 'English, German, Italian', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', 400.00, 0);

-- Insert sample reservations
INSERT INTO `reservations` (`customer_name`, `customer_email`, `customer_phone`, `pickup_location`, `dropoff_location`, `pickup_date`, `pickup_time`, `distance_km`, `car_id`, `driver_id`, `with_driver`, `driver_fee`, `total_price`, `notes`, `status`) VALUES
('Alexandra Thompson', 'alexandra.t@email.com', '+1 555-1001', 'JFK International Airport, Terminal 4', 'The Plaza Hotel, Fifth Avenue, New York', CURDATE() + INTERVAL 1 DAY, '14:30:00', 35.00, 1, 1, 1, 150.00, 372.00, 'Flight arrives at 14:00. Please have a name sign ready.', 'confirmed'),
('Robert Chen', 'r.chen@business.com', '+1 555-1002', 'Four Seasons Hotel, 57 E 57th St', 'Newark Liberty International Airport', CURDATE() + INTERVAL 2 DAY, '06:00:00', 45.00, 2, 2, 1, 200.00, 710.00, 'Early morning pickup. Business travel.', 'pending'),
('Victoria Sterling', 'v.sterling@luxury.com', '+1 555-1003', 'The Ritz-Carlton, Central Park', 'Metropolitan Opera House', CURDATE() - INTERVAL 2 DAY, '18:30:00', 8.00, 4, 3, 1, 400.00, 870.00, 'Opera evening. Return trip required.', 'completed'),
('James Whitmore', 'j.whitmore@corp.com', '+1 555-1004', 'Wall Street, Financial District', 'LaGuardia Airport', CURDATE(), '16:00:00', 20.00, 3, 1, 1, 175.00, 385.00, 'Corporate account. Invoice required.', 'in_progress'),
('Emily Davis', 'emily.d@email.com', '+1 555-1005', 'Brooklyn Bridge Park', 'Times Square', CURDATE() - INTERVAL 3 DAY, '20:00:00', 12.00, 1, NULL, 0, 0.00, 125.40, '', 'cancelled');

-- Insert pricing tiers
INSERT INTO `pricing` (`name`, `category`, `price_per_km`, `base_fee`, `active`) VALUES
('Economy Sedan', 'sedan', 2.50, 50.00, 1),
('Executive Sedan', 'sedan', 4.50, 85.00, 1),
('Luxury SUV', 'suv', 5.50, 100.00, 1),
('Ultra Luxury', 'limousine', 15.00, 350.00, 1);

-- Insert services
INSERT INTO `services` (`title`, `description`, `icon`, `image_url`, `sort_order`, `active`) VALUES
('Airport Transfers', 'Seamless airport pickups and drop-offs with flight tracking. Our chauffeurs monitor your flight status to ensure timely arrivals and departures.', 'fa-plane', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', 1, 1),
('Corporate Travel', 'Professional transportation solutions for business executives. Reliable, punctual, and discreet service for all your corporate needs.', 'fa-briefcase', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80', 2, 1),
('Special Events', 'Make your special occasions unforgettable with our premium fleet. Weddings, galas, premieres, and milestone celebrations.', 'fa-champagne-glasses', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 3, 1),
('Hourly Charter', 'Flexible hourly bookings for city tours, shopping excursions, or multiple stops. Your vehicle and chauffeur at your disposal.', 'fa-clock', 'https://images.unsplash.com/photo-1449965408869-ebd3fee56f67?w=800&q=80', 4, 1),
('Long Distance', 'Comfortable intercity travel for those who prefer luxury over conventional transportation. Arrive refreshed and ready.', 'fa-road', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', 5, 1);

-- Insert terms sections
INSERT INTO `terms_sections` (`title`, `content`, `sort_order`) VALUES
('Booking and Reservations', 'All reservations must be made at least 24 hours in advance. For airport transfers, we recommend booking 48 hours ahead. Bookings can be made through our website, mobile app, or by contacting our concierge service directly. A valid credit card is required to secure your reservation.', 1),
('Cancellation Policy', 'Cancellations made more than 24 hours before the scheduled pickup time are eligible for a full refund. Cancellations within 24 hours will incur a 50% charge. No-shows will be charged the full amount. Special event bookings may have different cancellation terms.', 2),
('Payment Terms', 'We accept all major credit cards, corporate accounts, and bank transfers for corporate clients. Payment is due upon completion of service unless prior arrangements have been made. Gratuity is not included and is at the discretion of the client.', 3);

-- Insert default super admin user (password: admin123)
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `active`) VALUES
('Super Admin', 'admin@elitechauffeur.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 1);

-- Insert site settings
INSERT INTO `site_settings` (`key`, `value`) VALUES
('siteName', 'Elite Chauffeur'),
('tagline', 'Luxury Black Car Service'),
('contactPhone', '+1 (888) 555-0100'),
('contactEmail', 'concierge@elitechauffeur.com'),
('contactAddress', '500 Fifth Avenue, Suite 2400, New York, NY 10110'),
('contactHours', '24/7 Concierge Service'),
('currencySymbol', 'MAD '),
('currencyPos', 'before'),
('currencyCode', 'MAD'),
('showChauffeurService', 'true'),
('themeAccentColor', '#ffffff'),
('themeBgColor', '#0d0d0d'),
('themeFontBody', 'Inter'),
('themeFontHeading', 'Cormorant Garamond'),
('websiteLogoUrl', ''),
('heroImageUrl', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80'),
('adminPassword', 'admin123'),
('adminPasswordHash', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('googleMapsApiKey', '');
