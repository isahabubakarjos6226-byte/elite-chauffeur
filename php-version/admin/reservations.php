<?php
$pageTitle = 'Reservations';
require_once 'includes/header.php';

$db = getDB();

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_status') {
        $id = (int)($_POST['id'] ?? 0);
        $status = sanitize($_POST['status'] ?? '');
        
        $validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (in_array($status, $validStatuses)) {
            $stmt = $db->prepare("UPDATE reservations SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
        }
    }
    
    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $db->prepare("DELETE FROM reservations WHERE id = ?");
        $stmt->execute([$id]);
    }
}

// Get filter
$statusFilter = sanitize($_GET['status'] ?? '');

$sql = "SELECT r.*, c.brand, c.model FROM reservations r LEFT JOIN cars c ON r.car_id = c.id";
if ($statusFilter) {
    $sql .= " WHERE r.status = ?";
}
$sql .= " ORDER BY r.created_at DESC";

if ($statusFilter) {
    $stmt = $db->prepare($sql);
    $stmt->execute([$statusFilter]);
    $reservations = $stmt->fetchAll();
} else {
    $reservations = $db->query($sql)->fetchAll();
}

// Stats
$stats = [
    'pending' => $db->query("SELECT COUNT(*) FROM reservations WHERE status = 'pending'")->fetchColumn(),
    'confirmed' => $db->query("SELECT COUNT(*) FROM reservations WHERE status = 'confirmed'")->fetchColumn(),
    'completed' => $db->query("SELECT COUNT(*) FROM reservations WHERE status = 'completed'")->fetchColumn(),
];
?>

<h1 class="text-2xl font-serif text-foreground mb-8"><?php echo $lang['admin']['reservations']; ?></h1>

<!-- Stats -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <a href="?status=pending" class="bg-card border border-border rounded-xl p-4 hover:border-yellow-500/50 transition-colors">
        <p class="text-2xl font-semibold text-yellow-400"><?php echo $stats['pending']; ?></p>
        <p class="text-sm text-muted">Pending</p>
    </a>
    <a href="?status=confirmed" class="bg-card border border-border rounded-xl p-4 hover:border-blue-500/50 transition-colors">
        <p class="text-2xl font-semibold text-blue-400"><?php echo $stats['confirmed']; ?></p>
        <p class="text-sm text-muted">Confirmed</p>
    </a>
    <a href="?status=completed" class="bg-card border border-border rounded-xl p-4 hover:border-green-500/50 transition-colors">
        <p class="text-2xl font-semibold text-green-400"><?php echo $stats['completed']; ?></p>
        <p class="text-sm text-muted">Completed</p>
    </a>
</div>

<!-- Filters -->
<div class="flex flex-wrap gap-2 mb-6">
    <a href="reservations.php" class="px-4 py-2 rounded-lg text-sm <?php echo !$statusFilter ? 'bg-foreground text-background' : 'bg-secondary text-foreground'; ?>">
        All
    </a>
    <a href="?status=pending" class="px-4 py-2 rounded-lg text-sm <?php echo $statusFilter === 'pending' ? 'bg-foreground text-background' : 'bg-secondary text-foreground'; ?>">
        Pending
    </a>
    <a href="?status=confirmed" class="px-4 py-2 rounded-lg text-sm <?php echo $statusFilter === 'confirmed' ? 'bg-foreground text-background' : 'bg-secondary text-foreground'; ?>">
        Confirmed
    </a>
    <a href="?status=in_progress" class="px-4 py-2 rounded-lg text-sm <?php echo $statusFilter === 'in_progress' ? 'bg-foreground text-background' : 'bg-secondary text-foreground'; ?>">
        In Progress
    </a>
    <a href="?status=completed" class="px-4 py-2 rounded-lg text-sm <?php echo $statusFilter === 'completed' ? 'bg-foreground text-background' : 'bg-secondary text-foreground'; ?>">
        Completed
    </a>
    <a href="?status=cancelled" class="px-4 py-2 rounded-lg text-sm <?php echo $statusFilter === 'cancelled' ? 'bg-foreground text-background' : 'bg-secondary text-foreground'; ?>">
        Cancelled
    </a>
</div>

