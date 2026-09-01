import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  FolderTree,
  Layers,
} from 'lucide-react';
import { superAdminApi } from '../../api/superAdmin.api';
import { ServiceCategory, CategoryRegionType } from '../../types';
import { useToast } from '../../context/ToastContext';

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [region, setRegion] = useState<CategoryRegionType>('INDIA');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('Layers');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getCategories(true);
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setRegion('INDIA');
    setDescription('');
    setIcon('Layers');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setRegion(cat.region || 'INDIA');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Layers');
    setDisplayOrder(cat.display_order || 1);
    setIsActive(Boolean(cat.is_active));
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showError('Please provide both Category Name and URL Slug');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await superAdminApi.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim(),
          region,
          description: description || undefined,
          icon,
          displayOrder,
          isActive,
        });
        showSuccess('Category updated successfully');
      } else {
        await superAdminApi.createCategory({
          name: name.trim(),
          slug: slug.trim(),
          region,
          description: description || undefined,
          icon,
          displayOrder,
          isActive,
        });
        showSuccess('New category created successfully');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: ServiceCategory) => {
    try {
      await superAdminApi.toggleCategoryStatus(cat.id, !cat.is_active);
      showSuccess(`Category ${cat.name} is now ${!cat.is_active ? 'Active' : 'Inactive'}`);
      loadCategories();
    } catch (err: any) {
      showError(err.message || 'Failed to toggle category status');
    }
  };

  const handleDelete = async (cat: ServiceCategory) => {
    if (cat.service_count && cat.service_count > 0) {
      showError(
        `Cannot delete "${cat.name}" because it has ${cat.service_count} active service(s) assigned. Please reassign those services first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to deactivate category "${cat.name}"?`)) {
      return;
    }
    try {
      await superAdminApi.deleteCategory(cat.id);
      showSuccess(`Category "${cat.name}" deactivated`);
      loadCategories();
    } catch (err: any) {
      showError(err.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchRegion = selectedRegion === 'ALL' || (c.region || 'INDIA') === selectedRegion || c.region === 'GLOBAL';
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    return matchRegion && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FolderTree className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Service Categories
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Top-level taxonomy and regional domain grouping for India and UAE service lines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Region & Search Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'All Regions' },
            { key: 'INDIA', label: '🇮🇳 India' },
            { key: 'UAE', label: '🇦🇪 UAE' },
          ].map((reg) => (
            <button
              key={reg.key}
              onClick={() => setSelectedRegion(reg.key)}
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={loadCategories}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Active Services</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span>{cat.name}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          cat.region === 'UAE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : cat.region === 'GLOBAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                        }`}
                      >
                        {cat.region === 'UAE' ? '🇦🇪 UAE' : cat.region === 'GLOBAL' ? '🌐 Global' : '🇮🇳 India'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {cat.slug}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {cat.service_count !== undefined ? cat.service_count : 0} services
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">{cat.display_order}</td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {cat.is_active ? (
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Deactivate Category"
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

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={handleNameChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="e.g. UAE Corporate Tax"
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
                      placeholder="e.g. uae-corporate-tax"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Region Jurisdiction *
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as CategoryRegionType)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="INDIA">🇮🇳 India</option>
                      <option value="UAE">🇦🇪 UAE</option>
                      <option value="GLOBAL">🌐 Global / Both</option>
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
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Short description of this service category..."
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Active Category</span>
                  </label>
                </div>
              </div>

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
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
