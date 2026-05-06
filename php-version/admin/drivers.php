<?php
$pageTitle = 'Drivers';
require_once 'includes/header.php';

$db = getDB();
$message = '';
$error = '';

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create' || $action === 'update') {
        $id = (int)($_POST['id'] ?? 0);
        $name = sanitize($_POST['name'] ?? '');
        $phone = sanitize($_POST['phone'] ?? '');
        $email = sanitize($_POST['email'] ?? '');
        $licenseNumber = sanitize($_POST['license_number'] ?? '');
        $rating = (float)($_POST['rating'] ?? 5.0);
        $available = isset($_POST['available']) ? 1 : 0;
        $active = isset($_POST['active']) ? 1 : 0;
        
        if ($name) {
            try {
                if ($action === 'create') {
                    $stmt = $db->prepare("INSERT INTO drivers (name, phone, email, license_number, rating, available, active) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $phone, $email, $licenseNumber, $rating, $available, $active]);
                    $message = 'Driver added successfully';
                } else {
                    $stmt = $db->prepare("UPDATE drivers SET name = ?, phone = ?, email = ?, license_number = ?, rating = ?, available = ?, active = ? WHERE id = ?");
                    $stmt->execute([$name, $phone, $email, $licenseNumber, $rating, $available, $active, $id]);
                    $message = 'Driver updated successfully';
                }
            } catch (Exception $e) {
                $error = 'Error: ' . $e->getMessage();
            }
        }
    }
    
    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $db->prepare("DELETE FROM drivers WHERE id = ?");
        $stmt->execute([$id]);
        $message = 'Driver deleted successfully';
    }
}

$drivers = $db->query("SELECT * FROM drivers ORDER BY name ASC")->fetchAll();
?>

<div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-serif text-foreground"><?php echo $lang['admin']['drivers']; ?></h1>
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

<!-- Drivers Table -->
<div class="bg-card border border-border rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-background">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Driver</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">License</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Rating</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border">
                <?php foreach ($drivers as $driver): ?>
                <tr class="hover:bg-background/50">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                <i data-lucide="user" class="w-5 h-5 text-gold"></i>
                            </div>
                            <div>
                                <p class="text-foreground font-medium"><?php echo $driver['name']; ?></p>
                                <p class="text-sm text-muted"><?php echo $driver['total_trips']; ?> trips</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <p class="text-foreground"><?php echo $driver['phone']; ?></p>
                        <p class="text-sm text-muted"><?php echo $driver['email']; ?></p>
                    </td>
                    <td class="px-6 py-4 text-foreground"><?php echo $driver['license_number']; ?></td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-1">
                            <i data-lucide="star" class="w-4 h-4 text-yellow-400 fill-yellow-400"></i>
                            <span class="text-foreground"><?php echo $driver['rating']; ?></span>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-col gap-1">
                            <span class="px-2 py-1 rounded-full text-xs inline-block w-fit <?php echo $driver['available'] ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'; ?>">
                                <?php echo $driver['available'] ? 'Available' : 'Busy'; ?>
                            </span>
                            <?php if (!$driver['active']): ?>
                            <span class="px-2 py-1 rounded-full text-xs inline-block w-fit bg-red-500/20 text-red-400">
                                Inactive
                            </span>
                            <?php endif; ?>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <button onclick='editDriver(<?php echo json_encode($driver); ?>)' class="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <i data-lucide="pencil" class="w-4 h-4 text-muted"></i>
                            </button>
                            <form method="POST" onsubmit="return confirm('Delete this driver?');" class="inline">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?php echo $driver['id']; ?>">
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
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl">
        <div class="p-6 border-b border-border flex items-center justify-between">
            <h2 id="modalTitle" class="text-xl font-serif text-foreground">Add Driver</h2>
            <button onclick="closeModal()" class="p-2 hover:bg-secondary rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <form method="POST" class="p-6 space-y-4">
            <input type="hidden" name="action" id="formAction" value="create">
            <input type="hidden" name="id" id="formId" value="">
            
            <div>
                <label class="block text-sm text-muted mb-2">Name *</label>
                <input type="text" name="name" id="name" required class="ec-input">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-muted mb-2">Phone</label>
                    <input type="text" name="phone" id="phone" class="ec-input">
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Email</label>
                    <input type="email" name="email" id="email" class="ec-input">
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-muted mb-2">License Number</label>
                    <input type="text" name="license_number" id="license_number" class="ec-input">
                </div>
                <div>
                    <label class="block text-sm text-muted mb-2">Rating</label>
                    <input type="number" name="rating" id="rating" value="5.0" min="0" max="5" step="0.1" class="ec-input">
                </div>
            </div>
            
            <div class="flex gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="available" id="available" checked class="w-5 h-5 rounded">
                    <span class="text-foreground">Available</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="active" id="active" checked class="w-5 h-5 rounded">
                    <span class="text-foreground">Active</span>
                </label>
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
    document.getElementById('modalTitle').textContent = 'Add Driver';
    document.getElementById('formAction').value = 'create';
    document.getElementById('formId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('license_number').value = '';
    document.getElementById('rating').value = '5.0';
    document.getElementById('available').checked = true;
    document.getElementById('active').checked = true;
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function editDriver(driver) {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Edit Driver';
    document.getElementById('formAction').value = 'update';
    document.getElementById('formId').value = driver.id;
    document.getElementById('name').value = driver.name;
    document.getElementById('phone').value = driver.phone || '';
    document.getElementById('email').value = driver.email || '';
    document.getElementById('license_number').value = driver.license_number || '';
    document.getElementById('rating').value = driver.rating;
    document.getElementById('available').checked = driver.available == 1;
    document.getElementById('active').checked = driver.active == 1;
    lucide.createIcons();
}
</script>

<?php require_once 'includes/footer.php'; ?>
