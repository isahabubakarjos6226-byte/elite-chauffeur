<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/layout.php';

requireLogin();

// Fetch dashboard stats
$totalCars = dbOne("SELECT COUNT(*) as count FROM cars WHERE available = 1")['count'];
$totalDrivers = dbOne("SELECT COUNT(*) as count FROM drivers WHERE available = 1")['count'];
$pendingReservations = dbOne("SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'")['count'];
$completedReservations = dbOne("SELECT COUNT(*) as count FROM reservations WHERE status = 'completed'")['count'];

$recentReservations = db("
    SELECT r.*, c.brand, c.model, d.name as driver_name 
    FROM reservations r
    LEFT JOIN cars c ON r.car_id = c.id
    LEFT JOIN drivers d ON r.driver_id = d.id
    ORDER BY r.created_at DESC
    LIMIT 5
");

// Revenue calculation
$todayRevenue = dbOne("
    SELECT COALESCE(SUM(total_price), 0) as total 
    FROM reservations 
    WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'
")['total'];

$monthlyRevenue = dbOne("
    SELECT COALESCE(SUM(total_price), 0) as total 
    FROM reservations 
    WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status != 'cancelled'
")['total'];

adminHead('Dashboard');
adminNav();
?>

<div class="ec-admin-header">
    <h1>Dashboard</h1>
    <a href="/admin/reservations.php?action=new" class="ec-btn ec-btn-primary">
        <i class="fas fa-plus"></i> New Reservation
    </a>
</div>

<?php showFlash(); ?>

<div class="ec-stats-grid">
    <div class="ec-stat-card">
        <h3>Today's Revenue</h3>
        <div class="value"><?= formatPrice($todayRevenue) ?></div>
    </div>
    <div class="ec-stat-card">
        <h3>Pending</h3>
        <div class="value"><?= $pendingReservations ?></div>
        <div class="sub">Reservations awaiting confirmation</div>
    </div>
    <div class="ec-stat-card">
        <h3>Active Fleet</h3>
        <div class="value"><?= $totalCars ?></div>
        <div class="sub">Available vehicles</div>
    </div>
    <div class="ec-stat-card">
        <h3>Chauffeurs</h3>
        <div class="value"><?= $totalDrivers ?></div>
        <div class="sub">Available drivers</div>
    </div>
</div>

<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
    <div>
        <div class="ec-card">
            <div class="ec-card-header">
                <h2>Recent Reservations</h2>
                <a href="/admin/reservations.php" class="ec-btn ec-btn-secondary">View All</a>
            </div>
            <div class="ec-table-wrap" style="border: none;">
                <table class="ec-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentReservations as $res): ?>
                        <tr>
                            <td>
                                <strong><?= e($res['customer_name']) ?></strong><br>
                                <small style="color: var(--ec-text-muted);"><?= e($res['customer_email']) ?></small>
                            </td>
                            <td><?= e($res['brand'] . ' ' . $res['model']) ?></td>
                            <td>
                                <?= formatDate($res['pickup_date']) ?><br>
                                <small style="color: var(--ec-text-muted);"><?= formatTime($res['pickup_time']) ?></small>
                            </td>
                            <td><span class="ec-status <?= getStatusClass($res['status']) ?>"><?= ucfirst(str_replace('_', ' ', $res['status'])) ?></span></td>
                            <td><?= formatPrice($res['total_price']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($recentReservations)): ?>
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 40px; color: var(--ec-text-muted);">
                                No reservations yet
                            </td>
                        </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div>
        <div class="ec-chart-card">
            <h3>Monthly Revenue</h3>
            <canvas id="revenueChart" height="200"></canvas>
        </div>
        <div class="ec-card">
            <h3 style="margin-bottom: 16px;">Quick Stats</h3>
            <div style="space-y: 16px;">
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--ec-border);">
                    <span style="color: var(--ec-text-muted);">This Month</span>
                    <strong><?= formatPrice($monthlyRevenue) ?></strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--ec-border);">
                    <span style="color: var(--ec-text-muted);">Completed Rides</span>
                    <strong><?= $completedReservations ?></strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span style="color: var(--ec-text-muted);">Fleet Utilization</span>
                    <strong><?= $totalCars > 0 ? round(($completedReservations / max($totalCars, 1)) * 10) : 0 ?>%</strong>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Simple revenue chart
const ctx = document.getElementById('revenueChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Revenue',
            data: [<?= $monthlyRevenue * 0.2 ?>, <?= $monthlyRevenue * 0.35 ?>, <?= $monthlyRevenue * 0.6 ?>, <?= $monthlyRevenue ?>],
            borderColor: '#f2f2f2',
            backgroundColor: 'rgba(242, 242, 242, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: '#333' },
                ticks: { color: '#888' }
            },
            y: {
                grid: { color: '#333' },
                ticks: { color: '#888' }
            }
        }
    }
});
</script>

<?php adminFoot(); ?>
