'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

const defaultUser: Omit<User, 'id' | 'created_at'> = {
  name: '',
  email: '',
  role: 'admin',
  active: true,
};

export default function AdminUsersPage() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useStore();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState(defaultUser);
  const [password, setPassword] = useState('');

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData(defaultUser);
    }
    setPassword('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(defaultUser);
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (id === currentUser?.id) {
      alert(t.admin.cannotDeleteSelf || 'You cannot delete your own account.');
      return;
    }
    if (confirm(t.admin.confirmDeleteUser || 'Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.staffUsers}</h1>
          <p className="text-muted-foreground">{t.admin.staffUsersDesc || 'Manage admin accounts and permissions.'}</p>
        </div>
        <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          {t.admin.addUser || 'Add User'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.name || 'Name'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.email || 'Email'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.role || 'Role'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.status}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.created || 'Created'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-foreground">({t.admin.you || 'You'})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize',
                      user.role === 'super_admin' 
                        ? 'bg-foreground/20 text-foreground' 
                        : 'bg-blue-500/20 text-blue-400'
                    )}>
                      {user.role === 'super_admin' ? (t.admin.superAdmin || 'Super Admin') : (t.admin.adminRole || 'Admin')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'ec-status',
                      user.active ? 'ec-status--completed' : 'ec-status--cancelled'
                    )}>
                      {user.active ? (t.admin.active || 'Active') : (t.admin.inactive || 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.common.edit}
                      >
                        <Pencil size={18} />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={t.common.delete}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">
                {editingUser ? (t.admin.editUser || 'Edit User') : (t.admin.addNewUser || 'Add New User')}
              </h2>
              <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.name || 'Name'} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ec-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.email || 'Email'} *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ec-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {t.admin.password || 'Password'} {editingUser && `(${t.admin.leaveBlank || 'leave blank to keep current'})`}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ec-input w-full"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.role || 'Role'}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="ec-input w-full"
                >
                  <option value="admin">{t.admin.adminRole || 'Admin'}</option>
                  <option value="super_admin">{t.admin.superAdmin || 'Super Admin'}</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded border-border bg-input text-foreground focus:ring-foreground"
                />
                <span className="text-foreground">{t.admin.active || 'Active'}</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="ec-btn-outline">
                  {t.common.cancel}
                </button>
                <button type="submit" className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
                  <Check size={18} />
                  {editingUser ? (t.admin.saveChanges || 'Save Changes') : (t.admin.addUser || 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
