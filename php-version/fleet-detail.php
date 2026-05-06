<?php
require_once 'config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    redirect('/fleet.php');
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM cars WHERE id = ? AND active = 1");
$stmt->execute([$id]);
$car = $stmt->fetch();

if (!$car) {
    redirect('/fleet.php');
}

$pageTitle = $car['brand'] . ' ' . $car['model'] . ' - Elite Chauffeur';
require_once 'includes/header.php';

$features = $car['features'] ? explode(',', $car['features']) : [];
?>

<!-- Breadcrumb -->
<section class="py-4 border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 text-sm">
            <a href="index.php" class="text-muted-foreground hover:text-foreground"><?php echo $lang['nav']['home']; ?></a>
            <span class="text-muted-foreground">/</span>
            <a href="fleet.php" class="text-muted-foreground hover:text-foreground"><?php echo $lang['nav']['fleet']; ?></a>
            <span class="text-muted-foreground">/</span>
            <span class="text-foreground"><?php echo $car['brand'] . ' ' . $car['model']; ?></span>
        </div>
    </div>
</section>

<!-- Vehicle Details -->
<section class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12">
            <!-- Image -->
            <div class="aspect-video rounded-2xl overflow-hidden">
                <img src="<?php echo $car['image_url']; ?>" 
                     alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>"
                     class="w-full h-full object-cover">
            </div>
            
            <!-- Info -->
            <div>
                <span class="px-3 py-1 bg-gold/20 text-gold text-xs font-medium rounded-full uppercase">
                    <?php echo $car['category']; ?>
                </span>
                
                <h1 class="font-serif text-4xl md:text-5xl text-foreground mt-4 mb-2">
                    <?php echo $car['brand']; ?> <?php echo $car['model']; ?>
                </h1>
                <p class="text-muted-foreground text-lg mb-8"><?php echo $car['year']; ?></p>
                
                <!-- Pricing Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div class="bg-card border border-border rounded-xl p-4 text-center">
                        <p class="text-xs text-muted-foreground mb-1"><?php echo $lang['fleet']['base_fee']; ?></p>
                        <p class="text-xl font-semibold text-foreground"><?php echo formatPrice($car['base_fee']); ?></p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4 text-center">
                        <p class="text-xs text-muted-foreground mb-1"><?php echo $lang['fleet']['per_km']; ?></p>
                        <p class="text-xl font-semibold text-foreground"><?php echo formatPrice($car['price_per_km']); ?></p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4 text-center">
                        <p class="text-xs text-muted-foreground mb-1"><?php echo $lang['fleet']['per_day']; ?></p>
                        <p class="text-xl font-semibold text-foreground"><?php echo formatPrice($car['price_per_day']); ?></p>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4 text-center">
                        <p class="text-xs text-muted-foreground mb-1"><?php echo $lang['fleet']['passengers']; ?></p>
                        <p class="text-xl font-semibold text-foreground"><?php echo $car['capacity']; ?></p>
                    </div>
                </div>
                
                <!-- Features -->
                <?php if (!empty($features)): ?>
                <div class="mb-8">
                    <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        <?php echo $lang['fleet']['features']; ?>
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        <?php foreach ($features as $feature): ?>
                        <span class="px-3 py-1 bg-secondary text-foreground text-sm rounded-full">
                            <?php echo trim($feature); ?>
                        </span>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Book Button -->
                <a href="book.php?car_id=<?php echo $car['id']; ?>" class="ec-btn ec-btn-gold w-full text-center">
                    <?php echo $lang['fleet']['book_this']; ?>
                </a>
            </div>
        </div>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
