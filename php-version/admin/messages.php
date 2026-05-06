<?php
$pageTitle = 'Messages';
require_once 'includes/header.php';

$db = getDB();

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = (int)($_POST['id'] ?? 0);
    
    if ($action === 'mark_read') {
        $stmt = $db->prepare("UPDATE messages SET is_read = 1 WHERE id = ?");
        $stmt->execute([$id]);
    }
    
    if ($action === 'delete') {
        $stmt = $db->prepare("DELETE FROM messages WHERE id = ?");
        $stmt->execute([$id]);
    }
}

$messages = $db->query("SELECT * FROM messages ORDER BY created_at DESC")->fetchAll();
$unreadCount = $db->query("SELECT COUNT(*) FROM messages WHERE is_read = 0")->fetchColumn();
?>

<div class="flex items-center justify-between mb-8">
    <div>
        <h1 class="text-2xl font-serif text-foreground"><?php echo $lang['admin']['messages']; ?></h1>
        <?php if ($unreadCount > 0): ?>
        <p class="text-sm text-muted mt-1"><?php echo $unreadCount; ?> unread message<?php echo $unreadCount > 1 ? 's' : ''; ?></p>
        <?php endif; ?>
    </div>
</div>

<?php if (empty($messages)): ?>
<div class="bg-card border border-border rounded-xl p-8 text-center">
    <i data-lucide="mail" class="w-12 h-12 text-muted mx-auto mb-4"></i>
    <p class="text-muted">No messages yet</p>
</div>
<?php else: ?>
<div class="space-y-4">
    <?php foreach ($messages as $msg): ?>
    <div class="bg-card border border-border rounded-xl p-6 <?php echo !$msg['is_read'] ? 'border-l-4 border-l-gold' : ''; ?>">
        <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-foreground font-medium"><?php echo $msg['name']; ?></h3>
                    <?php if (!$msg['is_read']): ?>
                    <span class="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">New</span>
                    <?php endif; ?>
                </div>
                <p class="text-sm text-muted mb-1"><?php echo $msg['email']; ?> <?php if ($msg['phone']): ?>| <?php echo $msg['phone']; ?><?php endif; ?></p>
                <?php if ($msg['subject']): ?>
                <p class="text-foreground font-medium mt-3"><?php echo $msg['subject']; ?></p>
                <?php endif; ?>
                <p class="text-muted mt-2"><?php echo nl2br($msg['message']); ?></p>
                <p class="text-xs text-muted mt-4"><?php echo date('M d, Y H:i', strtotime($msg['created_at'])); ?></p>
            </div>
            
            <div class="flex items-center gap-2">
                <?php if (!$msg['is_read']): ?>
                <form method="POST" class="inline">
                    <input type="hidden" name="action" value="mark_read">
                    <input type="hidden" name="id" value="<?php echo $msg['id']; ?>">
                    <button type="submit" class="p-2 hover:bg-secondary rounded-lg transition-colors" title="Mark as read">
                        <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                    </button>
                </form>
                <?php endif; ?>
                <a href="mailto:<?php echo $msg['email']; ?>" class="p-2 hover:bg-secondary rounded-lg transition-colors" title="Reply">
                    <i data-lucide="reply" class="w-4 h-4 text-muted"></i>
                </a>
                <form method="POST" onsubmit="return confirm('Delete this message?');" class="inline">
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" name="id" value="<?php echo $msg['id']; ?>">
                    <button type="submit" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
                        <i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>

<?php require_once 'includes/footer.php'; ?>
