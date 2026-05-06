<?php
require_once '../config/database.php';
$currentLang = getCurrentLang();
$lang = require __DIR__ . '/../lang/' . $currentLang . '.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect('/admin/index.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if ($username && $password) {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM admins WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $admin = $stmt->fetch();
        
        if ($admin && password_verify($password, $admin['password'])) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            redirect('/admin/index.php');
        } else {
            $error = 'Invalid username or password';
        }
    } else {
        $error = 'Please enter username and password';
    }
}
?>
<!DOCTYPE html>
<html lang="<?php echo $currentLang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - <?php echo SITE_NAME; ?></title>
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
                        gold: '#d4af37',
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="font-serif text-3xl text-foreground"><?php echo SITE_NAME; ?></h1>
            <p class="text-gray-400 mt-2">Admin Panel</p>
        </div>
        
        <div class="bg-card border border-border rounded-xl p-8">
            <?php if ($error): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6">
                <?php echo $error; ?>
            </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-6">
                <div>
                    <label class="block text-sm text-gray-400 mb-2">Username or Email</label>
                    <input type="text" name="username" required 
                           class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-gold">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-2">Password</label>
                    <input type="password" name="password" required 
                           class="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-gold">
                </div>
                <button type="submit" 
                        class="w-full py-3 bg-gold text-background font-medium rounded-lg hover:bg-gold/90 transition-colors">
                    Login
                </button>
            </form>
        </div>
        
        <p class="text-center text-gray-500 text-sm mt-6">
            <a href="../index.php" class="hover:text-foreground">&larr; Back to website</a>
        </p>
    </div>
</body>
</html>
