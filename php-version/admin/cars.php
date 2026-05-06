<?php
$pageTitle = 'Cars';
require_once 'includes/header.php';

$db = getDB();
$showChauffeur = getSetting('show_chauffeur_service') === '1';

// Handle actions
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create' || $action === 'update') {
        $id = (int)($_POST['id'] ?? 0);
        $brand = sanitize($_POST['brand'] ?? '');
        $model = sanitize($_POST['model'] ?? '');
        $category = sanitize($_POST['category'] ?? 'sedan');
        $year = (int)($_POST['year'] ?? date('Y'));
        $capacity = (int)($_POST['capacity'] ?? 4);
        $imageUrl = sanitize($_POST['image_url'] ?? '');
        $pricePerKm = (float)($_POST['price_per_km'] ?? 0);
        $pricePerDay = (float)($_POST['price_per_day'] ?? 0);
        $baseFee = (float)($_POST['base_fee'] ?? 0);
        $driverFee = (float)($_POST['driver_fee'] ?? 0);
        $features = sanitize($_POST['features'] ?? '');
        $active = isset($_POST['active']) ? 1 : 0;
        
        if ($brand && $model) {
            try {
                if ($action === 'create') {
                    $stmt = $db->prepare("INSERT INTO cars (brand, model, category, year, capacity, image_url, price_per_km, price_per_day, base_fee, driver_fee, features, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$brand, $model, $category, $year, $capacity, $imageUrl, $pricePerKm, $pricePerDay, $baseFee, $driverFee, $features, $active]);
                    $message = 'Car added successfully';
                } else {
                    $stmt = $db->prepare("UPDATE cars SET brand = ?, model = ?, category = ?, year = ?, capacity = ?, image_url = ?, price_per_km = ?, price_per_day = ?, base_fee = ?, driver_fee = ?, features = ?, active = ? WHERE id = ?");
                    $stmt->execute([$brand, $model, $category, $year, $capacity, $imageUrl, $pricePerKm, $pricePerDay, $baseFee, $driverFee, $features, $active, $id]);
                    $message = 'Car updated successfully';
                }
            } catch (Exception $e) {
                $error = 'Error: ' . $e->getMessage();
            }
        } else {
            $error = 'Please fill in brand and model';
        }
    }
    
    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        try {
            $stmt = $db->prepare("DELETE FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            $message = 'Car deleted successfully';
        } catch (Exception $e) {
            $error = 'Error deleting car';
        }
    }
}

$cars = $db->query("SELECT * FROM cars ORDER BY brand ASC")->fetchAll();
?>

<div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-serif text-foreground"><?php echo $lang['admin']['cars']; ?></h1>
    <button onclick="openModal()" class="px-4 py-2 bg-gold text-background rounded-lg hover:bg-gold/90 transition-colors">
        + <?php echo $lang['admin']['add_new']; ?>
    </button>
</div>

<?php if ($message): ?>
<div class="bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg p-4 mb-6">
    <?php echo $message; ?>
</div>
<?php endif; ?>

<?php if ($error): ?>
<div class="bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6">
    <?php echo $error; ?>
</div>
<?php endif; ?>

<!-- Cars Table -->
<div class="bg-card border border-border rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-background">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Vehicle</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Pricing</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                <?php foreach ($cars as $car): ?>
                <tr class="hover:bg-background/50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <img src="<?php echo $car['image_url']; ?>" alt="<?php echo $car['brand']; ?>" class="w-16 h-10 object-cover rounded">
                            <div>
                                <p class="text-foreground font-medium"><?php echo $car['brand'] . ' ' . $car['model']; ?></p>
                                <p class="text-sm text-muted"><?php echo $car['year']; ?> | <?php echo $car['capacity']; ?> seats</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-foreground capitalize"><?php echo $car['category']; ?></td>
                    <td class="px-6 py-4">
                        <p class="text-foreground"><?php echo formatPrice($car['price_per_km']); ?>/km</p>
                        <p class="text-sm text-muted"><?php echo formatPrice($car['price_per_day']); ?>/day</p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-full text-xs <?php echo $car['active'] ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'; ?>">
                            <?php echo $car['active'] ? 'Active' : 'Inactive'; ?>
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <button onclick='editCar(<?php echo json_encode($car); ?>)' class="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <i data-lucide="pencil" class="w-4 h-4 text-muted"></i>
                            </button>
                            <form method="POST" onsubmit="return confirm('Delete this car?');" class="inline">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?php echo $car['id']; ?>">
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
</div>