<!-- Reservations Table -->
<div class="bg-card border border-border rounded-xl overflow-hidden">
    <?php if (empty($reservations)): ?>
    <div class="p-8 text-center text-muted">
        No reservations found
    </div>
    <?php else: ?>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-background">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Route</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Vehicle</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                <?php foreach ($reservations as $res): ?>
                <tr class="hover:bg-background/50">
                    <td class="px-6 py-4 text-foreground">#<?php echo $res['id']; ?></td>
                    <td class="px-6 py-4">
                        <p class="text-foreground font-medium"><?php echo $res['customer_name']; ?></p>
                        <p class="text-sm text-muted"><?php echo $res['customer_email']; ?></p>
                        <p class="text-sm text-muted"><?php echo $res['customer_phone']; ?></p>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-foreground text-sm"><?php echo $res['pickup_location']; ?></p>
                        <p class="text-muted text-sm">→ <?php echo $res['dropoff_location']; ?></p>
                    </td>
                    <td class="px-6 py-4 text-foreground">
                        <?php echo $res['brand'] . ' ' . $res['model']; ?>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-foreground"><?php echo date('M d, Y', strtotime($res['pickup_date'])); ?></p>
                        <p class="text-sm text-muted"><?php echo $res['pickup_time']; ?></p>
                    </td>
                    <td class="px-6 py-4 text-foreground font-medium">
                        <?php echo formatPrice($res['total_price']); ?>
                    </td>
                    <td class="px-6 py-4">
                        <form method="POST" class="inline">
                            <input type="hidden" name="action" value="update_status">
                            <input type="hidden" name="id" value="<?php echo $res['id']; ?>">
                            <select name="status" onchange="this.form.submit()" 
                                    class="text-xs px-2 py-1 rounded-lg bg-background border border-border text-foreground">
                                <option value="pending" <?php echo $res['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="confirmed" <?php echo $res['status'] === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                <option value="in_progress" <?php echo $res['status'] === 'in_progress' ? 'selected' : ''; ?>>In Progress</option>
                                <option value="completed" <?php echo $res['status'] === 'completed' ? 'selected' : ''; ?>>Completed</option>
                                <option value="cancelled" <?php echo $res['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                            </select>
                        </form>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <button onclick='viewDetails(<?php echo json_encode($res); ?>)' class="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <i data-lucide="eye" class="w-4 h-4 text-muted"></i>
                            </button>
                            <form method="POST" onsubmit="return confirm('Delete this reservation?');" class="inline">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?php echo $res['id']; ?>">
                                <button type="submit" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                    <i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>
</div>

<!-- Details Modal -->
<div id="detailsModal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/60" onclick="closeDetails()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl">
        <div class="p-6 border-b border-border flex items-center justify-between">
            <h2 class="text-xl font-serif text-foreground">Reservation Details</h2>
            <button onclick="closeDetails()" class="p-2 hover:bg-secondary rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div id="detailsContent" class="p-6 space-y-4">
            <!-- Filled by JavaScript -->
        </div>
    </div>
</div>

<script>
function viewDetails(res) {
    const content = document.getElementById('detailsContent');
    content.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-muted">Customer</p>
                <p class="text-foreground">${res.customer_name}</p>
            </div>
            <div>
                <p class="text-sm text-muted">Email</p>
                <p class="text-foreground">${res.customer_email}</p>
            </div>
            <div>
                <p class="text-sm text-muted">Phone</p>
                <p class="text-foreground">${res.customer_phone || '-'}</p>
            </div>
            <div>
                <p class="text-sm text-muted">Type</p>
                <p class="text-foreground capitalize">${res.booking_type}</p>
            </div>
        </div>
        <div class="border-t border-border pt-4">
            <p class="text-sm text-muted">Pickup</p>
            <p class="text-foreground">${res.pickup_location}</p>
            <p class="text-sm text-muted mt-2">Dropoff</p>
            <p class="text-foreground">${res.dropoff_location}</p>
        </div>
        <div class="border-t border-border pt-4 grid grid-cols-2 gap-4">
            <div>
                <p class="text-sm text-muted">Date</p>
                <p class="text-foreground">${res.pickup_date} ${res.pickup_time}</p>
            </div>
            <div>
                <p class="text-sm text-muted">Distance</p>
                <p class="text-foreground">${res.distance_km || 0} km</p>
            </div>
        </div>
        <div class="border-t border-border pt-4">
            <div class="flex justify-between mb-2">
                <span class="text-muted">Base Fee</span>
                <span class="text-foreground">${res.base_fee} <?php echo CURRENCY_SYMBOL; ?></span>
            </div>
            <div class="flex justify-between mb-2">
                <span class="text-muted">Distance Fee</span>
                <span class="text-foreground">${res.distance_fee || 0} <?php echo CURRENCY_SYMBOL; ?></span>
            </div>
            ${res.with_driver ? `<div class="flex justify-between mb-2">
                <span class="text-muted">Driver Fee</span>
                <span class="text-foreground">${res.driver_fee || 0} <?php echo CURRENCY_SYMBOL; ?></span>
            </div>` : ''}
            <div class="flex justify-between font-semibold border-t border-border pt-2 mt-2">
                <span class="text-foreground">Total</span>
                <span class="text-gold">${res.total_price} <?php echo CURRENCY_SYMBOL; ?></span>
            </div>
        </div>
        ${res.notes ? `<div class="border-t border-border pt-4">
            <p class="text-sm text-muted">Notes</p>
            <p class="text-foreground">${res.notes}</p>
        </div>` : ''}
    `;
    document.getElementById('detailsModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeDetails() {
    document.getElementById('detailsModal').classList.add('hidden');
}
</script>

<?php require_once 'includes/footer.php'; ?>
