<?php
$pageTitle = 'Book Your Journey - Elite Chauffeur';
require_once 'includes/header.php';

$db = getDB();
$cars = $db->query("SELECT * FROM cars WHERE active = 1 ORDER BY brand ASC")->fetchAll();

// Get settings
$showChauffeur = getSetting('show_chauffeur_service') === '1';

// Get pre-filled data from URL
$preType = sanitize($_GET['type'] ?? 'transfer');
$prePickup = sanitize($_GET['pickup'] ?? '');
$preDropoff = sanitize($_GET['dropoff'] ?? '');
$preDate = sanitize($_GET['date'] ?? '');
$preTime = sanitize($_GET['time'] ?? '');
$preCarId = (int)($_GET['car_id'] ?? 0);

// Handle form submission
$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $bookingType = sanitize($_POST['booking_type'] ?? 'transfer');
    $customerName = sanitize($_POST['customer_name'] ?? '');
    $customerEmail = sanitize($_POST['customer_email'] ?? '');
    $customerPhone = sanitize($_POST['customer_phone'] ?? '');
    $carId = (int)($_POST['car_id'] ?? 0);
    $pickupLocation = sanitize($_POST['pickup_location'] ?? '');
    $dropoffLocation = sanitize($_POST['dropoff_location'] ?? '');
    $pickupDate = sanitize($_POST['pickup_date'] ?? '');
    $pickupTime = sanitize($_POST['pickup_time'] ?? '');
    $returnDate = sanitize($_POST['return_date'] ?? '');
    $returnTime = sanitize($_POST['return_time'] ?? '');
    $distanceKm = (float)($_POST['distance_km'] ?? 0);
    $rentalDays = (int)($_POST['rental_days'] ?? 1);
    $withDriver = isset($_POST['with_driver']) ? 1 : 0;
    $notes = sanitize($_POST['notes'] ?? '');
    
    // Get car details for pricing
    $stmt = $db->prepare("SELECT * FROM cars WHERE id = ?");
    $stmt->execute([$carId]);
    $car = $stmt->fetch();
    
    if ($customerName && $customerEmail && $carId && $car) {
        // Calculate pricing
        $baseFee = $car['base_fee'];
        $distanceFee = 0;
        $driverFee = 0;
        $totalPrice = 0;
        
        if ($bookingType === 'transfer') {
            $distanceFee = $distanceKm * $car['price_per_km'];
            $totalPrice = $baseFee + $distanceFee;
        } else {
            $totalPrice = $car['price_per_day'] * $rentalDays;
        }
        
        if ($withDriver && $showChauffeur) {
            $driverFee = $car['driver_fee'];
            $totalPrice += $driverFee;
        }
        
        try {
            $stmt = $db->prepare("INSERT INTO reservations 
                (booking_type, customer_name, customer_email, customer_phone, car_id, 
                pickup_location, dropoff_location, pickup_date, pickup_time, return_date, return_time,
                distance_km, rental_days, with_driver, base_fee, distance_fee, driver_fee, total_price, notes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
            $stmt->execute([
                $bookingType, $customerName, $customerEmail, $customerPhone, $carId,
                $pickupLocation, $dropoffLocation, $pickupDate, $pickupTime, $returnDate, $returnTime,
                $distanceKm, $rentalDays, $withDriver, $baseFee, $distanceFee, $driverFee, $totalPrice, $notes
            ]);
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
<section class="py-12 bg-card border-b border-border">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-serif text-4xl md:text-5xl text-foreground mb-4">
            <?php echo $lang['booking']['title']; ?>
        </h1>
        <p class="text-muted-foreground text-lg">
            <?php echo $lang['booking']['subtitle']; ?>
        </p>
    </div>
</section>

<?php if ($success): ?>
<!-- Success Message -->
<section class="py-20">
    <div class="max-w-2xl mx-auto px-4 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <i data-lucide="check" class="w-10 h-10 text-green-500"></i>
        </div>
        <h2 class="font-serif text-3xl text-foreground mb-4">
            <?php echo $lang['booking']['success_title']; ?>
        </h2>
        <p class="text-muted-foreground mb-8">
            <?php echo $lang['booking']['success_message']; ?>
        </p>
        <a href="index.php" class="ec-btn ec-btn-gold">
            <?php echo $lang['nav']['home']; ?>
        </a>
    </div>
</section>
<?php else: ?>

<!-- Booking Form -->
<section class="py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <?php if ($error): ?>
        <div class="bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <?php echo $error; ?>
        </div>
        <?php endif; ?>
        
        <form method="POST" id="bookingForm" class="grid lg:grid-cols-3 gap-8">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Service Type -->
                <div class="card p-6">
                    <h2 class="font-serif text-xl text-foreground mb-4"><?php echo $lang['booking']['step1']; ?></h2>
                    <div class="grid grid-cols-2 gap-4">
                        <label class="flex items-center justify-center gap-2 py-4 px-4 rounded-lg cursor-pointer border transition-all <?php echo $preType === 'transfer' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/50'; ?>">
                            <input type="radio" name="booking_type" value="transfer" <?php echo $preType === 'transfer' ? 'checked' : ''; ?> class="sr-only" onchange="updateBookingType()">
                            <i data-lucide="car" class="w-5 h-5"></i>
                            <span class="font-medium"><?php echo $lang['hero']['transfer']; ?></span>
                        </label>
                        <label class="flex items-center justify-center gap-2 py-4 px-4 rounded-lg cursor-pointer border transition-all <?php echo $preType === 'daily' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/50'; ?>">
                            <input type="radio" name="booking_type" value="daily" <?php echo $preType === 'daily' ? 'checked' : ''; ?> class="sr-only" onchange="updateBookingType()">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                            <span class="font-medium"><?php echo $lang['hero']['daily_rental']; ?></span>
                        </label>
                    </div>
                </div>
                
                <!-- Route Details -->
                <div class="card p-6">
                    <h2 class="font-serif text-xl text-foreground mb-4"><?php echo $lang['booking']['step2']; ?></h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['pickup_location']; ?> *</label>
                            <input type="text" name="pickup_location" value="<?php echo $prePickup; ?>" required class="ec-input" placeholder="<?php echo $lang['hero']['pickup_location']; ?>">
                        </div>
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['dropoff_location']; ?> *</label>
                            <input type="text" name="dropoff_location" value="<?php echo $preDropoff; ?>" required class="ec-input" placeholder="<?php echo $lang['hero']['dropoff_location']; ?>">
                        </div>
                        
                        <!-- Distance (for transfer) -->
                        <div id="distanceField">
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['booking']['distance']; ?> (km)</label>
                            <input type="number" name="distance_km" id="distance_km" value="0" min="0" step="0.1" class="ec-input" onchange="calculatePrice()">
                        </div>
                        
                        <!-- Dates -->
                        <div class="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['pickup_date']; ?> *</label>
                                <input type="date" name="pickup_date" value="<?php echo $preDate; ?>" required class="ec-input" min="<?php echo date('Y-m-d'); ?>">
                            </div>
                            <div>
                                <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['pickup_time']; ?> *</label>
                                <input type="time" name="pickup_time" value="<?php echo $preTime; ?>" required class="ec-input">
                            </div>
                        </div>
                        
                        <!-- Return Date (for daily rental) -->
                        <div id="returnDateFields" class="grid sm:grid-cols-2 gap-4" style="display: none;">
                            <div>
                                <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['return_date']; ?></label>
                                <input type="date" name="return_date" class="ec-input" min="<?php echo date('Y-m-d'); ?>" onchange="calculateDays()">
                            </div>
                            <div>
                                <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['hero']['return_time']; ?></label>
                                <input type="time" name="return_time" class="ec-input">
                            </div>
                        </div>
                        
                        <input type="hidden" name="rental_days" id="rental_days" value="1">
                    </div>
                </div>
                
                <!-- Vehicle Selection -->
                <div class="card p-6">
                    <h2 class="font-serif text-xl text-foreground mb-4"><?php echo $lang['booking']['step3']; ?></h2>
                    <div class="space-y-3">
                        <?php foreach ($cars as $car): ?>
                        <label class="flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:border-foreground/50 <?php echo $preCarId === $car['id'] ? 'border-foreground bg-foreground/5' : 'border-border'; ?>">
                            <input type="radio" name="car_id" value="<?php echo $car['id']; ?>" 
                                   data-base="<?php echo $car['base_fee']; ?>"
                                   data-perkm="<?php echo $car['price_per_km']; ?>"
                                   data-perday="<?php echo $car['price_per_day']; ?>"
                                   data-driver="<?php echo $car['driver_fee']; ?>"
                                   <?php echo $preCarId === $car['id'] ? 'checked' : ''; ?> 
                                   class="sr-only" onchange="calculatePrice()">
                            <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand']; ?>" class="w-20 h-14 object-cover rounded">
                            <div class="flex-1">
                                <h3 class="text-foreground font-medium"><?php echo $car['brand'] . ' ' . $car['model']; ?></h3>
                                <p class="text-sm text-muted-foreground"><?php echo $car['capacity']; ?> <?php echo $lang['fleet']['passengers']; ?></p>
                            </div>
                            <div class="text-right">
                                <p class="text-foreground font-semibold"><?php echo formatPrice($car['price_per_km']); ?>/km</p>
                                <p class="text-sm text-muted-foreground"><?php echo formatPrice($car['price_per_day']); ?>/<?php echo $lang['fleet']['per_day']; ?></p>
                            </div>
                        </label>
                        <?php endforeach; ?>
                    </div>
                    
                    <?php if ($showChauffeur): ?>
                    <div class="mt-4 pt-4 border-t border-border">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="with_driver" id="with_driver" class="w-5 h-5 rounded" onchange="calculatePrice()">
                            <span class="text-foreground"><?php echo $lang['booking']['include_chauffeur']; ?></span>
                        </label>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- Customer Details -->
                <div class="card p-6">
                    <h2 class="font-serif text-xl text-foreground mb-4"><?php echo $lang['booking']['step4']; ?></h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['booking']['full_name']; ?> *</label>
                            <input type="text" name="customer_name" required class="ec-input" placeholder="<?php echo $lang['booking']['full_name']; ?>">
                        </div>
                        <div class="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['booking']['email']; ?> *</label>
                                <input type="email" name="customer_email" required class="ec-input" placeholder="<?php echo $lang['booking']['email']; ?>">
                            </div>
                            <div>
                                <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['booking']['phone']; ?></label>
                                <input type="tel" name="customer_phone" class="ec-input" placeholder="+212 600-000000">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-muted-foreground mb-2"><?php echo $lang['booking']['special_requests']; ?></label>
                            <textarea name="notes" rows="3" class="ec-input" placeholder="<?php echo $lang['booking']['special_requests']; ?>"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Sidebar - Price Summary -->
            <div class="lg:col-span-1">
                <div class="card p-6 sticky top-28">
                    <h3 class="font-serif text-xl text-foreground mb-6"><?php echo $lang['booking']['booking_summary']; ?></h3>
                    
                    <div id="priceSummary" class="space-y-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground"><?php echo $lang['booking']['service_type']; ?></span>
                            <span class="text-foreground" id="summaryType"><?php echo $lang['hero']['transfer']; ?></span>
                        </div>
                        
                        <div id="summaryDistance" class="flex justify-between text-sm">
                            <span class="text-muted-foreground"><?php echo $lang['booking']['distance']; ?></span>
                            <span class="text-foreground">0 km</span>
                        </div>
                        
                        <div id="summaryDays" class="flex justify-between text-sm" style="display: none;">
                            <span class="text-muted-foreground">Days</span>
                            <span class="text-foreground">1</span>
                        </div>
                        
                        <div class="border-t border-border pt-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-muted-foreground"><?php echo $lang['booking']['base_fee']; ?></span>
                                <span class="text-foreground" id="summaryBase">0.00 <?php echo CURRENCY_SYMBOL; ?></span>
                            </div>
                            <div id="summaryDistanceCost" class="flex justify-between text-sm">
                                <span class="text-muted-foreground"><?php echo $lang['booking']['distance_cost']; ?></span>
                                <span class="text-foreground">0.00 <?php echo CURRENCY_SYMBOL; ?></span>
                            </div>
                            <div id="summaryDriverFee" class="flex justify-between text-sm" style="display: none;">
                                <span class="text-muted-foreground"><?php echo $lang['booking']['chauffeur_fee']; ?></span>
                                <span class="text-foreground">0.00 <?php echo CURRENCY_SYMBOL; ?></span>
                            </div>
                        </div>
                        
                        <div class="border-t border-border pt-4">
                            <div class="flex justify-between items-center">
                                <span class="text-foreground font-medium"><?php echo $lang['booking']['estimated_total']; ?></span>
                                <span class="font-serif text-2xl text-gold" id="summaryTotal">0.00 <?php echo CURRENCY_SYMBOL; ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="ec-btn ec-btn-gold w-full mt-6">
                        <?php echo $lang['booking']['confirm_reservation']; ?>
                    </button>
                </div>
            </div>
        </form>
    </div>
</section>

<script>
const currencySymbol = '<?php echo CURRENCY_SYMBOL; ?>';
const currencyPosition = '<?php echo CURRENCY_POSITION; ?>';

function formatMoney(amount) {
    const formatted = parseFloat(amount).toFixed(2);
    return currencyPosition === 'before' ? currencySymbol + ' ' + formatted : formatted + ' ' + currencySymbol;
}

function updateBookingType() {
    const isTransfer = document.querySelector('input[name="booking_type"]:checked')?.value === 'transfer';
    
    document.getElementById('distanceField').style.display = isTransfer ? 'block' : 'none';
    document.getElementById('returnDateFields').style.display = isTransfer ? 'none' : 'grid';
    document.getElementById('summaryDistance').style.display = isTransfer ? 'flex' : 'none';
    document.getElementById('summaryDistanceCost').style.display = isTransfer ? 'flex' : 'none';
    document.getElementById('summaryDays').style.display = isTransfer ? 'none' : 'flex';
    
    document.getElementById('summaryType').textContent = isTransfer ? '<?php echo $lang['hero']['transfer']; ?>' : '<?php echo $lang['hero']['daily_rental']; ?>';
    
    // Update radio button styles
    document.querySelectorAll('input[name="booking_type"]').forEach(input => {
        const label = input.closest('label');
        if (input.checked) {
            label.classList.add('border-foreground', 'bg-foreground/5');
            label.classList.remove('border-border');
        } else {
            label.classList.remove('border-foreground', 'bg-foreground/5');
            label.classList.add('border-border');
        }
    });
    
    calculatePrice();
}

function calculateDays() {
    const pickupDate = document.querySelector('input[name="pickup_date"]').value;
    const returnDate = document.querySelector('input[name="return_date"]').value;
    
    if (pickupDate && returnDate) {
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        document.getElementById('rental_days').value = days;
        document.querySelector('#summaryDays span:last-child').textContent = days;
    }
    
    calculatePrice();
}

function calculatePrice() {
    const selectedCar = document.querySelector('input[name="car_id"]:checked');
    if (!selectedCar) return;
    
    const isTransfer = document.querySelector('input[name="booking_type"]:checked')?.value === 'transfer';
    const baseFee = parseFloat(selectedCar.dataset.base) || 0;
    const pricePerKm = parseFloat(selectedCar.dataset.perkm) || 0;
    const pricePerDay = parseFloat(selectedCar.dataset.perday) || 0;
    const driverFee = parseFloat(selectedCar.dataset.driver) || 0;
    const distance = parseFloat(document.getElementById('distance_km').value) || 0;
    const days = parseInt(document.getElementById('rental_days').value) || 1;
    const withDriver = document.getElementById('with_driver')?.checked || false;
    
    let total = 0;
    let distanceCost = 0;
    
    if (isTransfer) {
        distanceCost = distance * pricePerKm;
        total = baseFee + distanceCost;
        document.getElementById('summaryBase').textContent = formatMoney(baseFee);
        document.querySelector('#summaryDistanceCost span:last-child').textContent = formatMoney(distanceCost);
        document.querySelector('#summaryDistance span:last-child').textContent = distance + ' km';
    } else {
        total = pricePerDay * days;
        document.getElementById('summaryBase').textContent = formatMoney(pricePerDay) + ' x ' + days;
    }
    
    if (withDriver) {
        total += driverFee;
        document.getElementById('summaryDriverFee').style.display = 'flex';
        document.querySelector('#summaryDriverFee span:last-child').textContent = formatMoney(driverFee);
    } else {
        document.getElementById('summaryDriverFee').style.display = 'none';
    }
    
    document.getElementById('summaryTotal').textContent = formatMoney(total);
    
    // Update car selection styles
    document.querySelectorAll('input[name="car_id"]').forEach(input => {
        const label = input.closest('label');
        if (input.checked) {
            label.classList.add('border-foreground', 'bg-foreground/5');
        } else {
            label.classList.remove('border-foreground', 'bg-foreground/5');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateBookingType();
    calculatePrice();
});
</script>

<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