<!-- Modal -->
<div id="modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/60" onclick="closeModal()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl">
        <div class="p-6 border-b border-border flex items-center justify-between">
            <h2 id="modalTitle" class="text-xl font-serif text-foreground">Add Car</h2>
            <button onclick="closeModal()" class="p-2 hover:bg-secondary rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <form method="POST" class="p-6 space-y-4">
            <input type="hidden" name="action" id="formAction" value="create">
            <input type="hidden" name="id" id="formId" value="">
            
            <div class="grid sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-muted mb-2">Brand *</label>
                    <input type="text" name="brand" id="brand" required class="ec-input">
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Model *</label>
                    <input type="text" name="model" id="model" required class="ec-input">
                </div>
            </div>
            
            <div class="grid sm:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm text-muted mb-2">Category</label>
                    <select name="category" id="category" class="ec-input">
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="limousine">Limousine</option>
                        <option value="van">Van</option>
                        <option value="sports">Sports</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Year</label>
                    <input type="number" name="year" id="year" value="<?php echo date('Y'); ?>" class="ec-input">
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Capacity</label>
                    <input type="number" name="capacity" id="capacity" value="4" min="1" class="ec-input">
                </div>
            </div>
            
            <div>
                <label class="block text-sm text-muted mb-2">Image URL</label>
                <input type="url" name="image_url" id="image_url" class="ec-input" placeholder="https://...">
            </div>
            
            <div class="grid sm:grid-cols-<?php echo $showChauffeur ? '4' : '3'; ?> gap-4">
                <div>
                    <label class="block text-sm text-muted mb-2">Base Fee</label>
                    <input type="number" name="base_fee" id="base_fee" step="0.01" value="0" class="ec-input">
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Price/km</label>
                    <input type="number" name="price_per_km" id="price_per_km" step="0.01" value="0" class="ec-input">
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Price/day</label>
                    <input type="number" name="price_per_day" id="price_per_day" step="0.01" value="0" class="ec-input">
                </div>
                <?php if ($showChauffeur): ?>
                <div>
                    <label class="block text-sm text-muted mb-2">Driver Fee</label>
                    <input type="number" name="driver_fee" id="driver_fee" step="0.01" value="0" class="ec-input">
                </div>
                <?php endif; ?>
            </div>
            
            <div>
                <label class="block text-sm text-muted mb-2">Features (comma separated)</label>
                <input type="text" name="features" id="features" class="ec-input" placeholder="WiFi, Leather Seats, ...">
            </div>
            
            <div class="flex items-center gap-2">
                <input type="checkbox" name="active" id="active" checked class="w-5 h-5 rounded">
                <label for="active" class="text-foreground">Active</label>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
                <button type="button" onclick="closeModal()" class="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
                    <?php echo $lang['admin']['cancel']; ?>
                </button>
                <button type="submit" class="px-4 py-2 bg-gold text-background rounded-lg hover:bg-gold/90 transition-colors">
                    <?php echo $lang['admin']['save']; ?>
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Add Car';
    document.getElementById('formAction').value = 'create';
    document.getElementById('formId').value = '';
    // Reset form
    document.querySelectorAll('#modal input:not([type="hidden"]):not([type="checkbox"]), #modal select').forEach(el => {
        if (el.name === 'year') el.value = '<?php echo date('Y'); ?>';
        else if (el.name === 'capacity') el.value = '4';
        else if (el.type === 'number') el.value = '0';
        else el.value = '';
    });
    document.getElementById('active').checked = true;
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function editCar(car) {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Edit Car';
    document.getElementById('formAction').value = 'update';
    document.getElementById('formId').value = car.id;
    document.getElementById('brand').value = car.brand;
    document.getElementById('model').value = car.model;
    document.getElementById('category').value = car.category;
    document.getElementById('year').value = car.year;
    document.getElementById('capacity').value = car.capacity;
    document.getElementById('image_url').value = car.image_url || '';
    document.getElementById('base_fee').value = car.base_fee;
    document.getElementById('price_per_km').value = car.price_per_km;
    document.getElementById('price_per_day').value = car.price_per_day;
    <?php if ($showChauffeur): ?>
    document.getElementById('driver_fee').value = car.driver_fee;
    <?php endif; ?>
    document.getElementById('features').value = car.features || '';
    document.getElementById('active').checked = car.active == 1;
    lucide.createIcons();
}
</script>

<?php require_once 'includes/footer.php'; ?>
