import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { auditApi, AuditFilters } from '../../api/audit.api';
import { useToast } from '../../context/ToastContext';
import { AuditLog, PaginationMeta } from '../../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<AuditFilters>({
    action: '',
    search: '',
    page: 1,
    limit: 20,
  });

  const { showError } = useToast();

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditApi.list(filters);
      if (res.success) {
        setLogs(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      showError(err.response?.data?.message || 'Failed to load audit logs from server');
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Activity Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all administrative actions, document verifications, status changes, and logins.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Journal</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, email, actor name, or IP address..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={filters.action}
          onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Action Types</option>
          <option value="USER_LOGGED_IN">User Login</option>
          <option value="APPLICATION_CREATED">Application Created</option>
          <option value="APPLICATION_STATUS_CHANGE">Application Status Change</option>
          <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
          <option value="DOCUMENT_VERIFIED">Document Verified</option>
          <option value="DOCUMENT_DOWNLOAD_URL_GENERATED">Document Download URL</option>
          <option value="PAYMENT_CREATED">Payment Initiated</option>
          <option value="LEAD_CONVERTED_TO_CLIENT">Lead Converted</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Payload Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    Loading audit trail from database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-800">
                      {log.entityType ? `${log.entityType} #${log.entityId || ''}` : 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {log.userName || log.userEmail || <span className="text-slate-400 italic">System Event</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-[240px] truncate">
                      {log.newValues ? JSON.stringify(log.newValues) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-800">{meta.totalPages}</span> ({meta.total} events logged)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 font-sans"
              >
                Previous
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 font-sans"
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
