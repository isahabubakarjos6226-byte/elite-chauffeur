<?php
$pageTitle = 'Our Services - Elite Chauffeur';
require_once 'includes/header.php';

$db = getDB();
$services = $db->query("SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC")->fetchAll();

// Icon mapping for Lucide icons
$iconMap = [
    'Plane' => 'plane',
    'Building2' => 'building-2',
    'PartyPopper' => 'party-popper',
    'Clock' => 'clock',
    'Route' => 'route',
    'Car' => 'car',
    'Heart' => 'heart',
    'Briefcase' => 'briefcase',
    'MapPin' => 'map-pin',
    'Crown' => 'crown',
    'Star' => 'star',
    'Users' => 'users',
];
?>

<!-- Hero -->
<section class="py-20 bg-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gold text-sm tracking-[0.3em] mb-4">WHAT WE OFFER</p>
        <h1 class="font-serif text-5xl md:text-6xl text-foreground mb-6">
            <?php echo $lang['services']['title']; ?>
        </h1>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            <?php echo $lang['services']['subtitle']; ?>
        </p>
    </div>
</section>

<!-- Services Grid -->
<section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="space-y-24">
            <?php foreach ($services as $index => $service): 
                $isEven = $index % 2 === 0;
                $iconName = $iconMap[$service['icon']] ?? 'car';
            ?>
            <div class="grid lg:grid-cols-2 gap-12 items-center <?php echo $isEven ? '' : 'lg:flex-row-reverse'; ?>">
                <!-- Image -->
                <div class="<?php echo $isEven ? '' : 'lg:order-2'; ?>">
                    <div class="aspect-video rounded-2xl overflow-hidden">
                        <img src="<?php echo $service['image_url']; ?>" 
                             alt="<?php echo $service['title']; ?>"
                             class="w-full h-full object-cover">
                    </div>
                </div>
                
                <!-- Content -->
                <div class="<?php echo $isEven ? '' : 'lg:order-1'; ?>">
                    <div class="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                        <i data-lucide="<?php echo $iconName; ?>" class="w-7 h-7 text-gold"></i>
                    </div>
                    <h2 class="font-serif text-3xl md:text-4xl text-foreground mb-4">
                        <?php echo $service['title']; ?>
                    </h2>
                    <p class="text-muted-foreground text-lg leading-relaxed mb-8">
                        <?php echo $service['description']; ?>
                    </p>
                    <a href="book.php" class="ec-btn ec-btn-gold">
                        <?php echo $lang['nav']['book_now']; ?>
                    </a>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-card">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="font-serif text-4xl text-foreground mb-6">Ready to Experience Luxury?</h2>
        <p class="text-muted-foreground text-lg mb-8">
            Book your premium transportation today and discover the difference.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
            <a href="book.php" class="ec-btn ec-btn-gold">
                <?php echo $lang['nav']['book_now']; ?>
            </a>
            <a href="contact.php" class="ec-btn ec-btn-outline">
                <?php echo $lang['nav']['contact']; ?>
            </a>
        </div>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
