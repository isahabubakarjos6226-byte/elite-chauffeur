</main>

<!-- Footer -->
<footer class="bg-card border-t border-border mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid md:grid-cols-4 gap-12">
            <!-- Brand -->
            <div class="md:col-span-2">
                <h3 class="font-serif text-2xl text-foreground mb-4"><?php echo SITE_NAME; ?></h3>
                <p class="text-muted-foreground max-w-md">
                    <?php echo $lang['footer']['description']; ?>
                </p>
            </div>
            
            <!-- Quick Links -->
            <div>
                <h4 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                    <?php echo $lang['footer']['quick_links']; ?>
                </h4>
                <ul class="space-y-3">
                    <li><a href="index.php" class="text-muted-foreground hover:text-foreground transition-colors"><?php echo $lang['nav']['home']; ?></a></li>
                    <li><a href="fleet.php" class="text-muted-foreground hover:text-foreground transition-colors"><?php echo $lang['nav']['fleet']; ?></a></li>
                    <li><a href="services.php" class="text-muted-foreground hover:text-foreground transition-colors"><?php echo $lang['nav']['services']; ?></a></li>
                    <li><a href="contact.php" class="text-muted-foreground hover:text-foreground transition-colors"><?php echo $lang['nav']['contact']; ?></a></li>
                </ul>
            </div>
            
            <!-- Contact Info -->
            <div>
                <h4 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                    <?php echo $lang['footer']['contact_info']; ?>
                </h4>
                <ul class="space-y-3 text-muted-foreground">
                    <li class="flex items-center gap-2">
                        <i data-lucide="phone" class="w-4 h-4"></i>
                        <?php echo getSetting('phone') ?? '+212 600-000000'; ?>
                    </li>
                    <li class="flex items-center gap-2">
                        <i data-lucide="mail" class="w-4 h-4"></i>
                        <?php echo getSetting('email') ?? 'contact@elitechauffeur.com'; ?>
                    </li>
                    <li class="flex items-center gap-2">
                        <i data-lucide="map-pin" class="w-4 h-4"></i>
                        <?php echo getSetting('address') ?? 'Casablanca, Morocco'; ?>
                    </li>
                </ul>
            </div>
        </div>
        
        <!-- Copyright -->
        <div class="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
            &copy; <?php echo date('Y'); ?> <?php echo SITE_NAME; ?>. <?php echo $lang['footer']['copyright']; ?>
        </div>
    </div>
</footer>

<script>
    // Initialize Lucide icons
    lucide.createIcons();
</script>
</body>
</html>
<?php

// Helper function to get settings
function getSetting($key) {
    static $settings = null;
    
    if ($settings === null) {
        try {
            $db = getDB();
            $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
            $settings = [];
            while ($row = $stmt->fetch()) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
        } catch (Exception $e) {
            $settings = [];
        }
    }
    
    return $settings[$key] ?? null;
}
