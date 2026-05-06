'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useStore, formatPrice } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import type { PricingTier } from '@/lib/types';

const defaultTier: Omit<PricingTier, 'id' | 'created_at'> = {
  name: '',
  category: '',
  price_per_km: 2.50,
  base_fee: 50,
  active: true,
};

export default function AdminPricingPage() {
  const { pricing, settings, addPricingTier, updatePricingTier, deletePricingTier } = useStore();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState(defaultTier);

  const openModal = (tier?: PricingTier) => {
    if (tier) {
      setEditingTier(tier);
      setFormData(tier);
    } else {
      setEditingTier(null);
      setFormData(defaultTier);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTier(null);
    setFormData(defaultTier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTier) {
      updatePricingTier(editingTier.id, formData);
    } else {
      addPricingTier(formData);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.confirmDeleteTier || 'Are you sure you want to delete this pricing tier?')) {
      deletePricingTier(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.pricing}</h1>
          <p className="text-muted-foreground">{t.admin.pricingDesc || 'Manage pricing tiers for your services.'}</p>
        </div>
        <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          {t.admin.addTier || 'Add Tier'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.name || 'Name'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.category}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.pricePerKm}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.baseFee}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.status}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pricing.map((tier) => (
                <tr key={tier.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {tier.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground capitalize">
                    {tier.category || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {formatPrice(tier.price_per_km, settings)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {formatPrice(tier.base_fee, settings)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'ec-status',
                      tier.active ? 'ec-status--completed' : 'ec-status--cancelled'
                    )}>
                      {tier.active ? (t.admin.active || 'Active') : (t.admin.inactive || 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(tier)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        title={t.common.edit}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tier.id)}
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">
                {editingTier ? (t.admin.editTier || 'Edit Pricing Tier') : (t.admin.addNewTier || 'Add New Tier')}
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
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.category} ({t.admin.optional || 'optional'})</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="ec-input w-full"
                >
                  <option value="">{t.admin.allCategories || 'All Categories'}</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="limousine">Limousine</option>
                  <option value="electric">Electric</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.pricePerKm}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_per_km}
                    onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) })}
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin.baseFee}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_fee}
                    onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) })}
                    className="ec-input w-full"
                  />
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
                  {editingTier ? (t.admin.saveChanges || 'Save Changes') : (t.admin.addTier || 'Add Tier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
