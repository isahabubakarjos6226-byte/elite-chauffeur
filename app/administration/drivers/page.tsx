'use client';

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star, Upload } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import type { Driver } from '@/lib/types';

const defaultDriver: Omit<Driver, 'id' | 'created_at'> = {
  name: '',
  phone: '',
  email: '',
  rating: 5.0,
  experience: 1,
  languages: '',
  photo_url: '',
  daily_rate: 300,
  available: true,
};

export default function AdminDriversPage() {
  const { drivers, settings, addDriver, updateDriver, deleteDriver } = useStore();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState(defaultDriver);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData(driver);
    } else {
      setEditingDriver(null);
      setFormData(defaultDriver);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
    setFormData(defaultDriver);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, formData);
    } else {
      addDriver(formData);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.confirmDeleteDriver || 'Are you sure you want to delete this driver?')) {
      deleteDriver(id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    
    // Convert to base64 for demo (in production, would upload to server)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, photo_url: base64 });
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.drivers}</h1>
          <p className="text-muted-foreground">{t.admin.driversDesc || 'Manage your chauffeur team.'}</p>
        </div>
        <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          {t.admin.addDriver || 'Add Driver'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.photo || 'Photo'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.name || 'Name'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.contact || 'Contact'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.languages || 'Languages'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.rating || 'Rating'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.experience || 'Experience'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.status || 'Status'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={driver.photo_url}
                      alt={driver.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{driver.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{driver.phone}</p>
                    <p className="text-xs text-muted-foreground">{driver.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {driver.languages}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-foreground fill-foreground" />
                      <span className="text-sm text-foreground">{driver.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {driver.experience} {t.admin.years || 'years'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'ec-status',
                      driver.available ? 'ec-status--completed' : 'ec-status--cancelled'
                    )}>
                      {driver.available ? (t.admin.available || 'Available') : (t.admin.unavailable || 'Unavailable')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(driver)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.common.edit}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t.common.delete}
                      >
                        <Trash2 size={18} />
                      </button>
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">
                {editingDriver ? (t.admin.editDriver || 'Edit Driver') : (t.admin.addNewDriver || 'Add New Driver')}
              </h2>
              <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.fullName || 'Full Name'} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ec-input w-full"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.phone || 'Phone'}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.email || 'Email'}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="ec-input w-full"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.ratingRange || 'Rating (0-5)'}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.experienceYears || 'Experience (years)'}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                    className="ec-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.dailyRate || 'Daily Rate'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.languagesSpoken || 'Languages'} ({t.admin.commaSeparated || 'comma-separated'})</label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="English, Spanish, French"
                  className="ec-input w-full"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.driverPhoto || 'Driver Photo'}</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                      className="ec-input w-full mb-2"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="ec-btn-outline text-sm inline-flex items-center gap-2"
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      {t.admin.uploadPhoto || 'Upload Photo'}
                    </button>
                  </div>
                  {formData.photo_url && (
                    <div className="relative">
                      <img 
                        src={formData.photo_url} 
                        alt="Driver Preview" 
                        className="w-16 h-16 object-cover rounded-full border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo_url: '' })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 rounded border-border bg-input text-foreground focus:ring-foreground"
                />
                <span className="text-foreground">{t.admin.available || 'Available'}</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="ec-btn-outline">
                  {t.common.cancel}
                </button>
                <button type="submit" className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
                  <Check size={18} />
                  {editingDriver ? (t.admin.saveChanges || 'Save Changes') : (t.admin.addDriver || 'Add Driver')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
