'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';
import type { TermsSection } from '@/lib/types';

const defaultSection: Omit<TermsSection, 'id' | 'created_at'> = {
  title: '',
  content: '',
  sort_order: 1,
};

export default function AdminTermsPage() {
  const { termsSections, addTermsSection, updateTermsSection, deleteTermsSection } = useStore();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TermsSection | null>(null);
  const [formData, setFormData] = useState(defaultSection);

  const sortedSections = [...termsSections].sort((a, b) => a.sort_order - b.sort_order);

  const openModal = (section?: TermsSection) => {
    if (section) {
      setEditingSection(section);
      setFormData(section);
    } else {
      setEditingSection(null);
      setFormData({ ...defaultSection, sort_order: termsSections.length + 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setFormData(defaultSection);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      updateTermsSection(editingSection.id, formData);
    } else {
      addTermsSection(formData);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.confirmDeleteSection || 'Are you sure you want to delete this section?')) {
      deleteTermsSection(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.termsConditions || 'Terms & Conditions'}</h1>
          <p className="text-muted-foreground">{t.admin.termsDesc || 'Manage your terms and conditions content.'}</p>
        </div>
        <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          {t.admin.addSection || 'Add Section'}
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sortedSections.map((section) => (
          <div 
            key={section.id}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <span className="text-background font-medium">{section.sort_order}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {section.content}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(section)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title={t.common.edit}
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title={t.common.delete}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedSections.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground mb-4">{t.admin.noSections || 'No terms sections yet.'}</p>
            <button onClick={() => openModal()} className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
              <Plus size={18} />
              {t.admin.addFirstSection || 'Add Your First Section'}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">
                {editingSection ? (t.admin.editSection || 'Edit Section') : (t.admin.addNewSection || 'Add New Section')}
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
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.sortOrder || 'Sort Order'}</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="ec-input w-full"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin.content || 'Content'} *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="ec-input w-full min-h-[150px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="ec-btn-outline">
                  {t.common.cancel}
                </button>
                <button type="submit" className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
                  <Check size={18} />
                  {editingSection ? (t.admin.saveChanges || 'Save Changes') : (t.admin.addSection || 'Add Section')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
