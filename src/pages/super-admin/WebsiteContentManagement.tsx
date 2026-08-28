import React, { useEffect, useState } from 'react';
import {
  Globe,
  Save,
  RefreshCw,
  Sparkles,
  Building2,
  Phone,
  Search,
  FileText,
} from 'lucide-react';
import { superAdminApi } from '../../api/superAdmin.api';
import { useToast } from '../../context/ToastContext';

type SectionKey = 'hero' | 'about' | 'contact' | 'seo' | 'footer';

export const WebsiteContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SectionKey>('hero');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [contents, setContents] = useState<Record<string, Record<string, string>>>({
    hero: {},
    about: {},
    contact: {},
    seo: {},
    footer: {},
  });

  const { showSuccess, showError } = useToast();

  const loadCmsContent = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getAllCmsContent();
      if (res.success && res.data?.items) {
        const map: Record<string, Record<string, string>> = {
          hero: {},
          about: {},
          contact: {},
          seo: {},
          footer: {},
        };
        for (const item of res.data.items) {
          if (!map[item.section_key]) map[item.section_key] = {};
          map[item.section_key][item.content_key] = item.content_value || '';
        }
        setContents(map);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load CMS content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsContent();
  }, []);

  const handleFieldChange = (section: SectionKey, key: string, value: string) => {
    setContents((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveSection = async (section: SectionKey) => {
    const sectionData = contents[section] || {};
    const items = Object.entries(sectionData).map(([contentKey, contentValue]) => ({
      sectionKey: section,
      contentKey,
      contentValue,
      contentType: 'TEXT',
      isPublished: true,
    }));

    if (items.length === 0) return;

    try {
      setSaving(true);
      await superAdminApi.updateCmsContent(items);
      showSuccess(`Website ${section.toUpperCase()} content updated successfully`);
      loadCmsContent();
    } catch (err: any) {
      showError(err.message || 'Failed to save website content');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: SectionKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'hero', label: 'Hero Banner', icon: Sparkles },
    { key: 'about', label: 'About Firm', icon: Building2 },
    { key: 'contact', label: 'Contact & Office', icon: Phone },
    { key: 'seo', label: 'SEO Metadata', icon: Search },
    { key: 'footer', label: 'Footer & Legal', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Website Content Management (CMS)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic content governance for public website headers, company narrative, contact parameters, and search engine metadata.
          </p>
        </div>

        <button
          onClick={loadCmsContent}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white border-t border-x border-slate-200 text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section Content Area */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm max-w-4xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading website content...</div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSection(activeTab);
            }}
            className="space-y-6"
          >
            {/* HERO SECTION */}
            {activeTab === 'hero' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Announcement Badge Text
                  </label>
                  <input
                    type="text"
                    value={contents.hero['badge'] || ''}
                    onChange={(e) => handleFieldChange('hero', 'badge', e.target.value)}
                    placeholder="e.g. ICAI Certified & ISO 9001:2015 Compliant Practice"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Main Hero Headline (H1) *
                  </label>
                  <input
                    type="text"
                    required
                    value={contents.hero['title'] || ''}
                    onChange={(e) => handleFieldChange('hero', 'title', e.target.value)}
                    placeholder="e.g. Strategic Financial Clarity. Zero Compliance Compromise."
                    className="w-full px-3.5 py-2.5 font-bold text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Hero Subtitle Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={contents.hero['subtitle'] || ''}
                    onChange={(e) => handleFieldChange('hero', 'subtitle', e.target.value)}
                    placeholder="Comprehensive description of firm value proposition..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Primary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={contents.hero['cta_primary_text'] || ''}
                      onChange={(e) => handleFieldChange('hero', 'cta_primary_text', e.target.value)}
                      placeholder="e.g. Book Free Consultation"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Secondary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={contents.hero['cta_secondary_text'] || ''}
                      onChange={(e) => handleFieldChange('hero', 'cta_secondary_text', e.target.value)}
                      placeholder="e.g. Explore All Services"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT SECTION */}
            {activeTab === 'about' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    About Section Headline
                  </label>
                  <input
                    type="text"
                    value={contents.about['headline'] || ''}
                    onChange={(e) => handleFieldChange('about', 'headline', e.target.value)}
                    placeholder="e.g. A Decade of Financial Stewardship & Integrity"
                    className="w-full px-3.5 py-2.5 font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Firm Story & Philosophy
                  </label>
                  <textarea
                    rows={4}
                    value={contents.about['story'] || ''}
                    onChange={(e) => handleFieldChange('about', 'story', e.target.value)}
                    placeholder="Firm origin, leadership vision, and strategic approach..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={contents.about['experience_years'] || ''}
                      onChange={(e) => handleFieldChange('about', 'experience_years', e.target.value)}
                      placeholder="e.g. 10+"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Clients Served Count
                    </label>
                    <input
                      type="text"
                      value={contents.about['clients_count'] || ''}
                      onChange={(e) => handleFieldChange('about', 'clients_count', e.target.value)}
                      placeholder="e.g. 2,500+"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Tax Savings Delivered
                    </label>
                    <input
                      type="text"
                      value={contents.about['tax_saved_inr'] || ''}
                      onChange={(e) => handleFieldChange('about', 'tax_saved_inr', e.target.value)}
                      placeholder="e.g. ₹ 150 Cr+"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT SECTION */}
            {activeTab === 'contact' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={contents.contact['official_email'] || ''}
                      onChange={(e) => handleFieldChange('contact', 'official_email', e.target.value)}
                      placeholder="info@anstaxconsultancy.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Helpline Phone Number
                    </label>
                    <input
                      type="text"
                      value={contents.contact['helpline_phone'] || ''}
                      onChange={(e) => handleFieldChange('contact', 'helpline_phone', e.target.value)}
                      placeholder="+91-7041512939"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Headquarters / Office Address
                  </label>
                  <input
                    type="text"
                    value={contents.contact['office_address'] || ''}
                    onChange={(e) => handleFieldChange('contact', 'office_address', e.target.value)}
                    placeholder="8/131, Khichri Pur, East Delhi, Delhi – 110091, India"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Operating / Working Hours
                  </label>
                  <input
                    type="text"
                    value={contents.contact['working_hours'] || ''}
                    onChange={(e) => handleFieldChange('contact', 'working_hours', e.target.value)}
                    placeholder="Monday – Saturday: 9:30 AM – 6:30 PM (IST)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* SEO SECTION */}
            {activeTab === 'seo' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default Meta Title
                  </label>
                  <input
                    type="text"
                    value={contents.seo['meta_title'] || ''}
                    onChange={(e) => handleFieldChange('seo', 'meta_title', e.target.value)}
                    placeholder="ANS Tax Consultancy | Tax & Accounting Services in India & Dubai"
                    className="w-full px-3.5 py-2.5 font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Default Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={contents.seo['meta_description'] || ''}
                    onChange={(e) => handleFieldChange('seo', 'meta_description', e.target.value)}
                    placeholder="ANS Tax Consultancy provides professional tax, GST, accounting, audit and virtual CFO services across India and Dubai."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={contents.seo['keywords'] || ''}
                    onChange={(e) => handleFieldChange('seo', 'keywords', e.target.value)}
                    placeholder="ANS Tax Consultancy, Tax Filing, GST Registration, Audit, Accounting, Virtual CFO, Income Tax India"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* FOOTER SECTION */}
            {activeTab === 'footer' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Footer Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={contents.footer['tagline'] || ''}
                    onChange={(e) => handleFieldChange('footer', 'tagline', e.target.value)}
                    placeholder="Empowering Indian & Global Enterprises with Precision Accounting, Tax Strategy, and Compliance Integrity."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={contents.footer['copyright'] || ''}
                    onChange={(e) => handleFieldChange('footer', 'copyright', e.target.value)}
                    placeholder="© 2026 ANS Tax Consultancy. All rights reserved."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/20 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing Changes...' : `Publish ${tabs.find((t) => t.key === activeTab)?.label} Content`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
