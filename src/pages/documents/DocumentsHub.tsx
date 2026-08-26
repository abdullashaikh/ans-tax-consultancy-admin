import React, { useEffect, useState, useCallback } from 'react';
import {
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { documentsApi, DocumentFilters } from '../../api/documents.api';
import { useToast } from '../../context/ToastContext';
import { DocumentItem, DocumentStatus, PaginationMeta } from '../../types';
import { DocumentPreviewModal } from '../../components/shared/DocumentPreviewModal';

export const DocumentsHub: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
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

  const handleDownload = async (docPublicId: string, fileName?: string) => {
    try {
      await documentsApi.downloadDocument(docPublicId, fileName);
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Failed to download document from AWS S3');
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Verification Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized queue for verifying tax certificates, PAN, Form 16, and bank statements stored in AWS S3.
          </p>
        </div>

        <button
          onClick={loadDocuments}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
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
            placeholder="Search by file name, category, or client legal name..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
                <th className="py-3 px-4">Category</th>
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
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    Loading documents from server...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const docPubId = doc.publicId || (doc as any).public_id || String(doc.id);
                  const fileName = doc.originalFileName || (doc as any).original_file_name || 'Document';
                  const docType = doc.documentTypeName || (doc as any).document_type_name || 'Tax Document';
                  const clientName = doc.clientName || (doc as any).client_name || 'Client';
                  const fileSize = doc.fileSize || (doc as any).file_size || 0;
                  const uploadDate = doc.createdAt || (doc as any).created_at || (doc as any).uploaded_at;

                  return (
                    <tr key={doc.id || docPubId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="font-bold text-slate-900 hover:text-amber-700 transition-colors truncate max-w-[200px] sm:max-w-[260px] text-left block cursor-pointer"
                              title="Click to preview"
                            >
                              {fileName}
                            </button>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {docPubId ? String(docPubId).slice(0, 8) : '—'}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {docType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {clientName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatFileSize(fileSize)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {uploadDate
                            ? new Date(uploadDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Just now'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                            title="Preview file in full page popup"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(docPubId, fileName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Download securely with pre-signed URL"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>Download</span>
                          </button>

                          {doc.status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(docPubId, 'VERIFIED')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Approve document"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {doc.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(docPubId, 'REJECTED')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Reject document"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
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
              <span className="font-bold text-slate-800">{meta.totalPages}</span> ({meta.total} total documents)
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

      {/* Full Page Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
};
