<?php
$pageTitle = 'Contact Us - Elite Chauffeur';
require_once 'includes/header.php';

$success = false;
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitize($_POST['name'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $phone = sanitize($_POST['phone'] ?? '');
    $subject = sanitize($_POST['subject'] ?? '');
    $message = sanitize($_POST['message'] ?? '');
    
    if ($name && $email && $message) {
        try {
            $db = getDB();
            $stmt = $db->prepare("INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $phone, $subject, $message]);
            $success = true;
        } catch (Exception $e) {
            $error = $lang['general']['error'];
        }
    } else {
        $error = 'Please fill in all required fields.';
    }
}
?>

<!-- Hero -->
<section class="py-20 bg-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gold text-sm tracking-[0.3em] mb-4">GET IN TOUCH</p>
        <h1 class="font-serif text-5xl md:text-6xl text-foreground mb-6">
            <?php echo $lang['contact']['title']; ?>
        </h1>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            <?php echo $lang['contact']['subtitle']; ?>
        </p>
    </div>
</section>

<!-- Contact Section -->
<section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16">
            <!-- Contact Form -->
            <div>
                <h2 class="font-serif text-3xl text-foreground mb-8">Send us a message</h2>
                
                <?php if ($success): ?>
                <div class="bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg p-4 mb-6">
                    <?php echo $lang['contact']['success']; ?>
                </div>
                <?php endif; ?>
                
                <?php if ($error): ?>
                <div class="bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6">
                    <?php echo $error; ?>
                </div>
                <?php endif; ?>
                
                <form method="POST" class="space-y-6">
                    <div class="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['contact']['name']; ?> *</label>
                            <input type="text" name="name" required class="ec-input" placeholder="<?php echo $lang['contact']['name']; ?>">
                        </div>
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['contact']['email']; ?> *</label>
                            <input type="email" name="email" required class="ec-input" placeholder="<?php echo $lang['contact']['email']; ?>">
                        </div>
                    </div>
                    
                    <div class="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['contact']['phone']; ?></label>
                            <input type="tel" name="phone" class="ec-input" placeholder="+212 600-000000">
                        </div>
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['contact']['subject']; ?></label>
                            <input type="text" name="subject" class="ec-input" placeholder="<?php echo $lang['contact']['subject']; ?>">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['contact']['message']; ?> *</label>
                        <textarea name="message" rows="6" required class="ec-input" placeholder="<?php echo $lang['contact']['message']; ?>"></textarea>
                    </div>
                    
                    <button type="submit" class="ec-btn ec-btn-gold w-full sm:w-auto">
                        <?php echo $lang['contact']['send']; ?>
                    </button>
                </form>
            </div>
            
            <!-- Contact Info -->
            <div>
                <h2 class="font-serif text-3xl text-foreground mb-8">Contact Information</h2>
                
                <div class="space-y-8">
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="phone" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <h3 class="text-foreground font-medium mb-1"><?php echo $lang['contact']['phone_label']; ?></h3>
                            <p class="text-muted-foreground"><?php echo getSetting('phone') ?? '+212 600-000000'; ?></p>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="mail" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <h3 class="text-foreground font-medium mb-1"><?php echo $lang['contact']['email_label']; ?></h3>
                            <p class="text-muted-foreground"><?php echo getSetting('email') ?? 'contact@elitechauffeur.com'; ?></p>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <div class="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="map-pin" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <h3 class="text-foreground font-medium mb-1"><?php echo $lang['contact']['address']; ?></h3>
                            <p class="text-muted-foreground"><?php echo getSetting('address') ?? 'Casablanca, Morocco'; ?></p>
                        </div>
                    </div>
                </div>
                
                <!-- Map placeholder -->
                <div class="mt-12 aspect-video rounded-2xl overflow-hidden bg-card border border-border flex items-center justify-center">
                    <div class="text-center">
                        <i data-lucide="map" class="w-12 h-12 text-muted-foreground mx-auto mb-4"></i>
                        <p class="text-muted-foreground">Map integration available</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
