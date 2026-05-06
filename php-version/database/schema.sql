-- Elite Chauffeur Database Schema
-- Run this SQL in phpMyAdmin to create the database

CREATE DATABASE IF NOT EXISTS elite_chauffeur CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elite_chauffeur;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admins (username, email, password) VALUES 
('admin', 'admin@elitechauffeur.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category ENUM('sedan', 'suv', 'limousine', 'van', 'sports') DEFAULT 'sedan',
    year INT,
    capacity INT DEFAULT 4,
    image_url VARCHAR(500),
    price_per_km DECIMAL(10,2) DEFAULT 0,
    price_per_day DECIMAL(10,2) DEFAULT 0,
    base_fee DECIMAL(10,2) DEFAULT 0,
    driver_fee DECIMAL(10,2) DEFAULT 0,
    features TEXT,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Cars
INSERT INTO cars (brand, model, category, year, capacity, image_url, price_per_km, price_per_day, base_fee, driver_fee, features) VALUES
('Mercedes-Benz', 'S-Class', 'sedan', 2024, 4, 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80', 8.00, 800.00, 150.00, 200.00, 'WiFi,Leather Seats,Climate Control,Privacy Glass'),
('BMW', '7 Series', 'sedan', 2024, 4, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', 7.50, 750.00, 140.00, 180.00, 'WiFi,Massage Seats,Premium Sound,Rear Entertainment'),
('Rolls-Royce', 'Ghost', 'limousine', 2024, 4, 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=80', 25.00, 2500.00, 500.00, 400.00, 'Champagne Cooler,Starlight Headliner,Bespoke Interior'),
('Range Rover', 'Autobiography', 'suv', 2024, 5, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80', 10.00, 1000.00, 200.00, 220.00, 'WiFi,Panoramic Roof,Executive Seating,Off-Road Capable'),
('Mercedes-Benz', 'V-Class', 'van', 2024, 7, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80', 6.00, 600.00, 120.00, 150.00, 'WiFi,Conference Seating,USB Ports,Large Luggage Space');

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Plane',
    image_url VARCHAR(500),
    sort_order INT DEFAULT 1,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Services
INSERT INTO services (title, description, icon, image_url, sort_order) VALUES
('Airport Transfers', 'Seamless airport pickups and drop-offs with flight tracking. Our chauffeurs monitor your flight status to ensure timely arrivals and departures.', 'Plane', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', 1),
('Corporate Travel', 'Professional transportation solutions for business executives. Reliable, punctual, and discreet service for all your corporate needs.', 'Building2', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80', 2),
('Special Events', 'Make your special occasions unforgettable with our premium fleet. Weddings, galas, premieres, and milestone celebrations.', 'PartyPopper', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 3),
('Hourly Charter', 'Flexible hourly bookings for city tours, shopping excursions, or multiple stops. Your vehicle and chauffeur at your disposal.', 'Clock', 'https://images.unsplash.com/photo-1449965408869-ebd3fee56f67?w=800&q=80', 4),
('Long Distance', 'Comfortable intercity travel for those who prefer luxury over conventional transportation. Arrive refreshed and ready.', 'Route', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', 5);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    license_number VARCHAR(50),
    photo_url VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 5.0,
    total_trips INT DEFAULT 0,
    available TINYINT(1) DEFAULT 1,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Drivers
INSERT INTO drivers (name, phone, email, license_number, rating, total_trips) VALUES
('Ahmed Hassan', '+212 600-123456', 'ahmed@elitechauffeur.com', 'DL-2024-001', 4.9, 234),
('Mohammed Ali', '+212 600-234567', 'mohammed@elitechauffeur.com', 'DL-2024-002', 4.8, 189),
('Youssef Benjelloun', '+212 600-345678', 'youssef@elitechauffeur.com', 'DL-2024-003', 5.0, 312);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_type ENUM('transfer', 'daily') DEFAULT 'transfer',
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    car_id INT,
    driver_id INT,
    pickup_location TEXT,
    dropoff_location TEXT,
    pickup_date DATE,
    pickup_time TIME,
    return_date DATE,
    return_time TIME,
    distance_km DECIMAL(10,2) DEFAULT 0,
    rental_days INT DEFAULT 1,
    with_driver TINYINT(1) DEFAULT 0,
    base_fee DECIMAL(10,2) DEFAULT 0,
    distance_fee DECIMAL(10,2) DEFAULT 0,
    driver_fee DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'Elite Chauffeur'),
('tagline', 'Luxury Transportation Services'),
('phone', '+212 600-000000'),
('email', 'contact@elitechauffeur.com'),
('address', 'Casablanca, Morocco'),
('currency_symbol', 'MAD'),
('currency_position', 'after'),
('show_chauffeur_service', '1'),
('default_language', 'en'),
('hero_title', 'ELITE CHAUFFEUR'),
('hero_subtitle', 'Experience luxury transportation at its finest'),
('about_text', 'With years of experience in premium transportation, we deliver excellence with every journey.');

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
