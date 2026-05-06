'use client';

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Check, Upload } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import type { Car } from '@/lib/types';

const categories = ['sedan', 'suv', 'van', 'limousine', 'electric', 'sports'];

const defaultCar: Omit<Car, 'id' | 'created_at'> = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'sedan',
  capacity: 4,
  price_per_km: 2.50,
  base_fee: 50,
  driver_fee: 100,
  description: '',
  features: [],
  photo_url: '',
  available: true,
  available_for_hourly: false,
  internal_name: '',
};

export default function AdminCarsPage() {
  const { cars, settings, addCar, updateCar, deleteCar } = useStore();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState(defaultCar);
  const [featuresText, setFeaturesText] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = (car?: Car) => {
    if (car) {
      setEditingCar(car);
      setFormData(car);
      setFeaturesText(car.features.join(', '));
    } else {
      setEditingCar(null);
      setFormData(defaultCar);
      setFeaturesText('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
    setFormData(defaultCar);
    setFeaturesText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText.split(',').map(f => f.trim()).filter(Boolean);
    const data = { ...formData, features };

    if (editingCar) {
      updateCar(editingCar.id, data);
    } else {
      addCar(data);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.confirmDeleteVehicle || 'Are you sure you want to delete this vehicle?')) {
      deleteCar(id);
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sedan: t.admin.categorySédan || 'Sedan',
      suv: t.admin.categorySuv || 'SUV',
      van: t.admin.categoryVan || 'Van',
      limousine: t.admin.categoryLimousine || 'Limousine',
      electric: t.admin.categoryElectric || 'Electric',
      sports: t.admin.categorySports || 'Sports',
    };
    return labels[category] || category;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.fleetManagement || 'Fleet Management'}</h1>
          <p className="text-muted-foreground">{t.admin.fleetManagementDesc || 'Manage your vehicle inventory.'}</p>
        </div>
        <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          {t.admin.addVehicle || 'Add Vehicle'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.photo || 'Photo'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.vehicle || 'Vehicle'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.category || 'Category'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.capacity || 'Capacity'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.pricing || 'Pricing'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.status || 'Status'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={car.photo_url}
                      alt={`${car.brand} ${car.model}`}
                      className="w-20 h-14 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{car.year}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-foreground">{getCategoryLabel(car.category)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {car.capacity} {t.admin.passengers || 'passengers'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{formatPrice(car.price_per_km, settings)}/km</p>
                    <p className="text-xs text-muted-foreground">{t.admin.base || 'Base'}: {formatPrice(car.base_fee, settings)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'ec-status',
                      car.available ? 'ec-status--completed' : 'ec-status--cancelled'
                    )}>
                      {car.available ? (t.admin.available || 'Available') : (t.admin.unavailable || 'Unavailable')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(car)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.common.edit}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">
                {editingCar ? (t.admin.editVehicle || 'Edit Vehicle') : (t.admin.addNewVehicle || 'Add New Vehicle')}
              </h2>
              <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.brand || 'Brand'} *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="ec-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.model || 'Model'} *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="ec-input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.year || 'Year'}</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.category || 'Category'}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Car['category'] })}
                    className="ec-input w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.capacity || 'Capacity'}</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="ec-input w-full"
                    min="1"
                  />
                </div>
              </div>

              <div className={cn("grid gap-4", settings.showChauffeurService ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.pricePerKm || 'Price/km'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_per_km}
                    onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) })}
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.baseFee || 'Base Fee'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_fee}
                    onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) })}
                    className="ec-input w-full"
                  />
                </div>
                {settings.showChauffeurService && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">{t.admin.driverFee || 'Driver Fee'}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.driver_fee}
                      onChange={(e) => setFormData({ ...formData, driver_fee: parseFloat(e.target.value) })}
                      className="ec-input w-full"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.description || 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ec-input w-full min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.features || 'Features'} ({t.admin.commaSeparated || 'comma-separated'})</label>
                <input
                  type="text"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Leather Interior, Wi-Fi, Climate Control"
                  className="ec-input w-full"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.vehiclePhoto || 'Vehicle Photo'}</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://example.com/car.jpg"
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
                        alt="Vehicle Preview" 
                        className="w-24 h-16 object-cover rounded-lg border border-border"
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

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.internalName || 'Internal Name'}</label>
                <input
                  type="text"
                  value={formData.internal_name}
                  onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-5 h-5 rounded border-border bg-input text-foreground focus:ring-foreground"
                  />
                  <span className="text-foreground">{t.admin.available || 'Available'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available_for_hourly}
                    onChange={(e) => setFormData({ ...formData, available_for_hourly: e.target.checked })}
                    className="w-5 h-5 rounded border-border bg-input text-foreground focus:ring-foreground"
                  />
                  <span className="text-foreground">{t.admin.hourlyCharter || 'Hourly Charter'}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="ec-btn-outline">
                  {t.common.cancel}
                </button>
                <button type="submit" className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
                  <Check size={18} />
                  {editingCar ? (t.admin.saveChanges || 'Save Changes') : (t.admin.addVehicle || 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
