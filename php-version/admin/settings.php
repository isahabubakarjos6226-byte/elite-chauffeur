<?php
$pageTitle = 'Settings';
require_once 'includes/header.php';

$db = getDB();
$message = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $settings = [
        'site_name' => sanitize($_POST['site_name'] ?? ''),
        'tagline' => sanitize($_POST['tagline'] ?? ''),
        'phone' => sanitize($_POST['phone'] ?? ''),
        'email' => sanitize($_POST['email'] ?? ''),
        'address' => sanitize($_POST['address'] ?? ''),
        'currency_symbol' => sanitize($_POST['currency_symbol'] ?? 'MAD'),
        'currency_position' => sanitize($_POST['currency_position'] ?? 'after'),
        'show_chauffeur_service' => isset($_POST['show_chauffeur_service']) ? '1' : '0',
        'default_language' => sanitize($_POST['default_language'] ?? 'en'),
        'hero_title' => sanitize($_POST['hero_title'] ?? ''),
        'hero_subtitle' => sanitize($_POST['hero_subtitle'] ?? ''),
        'about_text' => sanitize($_POST['about_text'] ?? ''),
    ];
    
    foreach ($settings as $key => $value) {
        $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->execute([$key, $value, $value]);
    }
    
    $message = 'Settings saved successfully';
}

// Get current settings
$settings = [];
$result = $db->query("SELECT setting_key, setting_value FROM settings")->fetchAll();
foreach ($result as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}
?>

<h1 class="text-2xl font-serif text-foreground mb-8"><?php echo $lang['admin']['settings']; ?></h1>

<?php if ($message): ?>
<div class="bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg p-4 mb-6">
    <?php echo $message; ?>
</div>
<?php endif; ?>

<form method="POST" class="space-y-8">
    <!-- General Settings -->
    <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-medium text-foreground mb-6">General Settings</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm text-muted mb-2">Site Name</label>
                <input type="text" name="site_name" value="<?php echo $settings['site_name'] ?? 'Elite Chauffeur'; ?>" class="ec-input">
            </div>
            <div>
                <label class="block text-sm text-muted mb-2">Tagline</label>
                <input type="text" name="tagline" value="<?php echo $settings['tagline'] ?? ''; ?>" class="ec-input">
            </div>
        </div>
    </div>
    
    <!-- Contact Information -->
    <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-medium text-foreground mb-6">Contact Information</h2>
        
        <div class="grid md:grid-cols-3 gap-6">
            <div>
                <label class="block text-sm text-muted mb-2">Phone</label>
                <input type="text" name="phone" value="<?php echo $settings['phone'] ?? ''; ?>" class="ec-input">
            </div>
            <div>
                <label class="block text-sm text-muted mb-2">Email</label>
                <input type="email" name="email" value="<?php echo $settings['email'] ?? ''; ?>" class="ec-input">
            </div>
            <div>
                <label class="block text-sm text-muted mb-2">Address</label>
                <input type="text" name="address" value="<?php echo $settings['address'] ?? ''; ?>" class="ec-input">
            </div>
        </div>
    </div>
    
    <!-- Currency & Language -->
    <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-medium text-foreground mb-6">Currency & Language</h2>
        
        <div class="grid md:grid-cols-3 gap-6">
            <div>
                <label class="block text-sm text-muted mb-2">Currency Symbol</label>
                <input type="text" name="currency_symbol" value="<?php echo $settings['currency_symbol'] ?? 'MAD'; ?>" class="ec-input">
            </div>
            <div>
                <label class="block text-sm text-muted mb-2">Currency Position</label>
                <select name="currency_position" class="ec-input">
                    <option value="before" <?php echo ($settings['currency_position'] ?? '') === 'before' ? 'selected' : ''; ?>>Before ($ 100)</option>
                    <option value="after" <?php echo ($settings['currency_position'] ?? 'after') === 'after' ? 'selected' : ''; ?>>After (100 MAD)</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-muted mb-2">Default Language</label>
                <select name="default_language" class="ec-input">
                    <option value="en" <?php echo ($settings['default_language'] ?? 'en') === 'en' ? 'selected' : ''; ?>>English</option>
                    <option value="fr" <?php echo ($settings['default_language'] ?? '') === 'fr' ? 'selected' : ''; ?>>Français</option>
                    <option value="ar" <?php echo ($settings['default_language'] ?? '') === 'ar' ? 'selected' : ''; ?>>العربية</option>
                </select>
            </div>
        </div>
    </div>
    
    <!-- Service Options -->
    <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-medium text-foreground mb-6">Service Options</h2>
        
        <div>
            <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="show_chauffeur_service" 
                       <?php echo ($settings['show_chauffeur_service'] ?? '1') === '1' ? 'checked' : ''; ?>
                       class="w-5 h-5 rounded">
                <span class="text-foreground">Show Chauffeur Service Option</span>
            </label>
            <p class="text-sm text-muted mt-1 ml-8">
                When disabled, all driver-related options, fees, and pricing will be hidden from the website.
            </p>
        </div>
    </div>
    
    <!-- Hero Section -->
    <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-medium text-foreground mb-6">Homepage Hero</h2>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm text-muted mb-2">Hero Title</label>
                <input type="text" name="hero_title" value="<?php echo $settings['hero_title'] ?? 'ELITE CHAUFFEUR'; ?>" class="ec-input">
            </div>
            <div>
                <label class="block text-sm text-muted mb-2">Hero Subtitle</label>
                <textarea name="hero_subtitle" rows="2" class="ec-input"><?php echo $settings['hero_subtitle'] ?? ''; ?></textarea>
            </div>
        </div>
    </div>
    
    <!-- About -->
    <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="text-lg font-medium text-foreground mb-6">About Section</h2>
        
        <div>
            <label class="block text-sm text-muted mb-2">About Text</label>
            <textarea name="about_text" rows="4" class="ec-input"><?php echo $settings['about_text'] ?? ''; ?></textarea>
        </div>
    </div>
    
    <!-- Save Button -->
    <div class="flex justify-end">
        <button type="submit" class="px-6 py-3 bg-gold text-background rounded-lg hover:bg-gold/90 transition-colors">
            <?php echo $lang['admin']['save']; ?> Settings
        </button>
    </div>
</form>

<?php require_once 'includes/footer.php'; ?>
