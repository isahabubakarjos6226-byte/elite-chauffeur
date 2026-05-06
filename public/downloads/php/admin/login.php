<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/layout.php';

// Redirect if already logged in
if (isLoggedIn()) {
    redirect('/admin/');
}

$error = '';
$loginType = post('login_type', 'master');

if (isPost()) {
    if ($loginType === 'master') {
        $password = post('password');
        if (attemptMasterLogin($password)) {
            redirect('/admin/');
        } else {
            $error = 'Invalid master password.';
        }
    } else {
        $email = post('email');
        $password = post('password');
        if (attemptLogin($email, $password)) {
            redirect('/admin/');
        } else {
            $error = 'Invalid email or password.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | <?= e(getSetting('siteName', 'Elite Chauffeur')) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="/assets/css/admin.css" rel="stylesheet">
</head>
<body>
<div class="ec-login-page">
    <div class="ec-login-card">
        <h1>ELITE CHAUFFEUR</h1>
        <h2>Admin Portal</h2>
        <p>Sign in to manage your luxury fleet</p>

        <?php if ($error): ?>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #f87171; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-size: 14px;">
            <?= e($error) ?>
        </div>
        <?php endif; ?>

        <div class="ec-login-tabs">
            <button type="button" class="ec-login-tab <?= $loginType === 'master' ? 'active' : '' ?>" onclick="setLoginType('master')">Master Password</button>
            <button type="button" class="ec-login-tab <?= $loginType === 'staff' ? 'active' : '' ?>" onclick="setLoginType('staff')">Staff Account</button>
        </div>

        <form method="POST" id="loginForm">
            <input type="hidden" name="login_type" id="loginType" value="<?= e($loginType) ?>">

            <div id="masterFields" style="<?= $loginType === 'staff' ? 'display:none' : '' ?>">
                <div class="ec-form-group">
                    <label for="masterPassword">Master Password</label>
                    <input type="password" id="masterPassword" name="password" class="ec-form-control" placeholder="Enter master password" autocomplete="current-password">
                </div>
            </div>

            <div id="staffFields" style="<?= $loginType === 'master' ? 'display:none' : '' ?>">
                <div class="ec-form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" class="ec-form-control" placeholder="admin@company.com" autocomplete="email">
                </div>
                <div class="ec-form-group">
                    <label for="staffPassword">Password</label>
                    <input type="password" id="staffPassword" name="password" class="ec-form-control" placeholder="Enter your password" autocomplete="current-password">
                </div>
            </div>

            <button type="submit" class="ec-btn ec-btn-primary" style="width: 100%;">
                Sign In
            </button>
        </form>

        <p style="margin-top: 24px; font-size: 12px; color: var(--ec-text-muted);">
            Default master password: <code style="background: var(--ec-bg); padding: 2px 6px; border-radius: 4px;">admin123</code>
        </p>
    </div>
</div>

<script>
function setLoginType(type) {
    document.getElementById('loginType').value = type;
    document.querySelectorAll('.ec-login-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    if (type === 'master') {
        document.getElementById('masterFields').style.display = '';
        document.getElementById('staffFields').style.display = 'none';
    } else {
        document.getElementById('masterFields').style.display = 'none';
        document.getElementById('staffFields').style.display = '';
    }
}
</script>
</body>
</html>
