<?php
require_once __DIR__ . '/../config/database.php';

// Language handling
if (isset($_GET['lang'])) {
    setLang($_GET['lang']);
}
$currentLang = getCurrentLang();
$lang = require __DIR__ . '/../lang/' . $currentLang . '.php';
$isRTL = $currentLang === 'ar';
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>" dir="<?php echo $isRTL ? 'rtl' : 'ltr'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? SITE_NAME; ?></title>
    <meta name="description" content="<?php echo $pageDescription ?? 'Premium luxury transportation services'; ?>">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        background: '#0a0a0a',
                        foreground: '#fafafa',
                        card: '#141414',
                        'card-foreground': '#fafafa',
                        primary: '#fafafa',
                        'primary-foreground': '#0a0a0a',
                        secondary: '#262626',
                        'secondary-foreground': '#fafafa',
                        muted: '#262626',
                        'muted-foreground': '#a3a3a3',
                        border: '#262626',
                        input: '#262626',
                        gold: '#d4af37',
                    },
                    fontFamily: {
                        serif: ['Playfair Display', 'Georgia', 'serif'],
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    },
                }
            }
        }
    </script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0a0a0a;
            color: #fafafa;
        }
        .font-serif {
            font-family: 'Playfair Display', Georgia, serif;
        }
        .ec-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 0.5rem;
            transition: all 0.2s;
            cursor: pointer;
        }
        .ec-btn-gold {
            background-color: #d4af37;
            color: #0a0a0a;
        }
        .ec-btn-gold:hover {
            background-color: #c9a432;
        }
        .ec-btn-outline {
            border: 1px solid #262626;
            color: #fafafa;
            background: transparent;
        }
        .ec-btn-outline:hover {
            border-color: #fafafa;
        }
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
        .ec-input::placeholder {
            color: #a3a3a3;
        }
        .card {
            background-color: #141414;
            border: 1px solid #262626;
            border-radius: 0.75rem;
        }
    </style>
</head>
<body class="min-h-screen bg-background text-foreground">

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
            <!-- Logo -->
            <a href="index.php" class="font-serif text-2xl text-foreground tracking-wider">
                <?php echo SITE_NAME; ?>
            </a>
            
            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-8">
                <a href="index.php" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <?php echo $lang['nav']['home']; ?>
                </a>
                <a href="fleet.php" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <?php echo $lang['nav']['fleet']; ?>
                </a>
                <a href="services.php" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <?php echo $lang['nav']['services']; ?>
                </a>
                <a href="contact.php" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <?php echo $lang['nav']['contact']; ?>
                </a>
            </div>
            
            <!-- Right Side -->
            <div class="flex items-center gap-4">
                <!-- Language Switcher -->
                <div class="relative group">
                    <button class="text-sm text-muted-foreground hover:text-foreground px-2 py-1 uppercase">
                        <?php echo $currentLang; ?>
                    </button>
                    <div class="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg py-2 min-w-[100px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <a href="?lang=en" class="block px-4 py-2 text-sm hover:bg-secondary">English</a>
                        <a href="?lang=fr" class="block px-4 py-2 text-sm hover:bg-secondary">Français</a>
                        <a href="?lang=ar" class="block px-4 py-2 text-sm hover:bg-secondary">العربية</a>
                    </div>
                </div>
                
                <a href="book.php" class="ec-btn ec-btn-gold">
                    <?php echo $lang['nav']['book_now']; ?>
                </a>
            </div>
        </div>
    </div>
</nav>

<main class="pt-20">
