import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Star,
  Layers,
  Globe,
  FileText,
  ArrowRight,
  ListOrdered,
  FileCheck,
  DollarSign,
} from 'lucide-react';
import { superAdminApi } from '../../api/superAdmin.api';
import { AdminService, ServiceCategory, RegionType } from '../../types';
import { useToast } from '../../context/ToastContext';

type ModalTab = 'basic' | 'pricing' | 'content' | 'seo' | 'related';

export const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>('basic');
  const [editingService, setEditingService] = useState<AdminService | null>(null);

  // Form fields - Basic
  const [categoryId, setCategoryId] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [region, setRegion] = useState<RegionType>('INDIA');
  const [icon, setIcon] = useState<string>('Sparkles');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // Form fields - Pricing
  const [basePrice, setBasePrice] = useState<string>('999');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('INR');
  const [billingPeriod, setBillingPeriod] = useState<string>('one-time');
  const [pricingMode, setPricingMode] = useState<string>('FIXED');
  const [pricingNotes, setPricingNotes] = useState<string>('');
  const [exclusionsText, setExclusionsText] = useState<string>('');

  // Form fields - Content
  const [overview, setOverview] = useState<string>('');
  const [eligibility, setEligibility] = useState<string>('');
  const [turnaround, setTurnaround] = useState<string>('3-5 working days');
  const [requiredDocsText, setRequiredDocsText] = useState<string>('');
  const [deliverablesText, setDeliverablesText] = useState<string>('');
  const [processSteps, setProcessSteps] = useState<Array<{ step: number; title: string; description: string }>>([
    { step: 1, title: 'Document Collection', description: 'Client submits initial details and records' },
    { step: 2, title: 'Expert Preparation', description: 'Chartered professionals audit and prepare filings' },
    { step: 3, title: 'Submission & Ack', description: 'Official departmental submission and delivery' },
  ]);

  // Form fields - SEO
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [h1Heading, setH1Heading] = useState<string>('');

  // Form fields - Related & CTA
  const [relatedIds, setRelatedIds] = useState<number[]>([]);
  const [primaryCtaText, setPrimaryCtaText] = useState<string>('Book Consultation');
  const [primaryCtaLink, setPrimaryCtaLink] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [svcRes, catRes] = await Promise.all([
        superAdminApi.getServices({ all: true }),
        superAdminApi.getCategories(true),
      ]);
      if (svcRes.success && svcRes.data) setServices(svcRes.data);
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !categoryId) {
          setCategoryId(catRes.data[0].id);
        }
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load services catalogue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setActiveModalTab('basic');
    setCategoryId(categories[0]?.id || 1);
    setName('');
    setSlug('');
    setRegion('INDIA');
    setIcon('Sparkles');
    setShortDescription('');
    setDescription('');
    setDisplayOrder(services.length + 1);
    setIsActive(true);
    setIsFeatured(false);

    setBasePrice('999');
    setDiscountPrice('');
    setCurrency('INR');
    setBillingPeriod('one-time');
    setPricingMode('FIXED');
    setPricingNotes('');
    setExclusionsText('');

    setOverview('');
    setEligibility('');
    setTurnaround('3-5 working days');
    setRequiredDocsText('PAN Card\nAadhaar Card\nBank Statement');
    setDeliverablesText('Departmental Acknowledgment Receipt\nDetailed Computation Sheet');
    setProcessSteps([
      { step: 1, title: 'Document Collection', description: 'Client submits initial details and records' },
      { step: 2, title: 'Expert Preparation', description: 'Chartered professionals audit and prepare filings' },
      { step: 3, title: 'Submission & Ack', description: 'Official departmental submission and delivery' },
    ]);

    setSeoTitle('');
    setMetaDescription('');
    setH1Heading('');

    setRelatedIds([]);
    setPrimaryCtaText('Book Consultation');
    setPrimaryCtaLink('');

    setIsModalOpen(true);
  };

  const openEditModal = (service: AdminService) => {
    setEditingService(service);
    setActiveModalTab('basic');
    setCategoryId(service.category_id);
    setName(service.name);
    setSlug(service.slug);
    setRegion((service.region as RegionType) || 'INDIA');
    setIcon(service.icon || 'Sparkles');
    setShortDescription(service.short_description || '');
    setDescription(service.description || '');
    setDisplayOrder(service.display_order || 1);
    setIsActive(Boolean(service.is_active));
    setIsFeatured(Boolean(service.is_featured));

    setBasePrice(service.base_price ? String(service.base_price) : '');
    setDiscountPrice(service.promo_price ? String(service.promo_price) : service.discount_price ? String(service.discount_price) : '');
    setCurrency(service.currency || (service.region === 'UAE' ? 'AED' : 'INR'));
    setBillingPeriod(service.billing_period || 'one-time');
    setPricingMode(service.pricing_mode || 'FIXED');
    setPricingNotes(service.pricing_notes || '');

    const exclusionsArr = Array.isArray(service.exclusions) ? service.exclusions : [];
    setExclusionsText(exclusionsArr.join('\n'));

    setOverview(service.overview || '');
    setEligibility(service.eligibility || '');
    setTurnaround(service.turnaround || service.processing_time || '3-5 working days');

    const reqDocsArr = Array.isArray(service.required_documents) ? service.required_documents : [];
    setRequiredDocsText(reqDocsArr.join('\n'));

    const delivArr = Array.isArray(service.deliverables) ? service.deliverables : [];
    setDeliverablesText(delivArr.join('\n'));

    if (Array.isArray(service.process_steps) && service.process_steps.length > 0) {
      setProcessSteps(service.process_steps);
    } else {
      setProcessSteps([
        { step: 1, title: 'Document Collection', description: 'Client submits initial details and records' },
        { step: 2, title: 'Expert Preparation', description: 'Chartered professionals audit and prepare filings' },
        { step: 3, title: 'Submission & Ack', description: 'Official departmental submission and delivery' },
      ]);
    }

    setSeoTitle(service.seo_title || '');
    setMetaDescription(service.meta_description || '');
    setH1Heading(service.h1_heading || '');

    setRelatedIds(Array.isArray(service.related_service_ids) ? service.related_service_ids : []);
    setPrimaryCtaText(service.primary_cta_text || 'Book Consultation');
    setPrimaryCtaLink(service.primary_cta_link || '');

    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingService) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleRegionChange = (newReg: RegionType) => {
    setRegion(newReg);
    setCurrency(newReg === 'UAE' ? 'AED' : 'INR');
  };

  const addProcessStep = () => {
    setProcessSteps((prev) => [
      ...prev,
      { step: prev.length + 1, title: '', description: '' },
    ]);
  };

  const removeProcessStep = (index: number) => {
    setProcessSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, idx) => ({ ...s, step: idx + 1 }))
    );
  };

  const updateProcessStep = (index: number, field: 'title' | 'description', val: string) => {
    setProcessSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  const toggleRelatedService = (id: number) => {
    setRelatedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showError('Please provide both Service Name and URL Slug');
      return;
    }

    const numBasePrice = parseFloat(basePrice);
    if (isNaN(numBasePrice) || numBasePrice < 0) {
      showError('Please enter a valid base price (>= 0)');
      return;
    }

    const numDiscount = discountPrice ? parseFloat(discountPrice) : undefined;
    const reqDocsList = requiredDocsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const deliverablesList = deliverablesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const exclusionsList = exclusionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const validSteps = processSteps.filter((s) => s.title.trim().length > 0);

    const payload = {
      categoryId,
      name: name.trim(),
      slug: slug.trim(),
      region,
      icon,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      overview: overview || undefined,
      eligibility: eligibility || undefined,
      turnaround: turnaround || undefined,
      processingTime: turnaround || undefined,
      basePrice: numBasePrice,
      discountPrice: numDiscount,
      promoPrice: numDiscount,
      currency,
      billingPeriod,
      pricingMode,
      pricingNotes: pricingNotes || undefined,
      exclusions: exclusionsList.length > 0 ? exclusionsList : undefined,
      requiredDocuments: reqDocsList.length > 0 ? reqDocsList : undefined,
      deliverables: deliverablesList.length > 0 ? deliverablesList : undefined,
      processSteps: validSteps.length > 0 ? validSteps : undefined,
      seoTitle: seoTitle || undefined,
      metaDescription: metaDescription || undefined,
      h1Heading: h1Heading || undefined,
      relatedServiceIds: relatedIds.filter((id) => (editingService ? id !== editingService.id : true)),
      primaryCtaText: primaryCtaText || undefined,
      primaryCtaLink: primaryCtaLink || undefined,
      displayOrder,
      isActive,
      isFeatured,
    };

    try {
      setIsSubmitting(true);
      if (editingService) {
        await superAdminApi.updateService(editingService.id, payload);
        showSuccess('Service updated successfully');
      } else {
        await superAdminApi.createService(payload);
        showSuccess('Service created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: AdminService) => {
    try {
      await superAdminApi.toggleServiceStatus(service.id, !service.is_active);
      showSuccess(`Service "${service.name}" is now ${!service.is_active ? 'Active' : 'Inactive'}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to toggle service status');
    }
  };

  const handleDelete = async (service: AdminService) => {
    if (!window.confirm(`Are you sure you want to deactivate "${service.name}"? Historical applications remain intact.`)) {
      return;
    }
    try {
      await superAdminApi.deleteService(service.id);
      showSuccess(`Service "${service.name}" deactivated`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete service');
    }
  };

  // Filter categories by selected region
  const availableCategories = categories.filter((c) => {
    if (selectedRegion === 'ALL') return true;
    return !c.region || c.region === 'GLOBAL' || c.region === selectedRegion;
  });

  const filteredServices = services.filter((s) => {
    const matchRegion = selectedRegion === 'ALL' || (s.region || 'INDIA') === selectedRegion;
    const matchCat = selectedCategory === 'ALL' || String(s.category_id) === selectedCategory;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.category_name && s.category_name.toLowerCase().includes(search.toLowerCase()));
    return matchRegion && matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Services Catalogue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative service listings, India & UAE regional separation, structured deliverables, process steps, and SEO metadata.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Region & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col gap-3">
        {/* Region Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Region:</span>
          </span>
          {[
            { key: 'ALL', label: 'All Regions' },
            { key: 'INDIA', label: '🇮🇳 India Practice (INR)' },
            { key: 'UAE', label: '🇦🇪 UAE Practice (AED)' },
          ].map((reg) => (
            <button
              key={reg.key}
              onClick={() => {
                setSelectedRegion(reg.key);
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedRegion === reg.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Search and Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services by title, slug, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.region && c.region !== 'GLOBAL' ? `(${c.region})` : ''}
                </option>
              ))}
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh Catalogue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading services catalogue...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No services found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Turnaround</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                            {service.som_number && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                                SOM #{service.som_number}
                              </span>
                            )}
                            <span>{service.name}</span>
                            {service.is_featured && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            /{service.region?.toLowerCase() || 'india'}/{service.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          (service.region || 'INDIA') === 'UAE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                        }`}
                      >
                        {(service.region || 'INDIA') === 'UAE' ? '🇦🇪 UAE' : '🇮🇳 India'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{service.category_name || 'Uncategorized'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {service.pricing_mode === 'CUSTOM_QUOTE' || service.base_price === null ? (
                        <div className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] inline-block">
                          Price on call
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-900">
                            {service.currency || 'INR'} {Number(service.base_price || 0).toLocaleString()}
                          </div>
                          {(service.promo_price || service.discount_price) && (
                            <div className="text-[11px] text-emerald-600 font-medium">
                              Promo: {service.currency || 'INR'} {Number(service.promo_price || service.discount_price).toLocaleString()}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {service.turnaround || service.processing_time || '3-5 days'}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(service)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          service.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {service.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Edit Service Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Deactivate Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extended Service Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-slate-200 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingService ? `Edit Service: ${editingService.name}` : 'Create New SOM Service'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage basic details, pricing governance, structured content, SEO tags, and related service mappings.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
              {[
                { key: 'basic', label: 'Basic Info', icon: Sparkles },
                { key: 'pricing', label: 'Pricing & Terms', icon: DollarSign },
                { key: 'content', label: 'Service Content', icon: FileCheck },
                { key: 'seo', label: 'SEO & Metadata', icon: FileText },
                { key: 'related', label: 'Related & CTA', icon: ArrowRight },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveModalTab(tab.key as ModalTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors whitespace-nowrap ${
                    activeModalTab === tab.key
                      ? 'bg-white border-t border-x border-slate-200 text-purple-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {/* TAB 1: BASIC INFO */}
                {activeModalTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={handleNameChange}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="e.g. GST Registration"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          URL Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="e.g. gst-registration"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Region *
                        </label>
                        <select
                          value={region}
                          onChange={(e) => handleRegionChange(e.target.value as RegionType)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="INDIA">🇮🇳 India (INR)</option>
                          <option value="UAE">🇦🇪 UAE (AED)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Service Category *
                        </label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          {categories
                            .filter((c) => !c.region || c.region === 'GLOBAL' || c.region === region)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={displayOrder}
                          onChange={(e) => setDisplayOrder(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Short Description (Card Excerpt)
                      </label>
                      <textarea
                        rows={2}
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Brief 1-2 sentence description for search cards and listings..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Description
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Comprehensive service description..."
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Active (Visible in Public Directory)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Featured Flagship Service</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: PRICING */}
                {activeModalTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Base Price *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={basePrice}
                          onChange={(e) => setBasePrice(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Promotional / Discount Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={discountPrice}
                          onChange={(e) => setDiscountPrice(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="Leave empty if no discount"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="AED">AED (د.إ)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Billing Period
                        </label>
                        <select
                          value={billingPeriod}
                          onChange={(e) => setBillingPeriod(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="one-time">One-Time Engagement</option>
                          <option value="monthly">Monthly Retainer</option>
                          <option value="quarterly">Quarterly Retainer</option>
                          <option value="annually">Annual Compliance</option>
                          <option value="per-engagement">Per Engagement / Notice</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Pricing Mode
                        </label>
                        <select
                          value={pricingMode}
                          onChange={(e) => setPricingMode(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="FIXED">Fixed Price</option>
                          <option value="STARTING_FROM">Starting From (Variable)</option>
                          <option value="CUSTOM_QUOTE">Custom Quote</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pricing Notes & Statutory Inclusions
                      </label>
                      <textarea
                        rows={2}
                        value={pricingNotes}
                        onChange={(e) => setPricingNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="e.g. Government challan fees and stamp duties are payable at actuals."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Exclusions (One item per line)
                      </label>
                      <textarea
                        rows={3}
                        value={exclusionsText}
                        onChange={(e) => setExclusionsText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Physical site inspection charges&#10;Departmental penalty payments"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: CONTENT */}
                {activeModalTab === 'content' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Turnaround / Processing Time
                      </label>
                      <input
                        type="text"
                        value={turnaround}
                        onChange={(e) => setTurnaround(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="e.g. 3-5 working days"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Service Overview & Narrative
                      </label>
                      <textarea
                        rows={3}
                        value={overview}
                        onChange={(e) => setOverview(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Detailed background, statutory requirements, and scope of assistance..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Eligibility Criteria
                      </label>
                      <textarea
                        rows={2}
                        value={eligibility}
                        onChange={(e) => setEligibility(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Who is eligible to apply for this service..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Required Documents (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={requiredDocsText}
                          onChange={(e) => setRequiredDocsText(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="PAN Card&#10;Aadhaar Card&#10;Bank Statement"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Deliverables (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={deliverablesText}
                          onChange={(e) => setDeliverablesText(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="Official Certificate&#10;Tax Computation Sheet"
                        />
                      </div>
                    </div>

                    {/* Process Steps Builder */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-purple-600" />
                          <span>Process Steps</span>
                        </label>
                        <button
                          type="button"
                          onClick={addProcessStep}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 text-[11px] font-semibold"
                        >
                          + Add Step
                        </button>
                      </div>

                      <div className="space-y-2">
                        {processSteps.map((step, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                              {idx + 1}
                            </span>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Step Title"
                                value={step.title}
                                onChange={(e) => updateProcessStep(idx, 'title', e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Step Description"
                                value={step.description}
                                onChange={(e) => updateProcessStep(idx, 'description', e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProcessStep(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors mt-1"
                              title="Delete Step"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: SEO */}
                {activeModalTab === 'seo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="e.g. Online GST Registration in India | ANS Tax Consultancy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        H1 Main Heading
                      </label>
                      <input
                        type="text"
                        value={h1Heading}
                        onChange={(e) => setH1Heading(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="e.g. Fast & Compliant GST Registration Services"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Google search snippet description (recommended ~150-160 characters)..."
                      />
                    </div>
                  </div>
                )}

                {/* TAB 5: RELATED & CTA */}
                {activeModalTab === 'related' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Primary CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={primaryCtaText}
                          onChange={(e) => setPrimaryCtaText(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="e.g. Book Consultation"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Primary CTA Target Link
                        </label>
                        <input
                          type="text"
                          value={primaryCtaLink}
                          onChange={(e) => setPrimaryCtaLink(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="e.g. /portal/register or #consultation"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Select Related Services (Cross-Selling & Recommendations)
                      </label>
                      <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
                        {services
                          .filter((s) => (editingService ? s.id !== editingService.id : true))
                          .map((s) => (
                            <label
                              key={s.id}
                              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-xs text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={relatedIds.includes(s.id)}
                                onChange={() => toggleRelatedService(s.id)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-medium text-slate-900">{s.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({s.region || 'INDIA'})
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingService ? 'Update Service' : 'Create Service'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
