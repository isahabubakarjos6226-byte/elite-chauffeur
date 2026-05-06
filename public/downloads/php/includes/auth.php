<?php
/**
 * Authentication Functions
 */

/**
 * Check if user is logged in
 */
function isLoggedIn(): bool {
    return isset($_SESSION['user_id']) && $_SESSION['user_id'] > 0;
}

/**
 * Get current user
 */
function getCurrentUser(): ?array {
    if (!isLoggedIn()) return null;
    return dbOne("SELECT * FROM users WHERE id = ? AND active = 1", [$_SESSION['user_id']]);
}

/**
 * Get current user role
 */
function getUserRole(): ?string {
    return $_SESSION['user_role'] ?? null;
}

/**
 * Check if current user is admin
 */
function isAdmin(): bool {
    $role = getUserRole();
    return $role === 'admin' || $role === 'super_admin';
}

/**
 * Check if current user is super admin
 */
function isSuperAdmin(): bool {
    return getUserRole() === 'super_admin';
}

/**
 * Require login - redirect if not logged in
 */
function requireLogin(): void {
    if (!isLoggedIn()) {
        setFlash('error', 'Please log in to access this page.');
        redirect('/admin/login.php');
    }
}

/**
 * Require admin role
 */
function requireAdmin(): void {
    requireLogin();
    if (!isAdmin()) {
        setFlash('error', 'You do not have permission to access this page.');
        redirect('/admin/');
    }
}

/**
 * Require super admin role
 */
function requireSuperAdmin(): void {
    requireLogin();
    if (!isSuperAdmin()) {
        setFlash('error', 'This action requires super admin privileges.');
        redirect('/admin/');
    }
}

/**
 * Attempt login with email and password
 */
function attemptLogin(string $email, string $password): bool {
    $user = dbOne("SELECT * FROM users WHERE email = ? AND active = 1", [$email]);
    
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['name'];
        return true;
    }
    
    return false;
}

/**
 * Attempt login with master password
 */
function attemptMasterLogin(string $password): bool {
    $masterHash = getSetting('adminPasswordHash');
    $masterPlain = getSetting('adminPassword');
    
    // Check bcrypt hash first
    if ($masterHash && password_verify($password, $masterHash)) {
        $_SESSION['user_id'] = -1; // Special ID for master admin
        $_SESSION['user_role'] = 'super_admin';
        $_SESSION['user_name'] = 'Master Admin';
        return true;
    }
    
    // Fallback to plaintext comparison (for initial setup)
    if ($masterPlain && $password === $masterPlain) {
        $_SESSION['user_id'] = -1;
        $_SESSION['user_role'] = 'super_admin';
        $_SESSION['user_name'] = 'Master Admin';
        return true;
    }
    
    return false;
}

/**
 * Logout
 */
function logout(): void {
    $_SESSION = [];
    session_destroy();
}
