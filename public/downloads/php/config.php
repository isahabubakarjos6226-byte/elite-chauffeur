<?php
/**
 * Elite Chauffeur - Configuration
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session configuration
session_start();

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'elite_chauffeur');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'Elite Chauffeur');
define('APP_URL', 'http://localhost');
define('UPLOADS_DIR', __DIR__ . '/uploads/');
define('UPLOADS_URL', APP_URL . '/uploads/');

// Timezone
date_default_timezone_set('UTC');

// Include core files
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

// Load site settings into global
$GLOBALS['siteSettings'] = loadSettings();
