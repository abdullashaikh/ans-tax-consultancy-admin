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
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Price Edit Modal
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [basePrice, setBasePrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('INR');
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
      const res = await superAdminApi.getServices({ all: true });
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
    setDiscountPrice(
      service.promo_price ? String(service.promo_price) : service.discount_price ? String(service.discount_price) : ''
    );
    setCurrency(service.currency || (service.region === 'UAE' ? 'AED' : 'INR'));
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
        promoPrice: numDiscount,
        currency,
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

  const filteredServices = services.filter((s) => {
    const matchRegion = selectedRegion === 'ALL' || (s.region || 'INDIA') === selectedRegion;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.category_name && s.category_name.toLowerCase().includes(search.toLowerCase()));
    return matchRegion && matchSearch;
  });

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
            Authoritative source of truth for service pricing across India (INR) and UAE (AED). All changes require an audit justification and are logged immutably.
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

      {/* Region Switcher & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'All Jurisdictions' },
            { key: 'INDIA', label: '🇮🇳 India (INR)' },
            { key: 'UAE', label: '🇦🇪 UAE (AED)' },
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
          <div className="p-12 text-center text-xs text-slate-400">Loading pricing records...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No services found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Fee</th>
                  <th className="py-3 px-4">Promotional Fee</th>
                  <th className="py-3 px-4">Effective Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredServices.map((service) => {
                  const base = Number(service.base_price || 0);
                  const promo =
                    service.promo_price !== undefined && service.promo_price !== null
                      ? Number(service.promo_price)
                      : service.discount_price !== undefined && service.discount_price !== null
                      ? Number(service.discount_price)
                      : null;
                  const effective = promo !== null ? promo : base;
                  const curr = service.currency || (service.region === 'UAE' ? 'AED' : 'INR');

                  return (
                    <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{service.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          /{service.region?.toLowerCase() || 'india'}/{service.slug}
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{service.category_name || 'General'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {curr} {base.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {promo !== null ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            <TrendingDown className="w-3 h-3" />
                            <span>{curr} {promo.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-purple-700">
                        {curr} {effective.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openHistoryDrawer(service)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1"
                            title="View Immutable Price History"
                          >
                            <History className="w-3.5 h-3.5 text-slate-500" />
                            <span>History</span>
                          </button>
                          <button
                            onClick={() => openUpdateModal(service)}
                            className="px-3 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <span>Edit Fee</span>
                            <ArrowRight className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Update Service Fee</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedService.name}</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Fee *
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
                      Promotional Fee
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
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
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Audit Justification / Reason *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Q3 Promotional Campaign or Statutory Tariff Adjustment"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mandatory for regulatory and internal pricing audit tracking.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Confirm & Commit Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {historyService && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Pricing Audit Trail</h2>
                <p className="text-xs text-slate-500 mt-0.5">{historyService.name}</p>
              </div>
              <button
                onClick={() => setHistoryService(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingHistory ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading audit history...</div>
              ) : historyLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No historical price change logs found for this service.
                </div>
              ) : (
                historyLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <span className="font-semibold text-slate-600">
                        {log.changed_by_name || 'System / Admin'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-slate-500">
                        Prev:{' '}
                        <span className="font-medium text-slate-700">
                          {log.previous_base_price ? `${log.currency} ${Number(log.previous_base_price).toLocaleString()}` : 'None'}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <div className="font-bold text-purple-700">
                        New: {log.currency} {Number(log.new_base_price).toLocaleString()}
                      </div>
                    </div>

                    {log.new_discount_price && (
                      <div className="text-[11px] text-emerald-600 font-medium">
                        Promotional Fee: {log.currency} {Number(log.new_discount_price).toLocaleString()}
                      </div>
                    )}

                    {log.reason && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 mt-1">
                        <span className="font-semibold">Reason:</span> {log.reason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setHistoryService(null)}
                className="w-full py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
