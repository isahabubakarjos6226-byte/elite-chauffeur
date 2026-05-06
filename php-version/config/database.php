<?php
/**
 * Database Configuration
 * Update these values with your MySQL credentials
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'elite_chauffeur');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Site Configuration
define('SITE_URL', 'http://localhost/elite-chauffeur');
define('SITE_NAME', 'Elite Chauffeur');
define('ADMIN_EMAIL', 'admin@elitechauffeur.com');

// Currency Settings
define('CURRENCY_SYMBOL', 'MAD');
define('CURRENCY_POSITION', 'after'); // 'before' or 'after'

// Default Language
define('DEFAULT_LANG', 'en');

// Timezone
date_default_timezone_set('Africa/Casablanca');

// Error Reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session Configuration
session_start();

/**
 * Database Connection
 */
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    return $pdo;
}

/**
 * Helper Functions
 */
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function redirect($url) {
    header("Location: " . SITE_URL . $url);
    exit;
}

function formatPrice($amount) {
    $formatted = number_format($amount, 2);
    if (CURRENCY_POSITION === 'before') {
        return CURRENCY_SYMBOL . ' ' . $formatted;
    }
    return $formatted . ' ' . CURRENCY_SYMBOL;
}

function isLoggedIn() {
    return isset($_SESSION['admin_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        redirect('/admin/login.php');
    }
}

function getCurrentLang() {
    return $_SESSION['lang'] ?? DEFAULT_LANG;
}

function setLang($lang) {
    $allowed = ['en', 'fr', 'de', 'ar'];
    if (in_array($lang, $allowed)) {
        $_SESSION['lang'] = $lang;
    }
}
