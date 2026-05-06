<?php
/**
 * Helper Functions
 */

/**
 * Get a site setting
 */
function getSetting(string $key, $default = ''): string {
    global $siteSettings;
    return $siteSettings[$key] ?? $default;
}

/**
 * Set a site setting
 */
function setSetting(string $key, string $value): void {
    dbExec(
        "INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
        [$key, $value, $value]
    );
    $GLOBALS['siteSettings'][$key] = $value;
}

/**
 * Load all settings from database
 */
function loadSettings(): array {
    $settings = [];
    $rows = db("SELECT `key`, `value` FROM site_settings");
    foreach ($rows as $row) {
        $settings[$row['key']] = $row['value'];
    }
    return $settings;
}

/**
 * Format price with currency
 */
function formatPrice(float $amount): string {
    $symbol = getSetting('currencySymbol', '$');
    $pos = getSetting('currencyPos', 'before');
    $formatted = number_format($amount, 2);
    return $pos === 'before' ? $symbol . $formatted : $formatted . $symbol;
}

/**
 * Escape HTML output (XSS protection)
 */
function e(?string $str): string {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Set flash message
 */
function setFlash(string $type, string $message): void {
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

/**
 * Get and clear flash message
 */
function getFlash(): ?array {
    $flash = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $flash;
}

/**
 * Redirect helper
 */
function redirect(string $url): void {
    header("Location: $url");
    exit;
}

/**
 * Check if request is POST
 */
function isPost(): bool {
    return $_SERVER['REQUEST_METHOD'] === 'POST';
}

/**
 * Get POST value with default
 */
function post(string $key, $default = '') {
    return $_POST[$key] ?? $default;
}

/**
 * Get GET value with default
 */
function get(string $key, $default = '') {
    return $_GET[$key] ?? $default;
}

/**
 * Calculate total price
 */
function calculateTotalPrice(array $car, float $distanceKm, bool $withDriver): float {
    $total = (float)$car['base_fee'] + ($distanceKm * (float)$car['price_per_km']);
    if ($withDriver) {
        $total += (float)$car['driver_fee'];
    }
    return $total;
}

/**
 * Format date for display
 */
function formatDate(string $date): string {
    return date('M j, Y', strtotime($date));
}

/**
 * Format time for display
 */
function formatTime(string $time): string {
    return date('g:i A', strtotime($time));
}

/**
 * Get status badge class
 */
function getStatusClass(string $status): string {
    $classes = [
        'pending' => 'ec-status--pending',
        'confirmed' => 'ec-status--confirmed',
        'in_progress' => 'ec-status--in_progress',
        'completed' => 'ec-status--completed',
        'cancelled' => 'ec-status--cancelled',
    ];
    return $classes[$status] ?? '';
}

/**
 * Parse features JSON
 */
function parseFeatures(?string $json): array {
    if (empty($json)) return [];
    $decoded = json_decode($json, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * JSON response helper
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
