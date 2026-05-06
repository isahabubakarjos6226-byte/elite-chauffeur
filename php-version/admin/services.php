<?php
$pageTitle = 'Services';
require_once 'includes/header.php';

$db = getDB();

// Available icons
$icons = [
    ['name' => 'Plane', 'label' => 'Airport'],
    ['name' => 'Building2', 'label' => 'Corporate'],
    ['name' => 'PartyPopper', 'label' => 'Events'],
    ['name' => 'Clock', 'label' => 'Hourly'],
    ['name' => 'Route', 'label' => 'Long Distance'],
    ['name' => 'Car', 'label' => 'Car'],
    ['name' => 'Heart', 'label' => 'Wedding'],
    ['name' => 'Briefcase', 'label' => 'Business'],
    ['name' => 'MapPin', 'label' => 'Location'],
    ['name' => 'Crown', 'label' => 'VIP'],
    ['name' => 'Star', 'label' => 'Premium'],
    ['name' => 'Users', 'label' => 'Group'],
];

// Handle actions
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create' || $action === 'update') {
        $id = (int)($_POST['id'] ?? 0);
        $title = sanitize($_POST['title'] ?? '');
        $description = sanitize($_POST['description'] ?? '');
        $icon = sanitize($_POST['icon'] ?? 'Car');
        $imageUrl = sanitize($_POST['image_url'] ?? '');
        $sortOrder = (int)($_POST['sort_order'] ?? 1);
        $active = isset($_POST['active']) ? 1 : 0;
        
        if ($title) {
            try {
                if ($action === 'create') {
                    $stmt = $db->prepare("INSERT INTO services (title, description, icon, image_url, sort_order, active) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $description, $icon, $imageUrl, $sortOrder, $active]);
                    $message = 'Service added successfully';
                } else {
                    $stmt = $db->prepare("UPDATE services SET title = ?, description = ?, icon = ?, image_url = ?, sort_order = ?, active = ? WHERE id = ?");
                    $stmt->execute([$title, $description, $icon, $imageUrl, $sortOrder, $active, $id]);
                    $message = 'Service updated successfully';
                }
            } catch (Exception $e) {
                $error = 'Error: ' . $e->getMessage();
            }
        }
    }
    
    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $db->prepare("DELETE FROM services WHERE id = ?");
        $stmt->execute([$id]);
        $message = 'Service deleted successfully';
    }
}

$services = $db->query("SELECT * FROM services ORDER BY sort_order ASC")->fetchAll();

// Icon name to lucide format
function toLucideIcon($name) {
    return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $name));
}
?>

<div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-serif text-foreground"><?php echo $lang['admin']['services']; ?></h1>
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

<!-- Services Grid -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach ($services as $service): ?>
    <div class="bg-card border border-border rounded-xl overflow-hidden">
        <?php if ($service['image_url']): ?>
        <img src="<?php echo $service['image_url']; ?>" alt="<?php echo $service['title']; ?>" class="w-full h-40 object-cover">
        <?php endif; ?>
        <div class="p-6">
            <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="<?php echo toLucideIcon($service['icon']); ?>" class="w-5 h-5 text-gold"></i>
                </div>
                <div>
                    <h3 class="text-foreground font-medium"><?php echo $service['title']; ?></h3>
                    <p class="text-xs text-muted">Order: <?php echo $service['sort_order']; ?></p>
                </div>
            </div>
            <p class="text-sm text-muted line-clamp-2 mb-4"><?php echo $service['description']; ?></p>
            <div class="flex items-center justify-between">
                <span class="px-2 py-1 rounded-full text-xs <?php echo $service['active'] ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'; ?>">
                    <?php echo $service['active'] ? 'Active' : 'Inactive'; ?>
                </span>
                <div class="flex items-center gap-2">
                    <button onclick='editService(<?php echo json_encode($service); ?>)' class="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <i data-lucide="pencil" class="w-4 h-4 text-muted"></i>
                    </button>
                    <form method="POST" onsubmit="return confirm('Delete this service?');" class="inline">
                        <input type="hidden" name="action" value="delete">
                        <input type="hidden" name="id" value="<?php echo $service['id']; ?>">
                        <button type="submit" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <?php endforeach; ?>
</div>

<!-- Modal -->
<div id="modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/60" onclick="closeModal()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl">
        <div class="p-6 border-b border-border flex items-center justify-between">
            <h2 id="modalTitle" class="text-xl font-serif text-foreground">Add Service</h2>
            <button onclick="closeModal()" class="p-2 hover:bg-secondary rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <form method="POST" class="p-6 space-y-4">
            <input type="hidden" name="action" id="formAction" value="create">
            <input type="hidden" name="id" id="formId" value="">
            
            <div>
                <label class="block text-sm text-muted mb-2">Title *</label>
                <input type="text" name="title" id="title" required class="ec-input">
            </div>
            
            <div>
                <label class="block text-sm text-muted mb-2">Description</label>
                <textarea name="description" id="description" rows="3" class="ec-input"></textarea>
            </div>
            
            <div>
                <label class="block text-sm text-muted mb-2">Icon</label>
                <input type="hidden" name="icon" id="icon" value="Car">
                <div class="grid grid-cols-6 gap-2">
                    <?php foreach ($icons as $icon): ?>
                    <button type="button" onclick="selectIcon('<?php echo $icon['name']; ?>')" 
                            class="icon-btn p-3 rounded-lg border border-border hover:border-gold/50 transition-all flex flex-col items-center gap-1"
                            data-icon="<?php echo $icon['name']; ?>"
                            title="<?php echo $icon['label']; ?>">
                        <i data-lucide="<?php echo toLucideIcon($icon['name']); ?>" class="w-5 h-5"></i>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <div>
                <label class="block text-sm text-muted mb-2">Image URL</label>
                <input type="url" name="image_url" id="image_url" class="ec-input" placeholder="https://...">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-muted mb-2">Sort Order</label>
                    <input type="number" name="sort_order" id="sort_order" value="1" min="1" class="ec-input">
                </div>
                <div class="flex items-end">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="active" id="active" checked class="w-5 h-5 rounded">
                        <span class="text-foreground">Active</span>
                    </label>
                </div>
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
function selectIcon(name) {
    document.getElementById('icon').value = name;
    document.querySelectorAll('.icon-btn').forEach(btn => {
        if (btn.dataset.icon === name) {
            btn.classList.add('border-gold', 'bg-gold/10');
            btn.classList.remove('border-border');
        } else {
            btn.classList.remove('border-gold', 'bg-gold/10');
            btn.classList.add('border-border');
        }
    });
}

function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Add Service';
    document.getElementById('formAction').value = 'create';
    document.getElementById('formId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image_url').value = '';
    document.getElementById('sort_order').value = '1';
    document.getElementById('active').checked = true;
    selectIcon('Car');
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function editService(service) {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Edit Service';
    document.getElementById('formAction').value = 'update';
    document.getElementById('formId').value = service.id;
    document.getElementById('title').value = service.title;
    document.getElementById('description').value = service.description || '';
    document.getElementById('image_url').value = service.image_url || '';
    document.getElementById('sort_order').value = service.sort_order;
    document.getElementById('active').checked = service.active == 1;
    selectIcon(service.icon || 'Car');
    lucide.createIcons();
}

// Initialize icon selection
selectIcon('Car');
</script>

<?php require_once 'includes/footer.php'; ?>
