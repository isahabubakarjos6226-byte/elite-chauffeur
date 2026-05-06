<?php
/**
 * Layout Functions
 */

function publicHead(string $title = ''): void {
    $siteName = e(getSetting('siteName', 'Elite Chauffeur'));
    $pageTitle = $title ? "$title | $siteName" : $siteName;
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
    <meta name="description" content="<?= e(getSetting('tagline', 'Luxury Black Car Service')) ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="/assets/css/style.css" rel="stylesheet">
</head>
<body>
<?php
}

function publicNav(): void {
    $siteName = e(getSetting('siteName', 'Elite Chauffeur'));
    $currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<nav class="ec-navbar">
    <div class="ec-navbar-inner">
        <a href="/" class="ec-navbar-brand"><?= strtoupper($siteName) ?></a>
        <div class="ec-navbar-links">
            <a href="/" class="<?= $currentPage === 'index' ? 'active' : '' ?>">Home</a>
            <a href="/fleet.php" class="<?= $currentPage === 'fleet' ? 'active' : '' ?>">Fleet</a>
            <a href="/services.php" class="<?= $currentPage === 'services' ? 'active' : '' ?>">Services</a>
            <a href="/contact.php" class="<?= $currentPage === 'contact' ? 'active' : '' ?>">Contact</a>
        </div>
        <a href="/book.php" class="ec-btn-primary">Book Now</a>
    </div>
</nav>
<?php
}

function publicFoot(): void {
    $siteName = e(getSetting('siteName', 'Elite Chauffeur'));
    $year = date('Y');
?>
<footer class="ec-footer">
    <div class="ec-footer-inner">
        <p>&copy; <?= $year ?> <?= strtoupper($siteName) ?>. All rights reserved.</p>
        <nav class="ec-footer-links">
            <a href="/fleet.php">Fleet</a>
            <a href="/services.php">Services</a>
            <a href="/contact.php">Contact</a>
            <a href="/terms.php">Terms &amp; Conditions</a>
            <a href="/book.php">Book Now</a>
        </nav>
    </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/js/public.js"></script>
</body>
</html>
<?php
}

function adminHead(string $title = ''): void {
    $siteName = e(getSetting('siteName', 'Elite Chauffeur'));
    $pageTitle = $title ? "$title | Admin - $siteName" : "Admin - $siteName";
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="/assets/css/admin.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<?php
}

function adminNav(): void {
    $userName = e($_SESSION['user_name'] ?? 'Admin');
    $userRole = getUserRole();
    $currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<div class="ec-admin-layout">
    <aside class="ec-sidebar">
        <div class="ec-sidebar-brand">
            <a href="/admin/">ELITE CHAUFFEUR</a>
        </div>
        <nav class="ec-sidebar-nav">
            <a href="/admin/" class="<?= $currentPage === 'index' ? 'active' : '' ?>">
                <i class="fas fa-chart-line"></i> Dashboard
            </a>
            <a href="/admin/reservations.php" class="<?= $currentPage === 'reservations' ? 'active' : '' ?>">
                <i class="fas fa-calendar-check"></i> Reservations
            </a>
            <a href="/admin/calendar.php" class="<?= $currentPage === 'calendar' ? 'active' : '' ?>">
                <i class="fas fa-calendar"></i> Calendar
            </a>
            <?php if (isAdmin()): ?>
            <a href="/admin/cars.php" class="<?= $currentPage === 'cars' ? 'active' : '' ?>">
                <i class="fas fa-car"></i> Fleet
            </a>
            <a href="/admin/drivers.php" class="<?= $currentPage === 'drivers' ? 'active' : '' ?>">
                <i class="fas fa-id-card"></i> Drivers
            </a>
            <a href="/admin/pricing.php" class="<?= $currentPage === 'pricing' ? 'active' : '' ?>">
                <i class="fas fa-tags"></i> Pricing
            </a>
            <a href="/admin/services.php" class="<?= $currentPage === 'services' ? 'active' : '' ?>">
                <i class="fas fa-concierge-bell"></i> Services
            </a>
            <a href="/admin/terms.php" class="<?= $currentPage === 'terms' ? 'active' : '' ?>">
                <i class="fas fa-file-contract"></i> Terms
            </a>
            <a href="/admin/theme.php" class="<?= $currentPage === 'theme' ? 'active' : '' ?>">
                <i class="fas fa-palette"></i> Theme
            </a>
            <a href="/admin/settings.php" class="<?= $currentPage === 'settings' ? 'active' : '' ?>">
                <i class="fas fa-cog"></i> Settings
            </a>
            <?php endif; ?>
            <?php if (isSuperAdmin()): ?>
            <a href="/admin/users.php" class="<?= $currentPage === 'users' ? 'active' : '' ?>">
                <i class="fas fa-users"></i> Staff Users
            </a>
            <?php endif; ?>
        </nav>
        <div class="ec-sidebar-footer">
            <span class="ec-sidebar-user"><?= $userName ?></span>
            <a href="/admin/logout.php" class="ec-sidebar-logout">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </a>
        </div>
    </aside>
    <main class="ec-admin-main">
<?php
}

function adminFoot(): void {
?>
    </main>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/js/admin.js"></script>
</body>
</html>
<?php
}

function showFlash(): void {
    $flash = getFlash();
    if ($flash): ?>
    <div class="alert alert-<?= $flash['type'] === 'error' ? 'danger' : $flash['type'] ?> alert-dismissible fade show" role="alert">
        <?= e($flash['message']) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    <?php endif;
}
