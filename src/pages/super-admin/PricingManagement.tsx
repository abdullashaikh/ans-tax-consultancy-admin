import React, { useEffect, useState } from 'react';
import {
  Tags,
  Search,
  RefreshCw,
  History,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  X,
  Layers,
} from 'lucide-react';
import { superAdminApi } from '../../api/superAdmin.api';
import { AdminService, PriceHistoryEntry } from '../../types';
import { useToast } from '../../context/ToastContext';

export const PricingManagement: React.FC = () => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Price Edit Modal
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [basePrice, setBasePrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Price History Drawer
  const [historyService, setHistoryService] = useState<AdminService | null>(null);
  const [historyLogs, setHistoryLogs] = useState<PriceHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getServices(undefined, true);
      if (res.success && res.data) {
        setServices(res.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load services pricing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openUpdateModal = (service: AdminService) => {
    setSelectedService(service);
    setBasePrice(service.base_price ? String(service.base_price) : '0');
    setDiscountPrice(service.discount_price ? String(service.discount_price) : '');
    setReason('');
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const numBase = parseFloat(basePrice);
    if (isNaN(numBase) || numBase < 0) {
      showError('Please enter a valid non-negative base price');
      return;
    }

    const numDiscount = discountPrice ? parseFloat(discountPrice) : undefined;
    if (numDiscount !== undefined && (isNaN(numDiscount) || numDiscount < 0)) {
      showError('Please enter a valid non-negative discount price');
      return;
    }

    try {
      setIsUpdating(true);
      await superAdminApi.updatePricing(selectedService.id, {
        basePrice: numBase,
        discountPrice: numDiscount,
        reason: reason.trim() || 'Super Admin pricing update',
      });
      showSuccess(`Pricing updated for ${selectedService.name}`);
      setSelectedService(null);
      loadServices();
    } catch (err: any) {
      showError(err.message || 'Failed to update pricing');
    } finally {
      setIsUpdating(false);
    }
  };

  const openHistoryDrawer = async (service: AdminService) => {
    setHistoryService(service);
    try {
      setLoadingHistory(true);
      const res = await superAdminApi.getPriceHistory(service.id);
      if (res.success && res.data) {
        setHistoryLogs(res.data);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load price history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.category_name && s.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Tags className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pricing Governance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative source of truth for service pricing. All changes require an audit justification and are logged immutably.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadServices}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900">
          <p className="font-bold">Authoritative Server-Side Validation Notice</p>
          <p className="text-purple-700 mt-0.5">
            The frontend never determines prices during checkout. Updating a price here modifies the live fee for new client applications, while completed orders and historical invoices remain permanently locked for accounting integrity.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by service or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading pricing catalogue...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No services found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Base Price</th>
                  <th className="py-3 px-4">Promo / Discount</th>
                  <th className="py-3 px-4">Effective Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => {
                  const base = Number(service.base_price || 0);
                  const discount = service.discount_price ? Number(service.discount_price) : null;
                  const effective = discount !== null ? discount : base;
                  const savings = discount !== null && base > 0 ? Math.round(((base - discount) / base) * 100) : 0;

                  return (
                    <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{service.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          {service.slug}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{service.category_name || 'General'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        ₹{base.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {discount !== null ? (
                          <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200/50">
                            <TrendingDown className="w-3 h-3" />
                            <span>₹{discount.toLocaleString('en-IN')}</span>
                            {savings > 0 && <span className="text-[10px]">({savings}% off)</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/60 font-mono text-xs">
                          ₹{effective.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openHistoryDrawer(service)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-[11px] font-semibold"
                            title="View Audit History"
                          >
                            <History className="w-3.5 h-3.5 text-slate-400" />
                            <span>History</span>
                          </button>
                          <button
                            onClick={() => openUpdateModal(service)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors text-[11px] font-semibold shadow-sm"
                          >
                            <Tags className="w-3.5 h-3.5" />
                            <span>Change Price</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Price Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Update Authoritative Price
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Service: <span className="font-bold text-slate-800">{selectedService.name}</span>
            </p>

            <form onSubmit={handleUpdatePrice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Base Price (INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3.5 py-2 font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Discount / Promotional Price (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Leave blank for no promo discount"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full px-3.5 py-2 font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When set, public website displays strikethrough base price and this discounted fee.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Festive discount offer, Annual GST compliance revision, statutory adjustment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Recording...' : 'Update & Audit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price History Drawer */}
      {historyService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col p-6 border-l border-slate-200 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <span>Price Audit History</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Service: <span className="font-semibold text-slate-800">{historyService.name}</span>
                </p>
              </div>
              <button
                onClick={() => setHistoryService(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-6">
              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading audit history...</div>
              ) : historyLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No previous price revisions recorded for this service.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 border border-purple-300 flex items-center justify-center absolute left-0 top-0 text-[10px] font-bold">
                        ₹
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            ₹{Number(log.new_base_price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.previous_base_price && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <span>Previous: ₹{Number(log.previous_base_price).toLocaleString('en-IN')}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold text-purple-700">₹{Number(log.new_base_price).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-600 mt-2 italic bg-white p-2 rounded-lg border border-slate-100">
                          "{log.reason || 'Price adjustment'}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Author: {log.changed_by_name || `Admin #${log.changed_by || 'SYS'}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryService(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
