import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Shield, User, KeyRound } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { format } from "date-fns";

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  active: boolean;
  created_at: string;
}

const emptyForm = { name: "", email: "", password: "", role: "user" as "admin" | "user", active: true };

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  user:  "bg-secondary text-muted-foreground border-border",
};

export default function AdminUsers() {
  const { role: currentRole } = useAdminAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetch_ = () => {
    setLoading(true);
    fetch("/api/users")
      .then(r => r.json())
      .then((d: StaffUser[]) => { setUsers(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (u: StaffUser) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, active: u.active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" }); return;
    }
    if (!editing && !form.password.trim()) {
      toast({ title: "Password is required for new users", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const body: Record<string, any> = { name: form.name, email: form.email, role: form.role, active: form.active };
      if (form.password.trim()) body.password = form.password;

      const res = editing
        ? await fetch(`/api/users/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (res.ok) {
        toast({ title: editing ? "User updated" : "User created successfully" });
        setDialogOpen(false);
        fetch_();
      } else {
        const err = await res.json() as { error?: string };
        toast({ title: err.error ?? "Error saving user", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: StaffUser) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (res.ok) { toast({ title: "User deleted" }); fetch_(); }
  };

  const isSuperAdmin = currentRole === "super_admin";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Staff Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members and their permissions</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        )}
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 flex gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Admin</p>
            <p className="text-xs text-muted-foreground">Full access — can edit, delete reservations, export invoices, and send emails.</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">User</p>
            <p className="text-xs text-muted-foreground">Read-only — can view reservation details and send emails. Cannot delete.</p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32">
                  <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground text-sm">No staff users yet.</p>
                  {isSuperAdmin && <p className="text-muted-foreground text-xs">Click "Add User" to create the first one.</p>}
                </TableCell>
              </TableRow>
            ) : (
              users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${roleColors[u.role]}`}>
                      {u.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.active
                      ? <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500">Active</span>
                      : <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-500/20 text-red-500">Inactive</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-primary">
              {editing ? "Edit User" : "Add Staff User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Dupont"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@elitechauffeur.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" />
                {editing ? "New Password (leave blank to keep)" : "Password"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={editing ? "Leave blank to keep current" : "Min. 6 characters"}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v: "admin" | "user") => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Admin — full access</div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2"><User className="w-4 h-4" /> User — view + email only</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label>Active Account</Label>
                <p className="text-xs text-muted-foreground mt-0.5">User can log in to the admin panel</p>
              </div>
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : (editing ? "Save Changes" : "Create User")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
