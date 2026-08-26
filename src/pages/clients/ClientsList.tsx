import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, Building2, User, RefreshCw, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { clientsApi, ClientFilters } from '../../api/clients.api';
import { Client, PaginationMeta } from '../../types';

export const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<ClientFilters>({
    clientType: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await clientsApi.list(filters);
      if (res.success) {
        setClients(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered individual taxpayers and enterprise business accounts.
          </p>
        </div>

        <button
          onClick={loadClients}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by business name, legal name, PAN, GSTIN, or email..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filters.clientType}
            onChange={(e) => setFilters((prev) => ({ ...prev, clientType: e.target.value, page: 1 }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="">All Account Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="BUSINESS">Business / Corporate</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client / Entity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">PAN / Tax ID</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => {
                  const clientPubId = c.publicId || (c as any).public_id || String(c.id);
                  const clientType = (c.clientType || (c as any).client_type || 'INDIVIDUAL').toUpperCase();
                  const name =
                    c.businessName ||
                    (c as any).legal_name ||
                    c.contactPersonName ||
                    (c as any).display_name ||
                    'Client';
                  const email = c.contactEmail || (c as any).email || 'No email';
                  const phone = c.contactPhone || (c as any).phone || 'No phone';
                  const pan = c.panNumber || (c as any).pan_reference || (c as any).pan;
                  const gstin = c.gstin;

                  return (
                    <tr key={c.id || clientPubId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
                            {clientType === 'BUSINESS' ? (
                              <Building2 className="w-4 h-4 text-amber-600" />
                            ) : (
                              <User className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/clients/${clientPubId}`}
                              className="font-bold text-slate-900 hover:text-amber-600 transition-colors truncate max-w-[200px] block"
                            >
                              {name}
                            </Link>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {clientPubId ? String(clientPubId).slice(0, 8) : '—'}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <span className="capitalize">{clientType.toLowerCase()}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">{email}</p>
                        <p className="text-[10px] text-slate-400">{phone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {pan || <span className="text-slate-300 italic">N/A</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-800">
                        {gstin || <span className="text-slate-300 italic">N/A</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/clients/${clientPubId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
                        >
                          <span>Profile</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-800">{meta.totalPages}</span> ({meta.total} total clients)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
