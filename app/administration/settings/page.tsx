'use client';

import { useState, useRef } from 'react';
import { Check, Eye, EyeOff, Upload, X, FileText } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';

export default function AdminSettingsPage() {
  const { settings, currentUser, updateSettings } = useStore();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    tagline: settings.tagline,
    // Homepage content
    heroTitle1: settings.heroTitle1 || 'Uncompromising',
    heroTitle2: settings.heroTitle2 || 'Elegance',
    heroSubtitle: settings.heroSubtitle || '',
    heroButtonText1: settings.heroButtonText1 || 'Explore Our Fleet',
    heroButtonText2: settings.heroButtonText2 || 'Our Services',
    featuresTitle: settings.featuresTitle || 'THE ELITE STANDARD',
    fleetTitle: settings.fleetTitle || 'OUR FLEET',
    ctaTitle: settings.ctaTitle || 'Experience Luxury',
    ctaSubtitle: settings.ctaSubtitle || '',
    // Other
    heroImageUrl: settings.heroImageUrl,
    showChauffeurService: settings.showChauffeurService,
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    contactAddress: settings.contactAddress,
    contactHours: settings.contactHours,
    currencySymbol: settings.currencySymbol,
    currencyPos: settings.currencyPos,
    currencyCode: settings.currencyCode,
    websiteLogoUrl: settings.websiteLogoUrl || '',
    invoiceLogoUrl: settings.invoiceLogoUrl || '',
    googleMapsApiKey: settings.googleMapsApiKey || '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState<'website' | 'invoice' | null>(null);

  const websiteLogoRef = useRef<HTMLInputElement>(null);
  const invoiceLogoRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (newPassword.length < 6) {
      setPasswordError(t.admin?.passwordMinLength || 'Password must be at least 6 characters.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t.admin?.passwordsNoMatch || 'Passwords do not match.');
      return;
    }

    alert(t.admin?.passwordUpdated || 'Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'website' | 'invoice') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(type);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'website') {
        setFormData({ ...formData, websiteLogoUrl: base64 });
      } else {
        setFormData({ ...formData, invoiceLogoUrl: base64 });
      }
      setUploadingLogo(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin?.settings || 'Settings'}</h1>
        <p className="text-muted-foreground">{t.admin?.settingsDesc || 'Configure your website and business settings.'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin?.general || 'General'}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.siteName || 'Site Name'}</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.tagline || 'Tagline'}</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.heroImageUrl || 'Hero Image URL'}</label>
                <input
                  type="url"
                  value={formData.heroImageUrl}
                  onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showChauffeurService}
                    onChange={(e) => setFormData({ ...formData, showChauffeurService: e.target.checked })}
                    className="w-5 h-5 rounded border-border bg-input text-foreground focus:ring-foreground"
                  />
                  <span className="text-foreground">{t.admin?.showChauffeurService || 'Show Chauffeur Service Option'}</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-7">
                  {t.admin?.chauffeurServiceDesc || 'When disabled, all driver-related options, fees, and pricing will be hidden from the website.'}
                </p>
              </div>
            </div>
          </div>

          {/* Homepage Content */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-foreground" />
              <h2 className="font-serif text-xl text-foreground">{t.admin?.homepageContent || 'Homepage Content'}</h2>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.heroTitle1 || 'Hero Title Line 1'}</label>
                  <input
                    type="text"
                    value={formData.heroTitle1}
                    onChange={(e) => setFormData({ ...formData, heroTitle1: e.target.value })}
                    placeholder="Uncompromising"
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.heroTitle2 || 'Hero Title Line 2'}</label>
                  <input
                    type="text"
                    value={formData.heroTitle2}
                    onChange={(e) => setFormData({ ...formData, heroTitle2: e.target.value })}
                    placeholder="Elegance"
                    className="ec-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.heroSubtitle || 'Hero Subtitle'}</label>
                <textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="Experience the pinnacle of luxury transportation..."
                  rows={3}
                  className="ec-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.heroButton1 || 'Primary Button Text'}</label>
                  <input
                    type="text"
                    value={formData.heroButtonText1}
                    onChange={(e) => setFormData({ ...formData, heroButtonText1: e.target.value })}
                    placeholder="Explore Our Fleet"
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.heroButton2 || 'Secondary Button Text'}</label>
                  <input
                    type="text"
                    value={formData.heroButtonText2}
                    onChange={(e) => setFormData({ ...formData, heroButtonText2: e.target.value })}
                    placeholder="Our Services"
                    className="ec-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.featuresTitle || 'Features Section Title'}</label>
                <input
                  type="text"
                  value={formData.featuresTitle}
                  onChange={(e) => setFormData({ ...formData, featuresTitle: e.target.value })}
                  placeholder="THE ELITE STANDARD"
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.fleetSectionTitle || 'Fleet Section Title'}</label>
                <input
                  type="text"
                  value={formData.fleetTitle}
                  onChange={(e) => setFormData({ ...formData, fleetTitle: e.target.value })}
                  placeholder="OUR FLEET"
                  className="ec-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.ctaTitle || 'CTA Section Title'}</label>
                  <input
                    type="text"
                    value={formData.ctaTitle}
                    onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                    placeholder="Experience Luxury"
                    className="ec-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.ctaSubtitle || 'CTA Subtitle'}</label>
                  <input
                    type="text"
                    value={formData.ctaSubtitle}
                    onChange={(e) => setFormData({ ...formData, ctaSubtitle: e.target.value })}
                    placeholder="Ready to elevate your journey?"
                    className="ec-input w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Branding / Logos */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin?.branding || 'Branding'}</h2>
            
            <div className="space-y-6">
              {/* Website Logo */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.websiteLogo || 'Website Logo'}</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.websiteLogoUrl}
                      onChange={(e) => setFormData({ ...formData, websiteLogoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="ec-input w-full mb-2"
                    />
                    <input
                      ref={websiteLogoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'website')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => websiteLogoRef.current?.click()}
                      className="ec-btn-outline text-sm inline-flex items-center gap-2"
                      disabled={uploadingLogo === 'website'}
                    >
                      {uploadingLogo === 'website' ? (
                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      {t.admin?.uploadImage || 'Upload Image'}
                    </button>
                  </div>
                  {formData.websiteLogoUrl && (
                    <div className="relative">
                      <img 
                        src={formData.websiteLogoUrl} 
                        alt="Website Logo" 
                        className="w-20 h-20 object-contain bg-secondary rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, websiteLogoUrl: '' })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Logo */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.invoiceLogo || 'Invoice Logo'}</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.invoiceLogoUrl}
                      onChange={(e) => setFormData({ ...formData, invoiceLogoUrl: e.target.value })}
                      placeholder="https://example.com/invoice-logo.png"
                      className="ec-input w-full mb-2"
                    />
                    <input
                      ref={invoiceLogoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'invoice')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => invoiceLogoRef.current?.click()}
                      className="ec-btn-outline text-sm inline-flex items-center gap-2"
                      disabled={uploadingLogo === 'invoice'}
                    >
                      {uploadingLogo === 'invoice' ? (
                        <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      {t.admin?.uploadImage || 'Upload Image'}
                    </button>
                  </div>
                  {formData.invoiceLogoUrl && (
                    <div className="relative">
                      <img 
                        src={formData.invoiceLogoUrl} 
                        alt="Invoice Logo" 
                        className="w-20 h-20 object-contain bg-secondary rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, invoiceLogoUrl: '' })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t.admin?.invoiceLogoDesc || 'This logo will appear on generated PDF invoices'}</p>
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin?.contactInfo || 'Contact Information'}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.phone || 'Phone'}</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.email || 'Email'}</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.address || 'Address'}</label>
                <input
                  type="text"
                  value={formData.contactAddress}
                  onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.hours || 'Hours'}</label>
                <input
                  type="text"
                  value={formData.contactHours}
                  onChange={(e) => setFormData({ ...formData, contactHours: e.target.value })}
                  className="ec-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin?.currency || 'Currency'}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.currencySymbol || 'Currency Symbol'}</label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="ec-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.symbolPosition || 'Symbol Position'}</label>
                <select
                  value={formData.currencyPos}
                  onChange={(e) => setFormData({ ...formData, currencyPos: e.target.value as 'before' | 'after' })}
                  className="ec-input w-full"
                >
                  <option value="before">{t.admin?.beforeAmount || 'Before amount'} ($100)</option>
                  <option value="after">{t.admin?.afterAmount || 'After amount'} (100$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.currencyCode || 'ISO Currency Code'}</label>
                <input
                  type="text"
                  value={formData.currencyCode}
                  onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                  className="ec-input w-full"
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          {/* Google Maps API */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin?.integrations || 'Integrations'}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">{t.admin?.googleMapsApiKey || 'Google Maps API Key'}</label>
                <input
                  type="text"
                  value={formData.googleMapsApiKey}
                  onChange={(e) => setFormData({ ...formData, googleMapsApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="ec-input w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t.admin?.googleMapsApiKeyDesc || 'Required for distance calculation. Get your API key from Google Cloud Console.'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Password (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl text-foreground mb-6">{t.admin?.adminPassword || 'Admin Password'}</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.newMasterPassword || 'New Master Password'}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="ec-input w-full pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{t.admin?.confirmPassword || 'Confirm Password'}</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="ec-input w-full"
                  />
                </div>

                {passwordError && (
                  <p className="text-red-400 text-sm">{passwordError}</p>
                )}

                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  className="ec-btn-outline"
                >
                  {t.admin?.updatePassword || 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
            <Check size={18} />
            {t.admin?.saveSettings || 'Save Settings'}
          </button>
          {saved && (
            <span className="text-green-500 text-sm">{t.admin?.settingsSaved || 'Settings saved successfully!'}</span>
          )}
        </div>
      </form>
    </div>
  );
}
