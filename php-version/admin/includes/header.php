<?php
require_once __DIR__ . '/../../config/database.php';
requireLogin();

$currentLang = getCurrentLang();
$lang = require __DIR__ . '/../../lang/' . $currentLang . '.php';
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'Admin'; ?> - <?php echo SITE_NAME; ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        background: '#0a0a0a',
                        foreground: '#fafafa',
                        card: '#141414',
                        border: '#262626',
                        secondary: '#262626',
                        muted: '#a3a3a3',
                        gold: '#d4af37',
                    }
                }
            }
        }
    </script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        .ec-input {
            width: 100%;
            padding: 0.75rem 1rem;
            background-color: #141414;
            border: 1px solid #262626;
            border-radius: 0.5rem;
            color: #fafafa;
            font-size: 0.875rem;
        }
        .ec-input:focus {
            outline: none;
            border-color: #d4af37;
        }
    </style>
</head>
<body class="min-h-screen bg-background text-foreground">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 min-h-screen bg-card border-r border-border fixed">
            <div class="p-6 border-b border-border">
                <h1 class="font-serif text-xl text-foreground"><?php echo SITE_NAME; ?></h1>
                <p class="text-sm text-muted">Admin Panel</p>
            </div>
            
            <nav class="p-4 space-y-2">
                <a href="index.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'index.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['dashboard']; ?>
                </a>
                <a href="reservations.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'reservations.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="calendar" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['reservations']; ?>
                </a>
                <a href="cars.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'cars.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="car" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['cars']; ?>
                </a>
                <a href="services.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'services.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="concierge-bell" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['services']; ?>
                </a>
                <a href="drivers.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'drivers.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="users" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['drivers']; ?>
                </a>
                <a href="messages.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'messages.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="mail" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['messages']; ?>
                </a>
                <a href="settings.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors <?php echo basename($_SERVER['PHP_SELF']) === 'settings.php' ? 'bg-secondary' : ''; ?>">
                    <i data-lucide="settings" class="w-5 h-5"></i>
                    <?php echo $lang['admin']['settings']; ?>
                </a>
            </nav>
            
            <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <a href="../index.php" class="flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                    <i data-lucide="external-link" class="w-4 h-4"></i>
                    View Website
                </a>
                <a href="logout.php" class="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                    <?php echo $lang['admin']['logout']; ?>
                </a>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 ml-64 p-8">
