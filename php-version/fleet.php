<?php
$pageTitle = 'Our Fleet - Elite Chauffeur';
require_once 'includes/header.php';

$db = getDB();
$cars = $db->query("SELECT * FROM cars WHERE active = 1 ORDER BY brand ASC")->fetchAll();

// Get filter from URL
$category = isset($_GET['category']) ? sanitize($_GET['category']) : '';
if ($category) {
    $stmt = $db->prepare("SELECT * FROM cars WHERE active = 1 AND category = ? ORDER BY brand ASC");
    $stmt->execute([$category]);
    $cars = $stmt->fetchAll();
}
?>

<!-- Hero -->
<section class="py-20 bg-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gold text-sm tracking-[0.3em] mb-4">PREMIUM COLLECTION</p>
        <h1 class="font-serif text-5xl md:text-6xl text-foreground mb-6">
            <?php echo $lang['fleet']['title']; ?>
        </h1>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            <?php echo $lang['fleet']['subtitle']; ?>
        </p>
    </div>
</section>

<!-- Filters -->
<section class="py-8 border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap gap-3 justify-center">
            <a href="fleet.php" class="px-4 py-2 rounded-lg text-sm <?php echo !$category ? 'bg-foreground text-background' : 'bg-secondary text-foreground hover:bg-secondary/80'; ?> transition-colors">
                All
            </a>
            <a href="fleet.php?category=sedan" class="px-4 py-2 rounded-lg text-sm <?php echo $category === 'sedan' ? 'bg-foreground text-background' : 'bg-secondary text-foreground hover:bg-secondary/80'; ?> transition-colors">
                Sedan
            </a>
            <a href="fleet.php?category=suv" class="px-4 py-2 rounded-lg text-sm <?php echo $category === 'suv' ? 'bg-foreground text-background' : 'bg-secondary text-foreground hover:bg-secondary/80'; ?> transition-colors">
                SUV
            </a>
            <a href="fleet.php?category=limousine" class="px-4 py-2 rounded-lg text-sm <?php echo $category === 'limousine' ? 'bg-foreground text-background' : 'bg-secondary text-foreground hover:bg-secondary/80'; ?> transition-colors">
                Limousine
            </a>
            <a href="fleet.php?category=van" class="px-4 py-2 rounded-lg text-sm <?php echo $category === 'van' ? 'bg-foreground text-background' : 'bg-secondary text-foreground hover:bg-secondary/80'; ?> transition-colors">
                Van
            </a>
        </div>
    </div>
</section>

<!-- Fleet Grid -->
<section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <?php if (empty($cars)): ?>
        <div class="text-center py-16">
            <p class="text-muted-foreground"><?php echo $lang['general']['no_results']; ?></p>
        </div>
        <?php else: ?>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <?php foreach ($cars as $car): ?>
            <div class="card overflow-hidden group">
                <div class="aspect-video overflow-hidden relative">
                    <img src="<?php echo $car['image_url']; ?>" 
                         alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1 bg-gold text-background text-xs font-medium rounded-full uppercase">
                            <?php echo $car['category']; ?>
                        </span>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-serif text-xl text-foreground">
                                <?php echo $car['brand']; ?> <?php echo $car['model']; ?>
                            </h3>
                            <p class="text-sm text-muted-foreground"><?php echo $car['year']; ?></p>
                        </div>
                    </div>
                    
                    <!-- Pricing -->
                    <div class="grid grid-cols-2 gap-4 py-4 border-y border-border my-4">
                        <div>
                            <p class="text-xs text-muted-foreground"><?php echo $lang['fleet']['base_fee']; ?></p>
                            <p class="text-foreground font-semibold"><?php echo formatPrice($car['base_fee']); ?></p>
                        </div>
                        <div>
                            <p class="text-xs text-muted-foreground"><?php echo $lang['fleet']['per_km']; ?></p>
                            <p class="text-foreground font-semibold"><?php echo formatPrice($car['price_per_km']); ?></p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span class="flex items-center gap-1">
                            <i data-lucide="users" class="w-4 h-4"></i>
                            <?php echo $car['capacity']; ?> <?php echo $lang['fleet']['passengers']; ?>
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <a href="fleet-detail.php?id=<?php echo $car['id']; ?>" class="ec-btn ec-btn-outline">
                            <?php echo $lang['fleet']['view_details']; ?>
                        </a>
                        <a href="book.php?car_id=<?php echo $car['id']; ?>" class="ec-btn ec-btn-gold">
                            <?php echo $lang['nav']['book_now']; ?>
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
