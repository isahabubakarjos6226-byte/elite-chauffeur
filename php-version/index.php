<?php
$pageTitle = 'Elite Chauffeur - Luxury Transportation Services';
$pageDescription = 'Premium luxury transportation services with professional chauffeurs and premium vehicles.';
require_once 'includes/header.php';

// Get cars for the hero section
$db = getDB();
$cars = $db->query("SELECT * FROM cars WHERE active = 1 ORDER BY brand ASC")->fetchAll();
$services = $db->query("SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC LIMIT 3")->fetchAll();
?>

<!-- Hero Section -->
<section class="relative min-h-screen flex items-center">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=1920&q=80" 
             alt="Luxury Car" 
             class="w-full h-full object-cover opacity-40">
        <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
    </div>
    
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Left Content -->
            <div>
                <p class="text-gold text-sm tracking-[0.3em] mb-4">LUXURY TRANSPORTATION</p>
                <h1 class="font-serif text-5xl md:text-7xl text-foreground mb-6 leading-tight">
                    <?php echo $lang['hero']['title']; ?>
                </h1>
                <p class="text-muted-foreground text-lg max-w-lg mb-8">
                    <?php echo $lang['hero']['subtitle']; ?>
                </p>
                <div class="flex flex-wrap gap-4">
                    <a href="book.php" class="ec-btn ec-btn-gold">
                        <?php echo $lang['nav']['book_now']; ?>
                    </a>
                    <a href="fleet.php" class="ec-btn ec-btn-outline">
                        <?php echo $lang['fleet']['title']; ?>
                    </a>
                </div>
            </div>
            
            <!-- Right - Booking Form -->
            <div class="bg-card/90 backdrop-blur-md border border-border rounded-2xl p-8">
                <h2 class="font-serif text-2xl text-foreground mb-6"><?php echo $lang['hero']['request_reservation']; ?></h2>
                
                <form action="book.php" method="GET" class="space-y-4">
                    <!-- Service Type -->
                    <div class="grid grid-cols-2 gap-2">
                        <label class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg cursor-pointer border border-border bg-foreground text-background">
                            <input type="radio" name="type" value="transfer" checked class="sr-only">
                            <i data-lucide="car" class="w-4 h-4"></i>
                            <?php echo $lang['hero']['transfer']; ?>
                        </label>
                        <label class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg cursor-pointer border border-border hover:border-foreground/50">
                            <input type="radio" name="type" value="daily" class="sr-only">
                            <i data-lucide="calendar" class="w-4 h-4"></i>
                            <?php echo $lang['hero']['daily_rental']; ?>
                        </label>
                    </div>
                    
                    <!-- Pickup Location -->
                    <div>
                        <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['pickup_location']; ?></label>
                        <input type="text" name="pickup" placeholder="<?php echo $lang['hero']['pickup_location']; ?>" class="ec-input">
                    </div>
                    
                    <!-- Dropoff Location -->
                    <div>
                        <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['dropoff_location']; ?></label>
                        <input type="text" name="dropoff" placeholder="<?php echo $lang['hero']['dropoff_location']; ?>" class="ec-input">
                    </div>
                    
                    <!-- Date & Time -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['pickup_date']; ?></label>
                            <input type="date" name="date" class="ec-input" min="<?php echo date('Y-m-d'); ?>">
                        </div>
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['pickup_time']; ?></label>
                            <input type="time" name="time" class="ec-input">
                        </div>
                    </div>
                    
                    <!-- Vehicle Select -->
                    <div>
                        <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['select_vehicle']; ?></label>
                        <select name="car_id" class="ec-input">
                            <option value=""><?php echo $lang['hero']['select_vehicle']; ?></option>
                            <?php foreach ($cars as $car): ?>
                            <option value="<?php echo $car['id']; ?>">
                                <?php echo $car['brand'] . ' ' . $car['model']; ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <button type="submit" class="ec-btn ec-btn-gold w-full">
                        <?php echo $lang['hero']['request_reservation']; ?>
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>

<!-- Services Section -->
<section class="py-20 bg-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <p class="text-gold text-sm tracking-[0.3em] mb-4">WHAT WE OFFER</p>
            <h2 class="font-serif text-4xl md:text-5xl text-foreground">
                <?php echo $lang['services']['title']; ?>
            </h2>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
            <?php foreach ($services as $service): ?>
            <div class="bg-background border border-border rounded-xl p-8 hover:border-gold/50 transition-all">
                <div class="w-14 h-14 rounded-lg bg-gold/10 flex items-center justify-center mb-6">
                    <i data-lucide="<?php echo strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $service['icon'])); ?>" class="w-6 h-6 text-gold"></i>
                </div>
                <h3 class="font-serif text-xl text-foreground mb-3"><?php echo $service['title']; ?></h3>
                <p class="text-muted-foreground text-sm leading-relaxed">
                    <?php echo $service['description']; ?>
                </p>
            </div>
            <?php endforeach; ?>
        </div>
        
        <div class="text-center mt-12">
            <a href="services.php" class="ec-btn ec-btn-outline">
                <?php echo $lang['services']['learn_more']; ?>
            </a>
        </div>
    </div>
</section>

<!-- Fleet Preview -->
<section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            <p class="text-gold text-sm tracking-[0.3em] mb-4">OUR VEHICLES</p>
            <h2 class="font-serif text-4xl md:text-5xl text-foreground">
                <?php echo $lang['fleet']['title']; ?>
            </h2>
            <p class="text-muted-foreground mt-4 max-w-2xl mx-auto">
                <?php echo $lang['fleet']['subtitle']; ?>
            </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
            <?php 
            $displayCars = array_slice($cars, 0, 3);
            foreach ($displayCars as $car): 
            ?>
            <div class="card overflow-hidden group">
                <div class="aspect-video overflow-hidden">
                    <img src="<?php echo $car['image_url']; ?>" 
                         alt="<?php echo $car['brand'] . ' ' . $car['model']; ?>"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-serif text-xl text-foreground">
                                <?php echo $car['brand']; ?> <?php echo $car['model']; ?>
                            </h3>
                            <p class="text-sm text-muted-foreground capitalize"><?php echo $car['category']; ?></p>
                        </div>
                        <span class="text-gold font-semibold">
                            <?php echo formatPrice($car['price_per_km']); ?>/km
                        </span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span class="flex items-center gap-1">
                            <i data-lucide="users" class="w-4 h-4"></i>
                            <?php echo $car['capacity']; ?> <?php echo $lang['fleet']['passengers']; ?>
                        </span>
                    </div>
                    <a href="fleet-detail.php?id=<?php echo $car['id']; ?>" class="ec-btn ec-btn-outline w-full">
                        <?php echo $lang['fleet']['view_details']; ?>
                    </a>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        
        <div class="text-center mt-12">
            <a href="fleet.php" class="ec-btn ec-btn-gold">
                <?php echo $lang['fleet']['title']; ?>
            </a>
        </div>
    </div>
</section>

<?php require_once 'includes/footer.php'; ?>
