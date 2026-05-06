<?php
$pageTitle = 'Dashboard';
require_once 'includes/header.php';

$db = getDB();

// Get stats
$totalCars = $db->query("SELECT COUNT(*) FROM cars WHERE active = 1")->fetchColumn();
$totalReservations = $db->query("SELECT COUNT(*) FROM reservations")->fetchColumn();
$pendingReservations = $db->query("SELECT COUNT(*) FROM reservations WHERE status = 'pending'")->fetchColumn();
$totalDrivers = $db->query("SELECT COUNT(*) FROM drivers WHERE active = 1")->fetchColumn();
$unreadMessages = $db->query("SELECT COUNT(*) FROM messages WHERE is_read = 0")->fetchColumn();
$totalRevenue = $db->query("SELECT COALESCE(SUM(total_price), 0) FROM reservations WHERE status IN ('confirmed', 'completed')")->fetchColumn();

// Recent reservations
$recentReservations = $db->query("
    SELECT r.*, c.brand, c.model 
    FROM reservations r 
    LEFT JOIN cars c ON r.car_id = c.id 
    ORDER BY r.created_at DESC 
    LIMIT 5
")->fetchAll();
?>

<h1 class="text-2xl font-serif text-foreground mb-8"><?php echo $lang['admin']['dashboard']; ?></h1>

<!-- Stats Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <i data-lucide="calendar" class="w-6 h-6 text-blue-400"></i>
            </div>
            <div>
                <p class="text-2xl font-semibold text-foreground"><?php echo $totalReservations; ?></p>
                <p class="text-sm text-muted">Total Reservations</p>
            </div>
        </div>
    </div>
    
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <i data-lucide="clock" class="w-6 h-6 text-yellow-400"></i>
            </div>
            <div>
                <p class="text-2xl font-semibold text-foreground"><?php echo $pendingReservations; ?></p>
                <p class="text-sm text-muted">Pending</p>
            </div>
        </div>
    </div>
    
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <i data-lucide="banknote" class="w-6 h-6 text-green-400"></i>
            </div>
            <div>
                <p class="text-2xl font-semibold text-foreground"><?php echo formatPrice($totalRevenue); ?></p>
                <p class="text-sm text-muted">Revenue</p>
            </div>
        </div>
    </div>
    
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <i data-lucide="mail" class="w-6 h-6 text-purple-400"></i>
            </div>
            <div>
                <p class="text-2xl font-semibold text-foreground"><?php echo $unreadMessages; ?></p>
                <p class="text-sm text-muted">Unread Messages</p>
            </div>
        </div>
    </div>
</div>

<!-- Quick Stats -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-foreground font-medium">Fleet</h3>
            <a href="cars.php" class="text-sm text-gold hover:underline">View all</a>
        </div>
        <p class="text-3xl font-semibold text-foreground"><?php echo $totalCars; ?></p>
        <p class="text-sm text-muted">Active vehicles</p>
    </div>
    
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-foreground font-medium">Drivers</h3>
            <a href="drivers.php" class="text-sm text-gold hover:underline">View all</a>
        </div>
        <p class="text-3xl font-semibold text-foreground"><?php echo $totalDrivers; ?></p>
        <p class="text-sm text-muted">Active chauffeurs</p>
    </div>
    
    <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-foreground font-medium">Messages</h3>
            <a href="messages.php" class="text-sm text-gold hover:underline">View all</a>
        </div>
        <p class="text-3xl font-semibold text-foreground"><?php echo $unreadMessages; ?></p>
        <p class="text-sm text-muted">Unread messages</p>
    </div>
</div>

<!-- Recent Reservations -->
<div class="bg-card border border-border rounded-xl">
    <div class="p-6 border-b border-border flex items-center justify-between">
        <h2 class="text-lg font-medium text-foreground">Recent Reservations</h2>
        <a href="reservations.php" class="text-sm text-gold hover:underline">View all</a>
    </div>
    
    <?php if (empty($recentReservations)): ?>
    <div class="p-8 text-center text-muted">
        No reservations yet
    </div>
    <?php else: ?>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-background">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Vehicle</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Total</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                <?php foreach ($recentReservations as $res): ?>
                <tr class="hover:bg-background/50">
                    <td class="px-6 py-4">
                        <p class="text-foreground font-medium"><?php echo $res['customer_name']; ?></p>
                        <p class="text-sm text-muted"><?php echo $res['customer_email']; ?></p>
                    </td>
                    <td class="px-6 py-4 text-foreground">
                        <?php echo $res['brand'] . ' ' . $res['model']; ?>
                    </td>
                    <td class="px-6 py-4 text-muted">
                        <?php echo date('M d, Y', strtotime($res['pickup_date'])); ?>
                    </td>
                    <td class="px-6 py-4">
                        <?php
                        $statusColors = [
                            'pending' => 'bg-yellow-500/20 text-yellow-400',
                            'confirmed' => 'bg-blue-500/20 text-blue-400',
                            'in_progress' => 'bg-purple-500/20 text-purple-400',
                            'completed' => 'bg-green-500/20 text-green-400',
                            'cancelled' => 'bg-red-500/20 text-red-400',
                        ];
                        $color = $statusColors[$res['status']] ?? 'bg-gray-500/20 text-gray-400';
                        ?>
                        <span class="px-2 py-1 rounded-full text-xs <?php echo $color; ?>">
                            <?php echo ucfirst($res['status']); ?>
                        </span>
                    </td>
                    <td class="px-6 py-4 text-foreground font-medium">
                        <?php echo formatPrice($res['total_price']); ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/footer.php'; ?>
