'use client';

import { useState, useRef } from 'react';
import { 
  Plus, Pencil, Trash2, X, Check, Upload,
  Plane, Building2, PartyPopper, Clock, Route, Car, 
  Heart, Briefcase, MapPin, Crown, Star, Users,
  Calendar, Shield, Sparkles, Trophy
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/types';

// Available icons for services
const availableIcons = [
  { name: 'Plane', icon: Plane, label: 'Airport' },
  { name: 'Building2', icon: Building2, label: 'Corporate' },
  { name: 'PartyPopper', icon: PartyPopper, label: 'Events' },
  { name: 'Clock', icon: Clock, label: 'Hourly' },
  { name: 'Route', icon: Route, label: 'Long Distance' },
  { name: 'Car', icon: Car, label: 'Car' },
  { name: 'Heart', icon: Heart, label: 'Wedding' },
  { name: 'Briefcase', icon: Briefcase, label: 'Business' },
  { name: 'MapPin', icon: MapPin, label: 'Location' },
  { name: 'Crown', icon: Crown, label: 'VIP' },
  { name: 'Star', icon: Star, label: 'Premium' },
  { name: 'Users', icon: Users, label: 'Group' },
  { name: 'Calendar', icon: Calendar, label: 'Scheduled' },
  { name: 'Shield', icon: Shield, label: 'Security' },
  { name: 'Sparkles', icon: Sparkles, label: 'Luxury' },
  { name: 'Trophy', icon: Trophy, label: 'Executive' },
];

// Helper to get icon component by name
export const getServiceIcon = (iconName: string) => {
  const found = availableIcons.find(i => i.name === iconName);
  return found?.icon || Car;
};

const defaultService: Omit<Service, 'id' | 'created_at'> = {
  title: '',
  description: '',
  icon: 'Plane',
  image_url: '',
  sort_order: 1,
  active: true,
};

export default function AdminServicesPage() {
  const { services, addService, updateService, deleteService } = useStore();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(defaultService);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedServices = [...services].sort((a, b) => a.sort_order - b.sort_order);

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({ ...defaultService, sort_order: services.length + 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(defaultService);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, formData);
    } else {
      addService(formData);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.confirmDeleteService || 'Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, image_url: base64 });
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.services}</h1>
          <p className="text-muted-foreground">{t.admin.servicesDesc || 'Manage the services you offer.'}</p>
        </div>
        <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          {t.admin.addService || 'Add Service'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.order || 'Order'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.icon || 'Icon'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.title || 'Title'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.description}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.status}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedServices.map((service) => (
                <tr key={service.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">
                    {service.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const IconComponent = getServiceIcon(service.icon);
                      return (
                        <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                          <IconComponent size={20} className="text-foreground" />
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {service.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {service.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'ec-status',
                      service.active ? 'ec-status--completed' : 'ec-status--cancelled'
                    )}>
                      {service.active ? (t.admin.active || 'Active') : (t.admin.inactive || 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(service)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.common.edit}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
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
                {editingService ? (t.admin.editService || 'Edit Service') : (t.admin.addNewService || 'Add New Service')}
              </h2>
              <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.title || 'Title'} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="ec-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.description}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ec-input w-full min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.icon || 'Icon'}</label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map(({ name, icon: IconComp, label }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={cn(
                        "p-3 rounded-lg border transition-all flex flex-col items-center gap-1",
                        formData.icon === name
                          ? "border-foreground bg-foreground/10"
                          : "border-border hover:border-foreground/50 hover:bg-secondary"
                      )}
                      title={label}
                    >
                      <IconComp size={20} className={formData.icon === name ? "text-foreground" : "text-muted-foreground"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.sortOrder || 'Sort Order'}</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="ec-input w-full"
                  min="1"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.serviceImage || 'Service Image'}</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
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
                      {t.admin.uploadImage || 'Upload Image'}
                    </button>
                  </div>
                  {formData.image_url && (
                    <div className="relative">
                      <img 
                        src={formData.image_url} 
                        alt="Service Preview" 
                        className="w-20 h-14 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
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
                  {editingService ? (t.admin.saveChanges || 'Save Changes') : (t.admin.addService || 'Add Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
