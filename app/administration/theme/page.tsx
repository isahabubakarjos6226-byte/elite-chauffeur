'use client';

import { useState, useRef } from 'react';
import { Check, RefreshCw, Upload, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/lib/language-context';

const fonts = [
  'Inter',
  'Poppins',
  'Montserrat',
  'DM Sans',
  'Raleway',
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
];

export default function AdminThemePage() {
  const { settings, updateSettings } = useStore();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    themeAccentColor: settings.themeAccentColor,
    themeBgColor: settings.themeBgColor,
    themeFontBody: settings.themeFontBody,
    themeFontHeading: settings.themeFontHeading,
    websiteLogoUrl: settings.websiteLogoUrl,
  });
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaults = {
      themeAccentColor: '#c9a962',
      themeBgColor: '#0d0d0d',
      themeFontBody: 'Inter',
      themeFontHeading: 'Cormorant Garamond',
      websiteLogoUrl: '',
    };
    setFormData(defaults);
    updateSettings(defaults);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, websiteLogoUrl: base64 });
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t.admin.themeSettings || 'Theme Settings'}</h1>
          <p className="text-muted-foreground">{t.admin.themeDesc || 'Customize the look and feel of your website.'}</p>
        </div>
        <button
          onClick={handleReset}
          className="ec-btn-outline inline-flex items-center gap-2"
        >
          <RefreshCw size={18} />
          {t.admin.resetDefaults || 'Reset to Defaults'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colors */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin.colors || 'Colors'}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  {t.admin.accentColor || 'Accent / Primary Color'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.themeAccentColor}
                    onChange={(e) => setFormData({ ...formData, themeAccentColor: e.target.value })}
                    className="w-16 h-12 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.themeAccentColor}
                    onChange={(e) => setFormData({ ...formData, themeAccentColor: e.target.value })}
                    className="ec-input flex-1 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  {t.admin.backgroundColor || 'Background Color'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.themeBgColor}
                    onChange={(e) => setFormData({ ...formData, themeBgColor: e.target.value })}
                    className="w-16 h-12 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.themeBgColor}
                    onChange={(e) => setFormData({ ...formData, themeBgColor: e.target.value })}
                    className="ec-input flex-1 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin.typography || 'Typography'}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  {t.admin.bodyFont || 'Body Font'}
                </label>
                <select
                  value={formData.themeFontBody}
                  onChange={(e) => setFormData({ ...formData, themeFontBody: e.target.value })}
                  className="ec-input w-full"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: formData.themeFontBody }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-3">
                  {t.admin.headingFont || 'Heading Font'}
                </label>
                <select
                  value={formData.themeFontHeading}
                  onChange={(e) => setFormData({ ...formData, themeFontHeading: e.target.value })}
                  className="ec-input w-full"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                <p className="mt-2 text-lg text-foreground" style={{ fontFamily: formData.themeFontHeading }}>
                  {settings.siteName}
                </p>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin.branding || 'Branding'}</h2>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-3">
                {t.admin.websiteLogo || 'Website Logo'}
              </label>
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
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {t.admin.uploadImage || 'Upload Image'}
                  </button>
                </div>
                {formData.websiteLogoUrl && (
                  <div className="relative">
                    <img
                      src={formData.websiteLogoUrl}
                      alt="Logo preview"
                      className="h-16 w-auto bg-secondary rounded-lg p-2"
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
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <h2 className="font-serif text-xl text-foreground mb-6">{t.admin.preview || 'Preview'}</h2>
            
            <div 
              className="rounded-lg p-8"
              style={{ backgroundColor: formData.themeBgColor }}
            >
              <h3 
                className="text-2xl mb-4"
                style={{ 
                  fontFamily: formData.themeFontHeading,
                  color: formData.themeAccentColor,
                }}
              >
                {settings.siteName}
              </h3>
              <p 
                className="mb-4"
                style={{ 
                  fontFamily: formData.themeFontBody,
                  color: '#ebebeb',
                }}
              >
                {t.admin.previewText || 'Experience uncompromising elegance with our premium luxury transportation services.'}
              </p>
              <button 
                className="px-6 py-3 rounded-lg font-medium"
                style={{ 
                  backgroundColor: formData.themeAccentColor,
                  color: formData.themeBgColor,
                }}
              >
                {t.nav.bookNow}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" className="bg-foreground text-background font-medium px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
            <Check size={18} />
            {t.admin.saveTheme || 'Save Theme Settings'}
          </button>
          {saved && (
            <span className="text-green-500 text-sm">{t.admin.settingsSaved || 'Settings saved successfully!'}</span>
          )}
        </div>
      </form>
    </div>
  );
}
