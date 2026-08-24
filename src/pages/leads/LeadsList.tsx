import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Modal } from '../../components/shared/Modal';
import { leadsApi, LeadFilters } from '../../api/leads.api';
import { useToast } from '../../context/ToastContext';
import { Lead, LeadStatus, PaginationMeta } from '../../types';

export const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<LeadFilters>({
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });

  // Convert Modal State
  const [convertModalOpen, setConvertModalOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [clientType, setClientType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [tempPassword, setTempPassword] = useState<string>('Welcome@ANS2026');
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leadsApi.list(filters);
      if (res.success) {
        setLeads(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleUpdateStatus = async (publicId: string, status: LeadStatus) => {
    try {
      const res = await leadsApi.updateStatus(publicId, status);
      if (res.success) {
        showSuccess(`Lead marked as ${status}`);
        loadLeads();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update lead status');
    }
  };

  const handleOpenConvert = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertModalOpen(true);
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      setIsConverting(true);
      const res = await leadsApi.convertToClient(selectedLead.publicId, clientType, tempPassword);
      if (res.success) {
        showSuccess(`Successfully converted ${selectedLead.name} into an active client account!`);
        setConvertModalOpen(false);
        loadLeads();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to convert lead to client');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads & Inquiries CRM</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track incoming consultation inquiries and onboard qualified leads into client accounts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lead name, email, or city..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All CRM Stages</option>
          <option value="NEW">New Inquiries</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted to Client</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Prospect Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Service Required</th>
                <th className="py-3 px-4">Message / Scope</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No inquiries recorded.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{lead.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">{lead.email || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{lead.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {lead.serviceName || lead.businessType || 'General Tax Filing'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                      {lead.message || <span className="text-slate-300 italic">No notes provided</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.publicId, e.target.value as LeadStatus)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {lead.status !== 'CONVERTED' && lead.email && (
                        <button
                          onClick={() => handleOpenConvert(lead)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Convert to Client</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-800">{meta.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Convert Lead Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead to Active Client Account"
        subtitle={`Prospect: ${selectedLead?.name}`}
      >
        <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Client Account Type
            </label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as 'INDIVIDUAL' | 'BUSINESS')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
            >
              <option value="INDIVIDUAL">Individual Taxpayer</option>
              <option value="BUSINESS">Business / Corporate Account</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Temporary Access Password
            </label>
            <input
              type="text"
              required
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              The client will be prompted to reset their password upon initial login.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConverting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            >
              {isConverting ? 'Creating Client Account...' : 'Confirm Account Provisioning'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
