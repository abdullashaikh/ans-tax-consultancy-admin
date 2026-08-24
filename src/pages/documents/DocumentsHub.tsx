import React, { useEffect, useState, useCallback } from 'react';
import { Download, CheckCircle2, XCircle, FileText, Search, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { documentsApi, DocumentFilters } from '../../api/documents.api';
import { useToast } from '../../context/ToastContext';
import { DocumentItem, DocumentStatus, PaginationMeta } from '../../types';

export const DocumentsHub: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<DocumentFilters>({
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { showSuccess, showError } = useToast();

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentsApi.list(filters);
      if (res.success) {
        setDocuments(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      showError(err.response?.data?.message || 'Failed to load documents from server');
    } finally {
      setLoading(false);
    } 
  }, [filters, showError]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDownload = async (docPublicId: string) => {
    try {
      const res = await documentsApi.getDownloadUrl(docPublicId);
      if (res.success && res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to generate download URL');
    }
  };

  const handleUpdateStatus = async (docPublicId: string, status: DocumentStatus) => {
    try {
      const res = await documentsApi.updateStatus(docPublicId, status);
      if (res.success) {
        showSuccess(`Document marked as ${status}`);
        loadDocuments();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update document status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Verification Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized queue for verifying tax certificates, PAN, Form 16, and bank statements.
          </p>
        </div>

        <button
          onClick={loadDocuments}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name or client legal name..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Verification States</option>
          <option value="UPLOADED">Pending Initial Check (Uploaded)</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Document / File</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading documents from server...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.originalFileName}</p>
                          <p className="text-[10px] text-slate-400">ID: {doc.publicId.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {doc.documentTypeName || 'Tax Document'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {doc.clientName || 'Client'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc.publicId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Download securely with pre-signed URL"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {doc.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateStatus(doc.publicId, 'VERIFIED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {doc.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(doc.publicId, 'REJECTED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
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
              <span className="font-bold text-slate-800">{meta.totalPages}</span> ({meta.total} files)
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
    </div>
  );
};
