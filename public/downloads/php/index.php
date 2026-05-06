<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/layout.php';

$cars = db("SELECT * FROM cars WHERE available = 1 ORDER BY id LIMIT 6");

publicHead();
publicNav();
?>

<!-- Hero Section -->
<section class="ec-hero-split">
    <div class="ec-hero-bg" style="background-image: url('<?= e(getSetting('heroImageUrl')) ?>')"></div>
    <div class="ec-hero-content">
        <div class="ec-hero-text">
            <h1 class="ec-hero-title">
                <em>UNCOMPROMISING</em><br>
                <em>ELEGANCE</em>
            </h1>
            <p class="ec-hero-subtitle">
                Experience the pinnacle of luxury ground transportation. Impeccable 
                fleet, professional chauffeurs, and a commitment to absolute perfection.
            </p>
            <div class="ec-hero-actions">
                <a href="/fleet.php" class="ec-btn-primary">Explore Fleet</a>
                <a href="/services.php" class="ec-btn-outline">Our Services <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
        <div class="ec-hero-form">
            <h2>RESERVE YOUR RIDE</h2>
            <form action="/book.php" method="GET">
                <div class="ec-form-row">
                    <div class="ec-form-group">
                        <label>Pickup Location</label>
                        <div class="ec-input-icon">
                            <i class="fas fa-map-marker-alt"></i>
                            <input type="text" name="pickup" placeholder="Airport, Hotel, Address..." class="ec-input">
                        </div>
                    </div>
                    <div class="ec-form-group">
                        <label>Dropoff Location</label>
                        <div class="ec-input-icon">
                            <i class="fas fa-location-arrow"></i>
                            <input type="text" name="dropoff" placeholder="Destination address..." class="ec-input">
                        </div>
                    </div>
                </div>
                <div class="ec-form-row">
                    <div class="ec-form-group">
                        <label>Date</label>
                        <input type="date" name="date" class="ec-input">
                    </div>
                    <div class="ec-form-group">
                        <label>Time (24h)</label>
                        <input type="time" name="time" class="ec-input">
                    </div>
                </div>
                <div class="ec-form-group">
                    <label>Select Vehicle</label>
                    <select name="car" class="ec-input">
                        <option value="">Choose a luxury vehicle</option>
                        <?php foreach ($cars as $car): ?>
                        <option value="<?= $car['id'] ?>"><?= e($car['brand'] . ' ' . $car['model']) ?> - <?= $car['year'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="ec-form-row">
                    <div class="ec-form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" placeholder="John Doe" class="ec-input">
                    </div>
                    <div class="ec-form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="john@example.com" class="ec-input">
                    </div>
                </div>
                <button type="submit" class="ec-btn-primary ec-btn-block">Request Reservation</button>
            </form>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="ec-section">
    <div class="ec-container">
        <div class="ec-section-header">
            <h2>THE ELITE STANDARD</h2>
            <div class="ec-section-line"></div>
            <p>Every detail of our service is curated to provide a seamless, secure, and serene journey.</p>
        </div>
        <div class="ec-features-grid">
            <div class="ec-feature">
                <div class="ec-feature-icon">
                    <i class="fas fa-star"></i>
                </div>
                <h3>Impeccable Fleet</h3>
                <p>Our vehicles are meticulously maintained to showroom standards, featuring the latest in luxury and technology.</p>
            </div>
            <div class="ec-feature">
                <div class="ec-feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>Discreet &amp; Secure</h3>
                <p>Your privacy and security are paramount. Our chauffeurs are trained professionals committed to discretion.</p>
            </div>
            <div class="ec-feature">
                <div class="ec-feature-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3>Absolute Punctuality</h3>
                <p>Time is the ultimate luxury. We guarantee on-time arrivals with advanced tracking and route optimization.</p>
            </div>
        </div>
    </div>
</section>

<!-- Fleet Preview -->
<section class="ec-section ec-section-dark">
    <div class="ec-container">
        <div class="ec-section-header">
            <h2>THE FLEET</h2>
            <div class="ec-section-line"></div>
            <p>Select from our curated collection of world-class luxury vehicles.</p>
            <a href="/fleet.php" class="ec-link">View All Vehicles <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="ec-cars-grid">
            <?php foreach ($cars as $car): 
                $features = parseFeatures($car['features']);
            ?>
            <article class="ec-car-v2">
                <div class="ec-car-image">
                    <a href="/car.php?id=<?= $car['id'] ?>">
                        <img src="<?= e($car['photo_url']) ?>" alt="<?= e($car['brand'] . ' ' . $car['model']) ?>">
                    </a>
                    <span class="ec-car-year"><?= $car['year'] ?></span>
                    <?php if ($car['available_for_hourly']): ?>
                    <span class="ec-car-hourly"><i class="fas fa-clock"></i> HOURLY CHARTER</span>
                    <?php endif; ?>
                </div>
                <div class="ec-car-content">
                    <div class="ec-car-header">
                        <div>
                            <h3><?= e($car['brand']) ?></h3>
                            <p><?= e($car['model']) ?></p>
                        </div>
                        <div class="ec-car-price">
                            <strong><?= formatPrice($car['price_per_km']) ?></strong>
                            <span>per km</span>
                        </div>
                    </div>
                    <p class="ec-car-desc"><?= e($car['description']) ?></p>
                    <div class="ec-car-features">
                        <?php foreach (array_slice($features, 0, 3) as $feat): ?>
                        <span class="ec-feat-badge"><?= e($feat) ?></span>
                        <?php endforeach; ?>
                        <?php if (count($features) > 3): ?>
                        <span class="ec-feat-badge">+<?= count($features) - 3 ?> more</span>
                        <?php endif; ?>
                    </div>
                    <div class="ec-car-stats">
                        <span><i class="fas fa-users"></i> Up to <?= $car['capacity'] ?></span>
                        <span>
                            <?php if ($car['available_for_hourly']): ?>
                            <i class="fas fa-clock"></i> Hourly Charter
                            <?php else: ?>
                            <i class="fas fa-exchange-alt"></i> Transfer
                            <?php endif; ?>
                        </span>
                    </div>
                    <div class="ec-car-actions">
                        <a href="/car.php?id=<?= $car['id'] ?>" class="ec-btn-outline"><i class="fas fa-eye"></i> VIEW DETAILS</a>
                        <a href="/book.php?car=<?= $car['id'] ?>" class="ec-btn-primary">RESERVE NOW</a>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="ec-section ec-cta-section">
    <div class="ec-container">
        <div class="ec-section-header">
            <h2>READY TO EXPERIENCE LUXURY?</h2>
            <div class="ec-section-line"></div>
            <p>Whether it's a special occasion, business travel, or simply because you deserve the best — let us exceed your expectations.</p>
        </div>
        <div class="ec-cta-actions">
            <a href="/book.php" class="ec-btn-primary">Book Now</a>
            <a href="/contact.php" class="ec-btn-outline"><i class="fas fa-phone"></i> Contact Concierge</a>
        </div>
    </div>
</section>

<?php publicFoot(); ?>
