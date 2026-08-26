import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  UserCheck,
  Download,
  FileText,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal } from '../../components/shared/Modal';
import { applicationsApi } from '../../api/applications.api';
import { documentsApi } from '../../api/documents.api';
import { usersApi } from '../../api/users.api';
import { useToast } from '../../context/ToastContext';
import { Application, ApplicationStatus, DocumentItem, User as UserModel } from '../../types';
import { DocumentPreviewModal } from '../../components/shared/DocumentPreviewModal';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [consultants, setConsultants] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [statusReason, setStatusReason] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Consultant Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedConsultantId, setSelectedConsultantId] = useState<number | ''>('');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    if (!id || id === 'undefined') {
      setError('Invalid application identifier provided in route.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [appRes, docsRes] = await Promise.all([
        applicationsApi.getById(id),
        documentsApi.listByApplication(id).catch(() => ({ success: true, data: [] })),
      ]);

      if (appRes.success && appRes.data) {
        setApplication(appRes.data);
        setSelectedStatus(appRes.data.status);
      } else {
        setError('Application details could not be retrieved from the server.');
      }

      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
      }
    } catch (err: any) {
      console.error('Error fetching application dossier:', err);
      const msg = err.response?.data?.message || 'Failed to load application dossier from database.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load consultant list when assign modal opens
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    try {
      const res = await usersApi.list({ limit: 50 });
      if (res.success && res.data) {
        const staff = res.data.filter((u) =>
          u.roles.some((r) => r === 'CONSULTANT' || r === 'ADMIN' || r === 'SUPER_ADMIN')
        );
        setConsultants(staff);
      }
    } catch (err) {
      console.error('Failed to load consultants:', err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsUpdatingStatus(true);
      const res = await applicationsApi.updateStatus(id, selectedStatus, statusReason);
      if (res.success) {
        showSuccess('Application status updated successfully');
        setIsStatusModalOpen(false);
        setStatusReason('');
        loadData();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignConsultant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedConsultantId) return;

    try {
      setIsAssigning(true);
      const res = await applicationsApi.assignConsultant(id, Number(selectedConsultantId), assignNotes);
      if (res.success) {
        showSuccess('Consultant assigned successfully');
        setIsAssignModalOpen(false);
        setAssignNotes('');
        loadData();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to assign consultant');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDownloadDoc = async (docPublicId: string, fileName?: string) => {
    try {
      await documentsApi.downloadDocument(docPublicId, fileName);
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Failed to download document from AWS S3');
    }
  };

  const handleVerifyDoc = async (docPublicId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await documentsApi.updateStatus(docPublicId, status);
      if (res.success) {
        showSuccess(`Document marked as ${status}`);
        loadData();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update document status');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-600" />
        <p className="text-xs font-bold text-slate-700">Loading case dossier from database...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Application Not Found</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {error || 'The requested application could not be found or has been archived.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Applications</span>
          </Link>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusSteps: ApplicationStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'FILED',
    'COMPLETED',
  ];

  const currentStepIndex = statusSteps.indexOf(application.status);

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            title="Back to all applications"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-extrabold text-slate-900">
                {application.applicationNumber}
              </span>
              <StatusBadge status={application.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Service:{' '}
              <span className="font-semibold text-slate-800">
                {application.serviceName || application.title}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Update Status</span>
          </button>

          <button
            onClick={handleOpenAssignModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Assign Consultant</span>
          </button>
        </div>
      </div>

      {/* Visual Progression Stepper */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Lifecycle Progression
        </h3>
        <div className="flex items-center justify-between overflow-x-auto py-2">
          {statusSteps.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = application.status === step;
            return (
              <div key={step} className="flex items-center flex-1 min-w-[110px] last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                      isCurrent
                        ? 'bg-amber-500 border-amber-600 text-slate-950 ring-4 ring-amber-500/20'
                        : isCompleted
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-semibold text-center capitalize ${
                      isCurrent
                        ? 'text-amber-700 font-bold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStepIndex > idx ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Case Information & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Dossier Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Case Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Service Category</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {application.serviceCategory || 'Taxation'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Priority</span>
                <p className="font-semibold text-slate-900 mt-0.5">{application.priority}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Quoted Amount</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {application.quotedAmount ? `₹ ${application.quotedAmount}` : 'Standard Catalog Fee'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Filing Date</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {application.filedDate
                    ? new Date(application.filedDate).toLocaleDateString()
                    : 'Not filed yet'}
                </p>
              </div>
            </div>

            {application.description && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Client Notes / Scope</span>
                <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {application.description}
                </p>
              </div>
            )}
          </div>

          {/* Attached Documents */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Attached Documents</h3>
              <span className="text-xs font-semibold text-slate-500">{documents.length} Files</span>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No documents attached to this case yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {documents.map((doc) => {
                  const docPubId = doc.publicId || (doc as any).public_id || String(doc.id);
                  const fileName = doc.originalFileName || (doc as any).original_file_name || 'Document';
                  const docType = doc.documentTypeName || (doc as any).document_type_name || 'Tax File';
                  const fileSize = doc.fileSize || (doc as any).file_size || 0;

                  return (
                    <div key={doc.id || docPubId} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="font-bold text-slate-900 hover:text-amber-700 transition-colors truncate max-w-[180px] sm:max-w-[280px] text-left block cursor-pointer"
                          >
                            {fileName}
                          </button>
                          <p className="text-[11px] text-slate-400">
                            {docType} &bull; {fileSize ? (fileSize / 1024).toFixed(1) : 0} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={doc.status} size="sm" />

                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                          title="Preview document in popup"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(docPubId, fileName)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Download securely (Signed S3 URL)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {doc.status !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyDoc(docPubId, 'VERIFIED')}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Client & Consultant Sidebar */}
        <div className="space-y-6">
          {/* Client Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Client Contact
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Client Name</span>
                <p className="font-bold text-slate-900 mt-0.5">{application.clientName || 'Client'}</p>
              </div>
              <div>
                <span className="text-slate-400">Email Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.clientEmail || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.clientPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Assigned Consultant */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Assigned Consultant
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm">
                {application.assignedConsultantName?.[0] || '?'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {application.assignedConsultantName || 'Unassigned'}
                </p>
                <p className="text-[11px] text-slate-500">Tax Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Application Status"
        subtitle={`Current reference: ${application.applicationNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAYMENT_RECEIVED">Payment Received</option>
              <option value="FILED">Filed (ITR / GST Filed)</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Consultant Audit Note
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Verified computation sheet; filed ITR-2 with acknowledgment number..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {isUpdatingStatus ? 'Saving...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Consultant Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Consultant to Case"
        subtitle={`Assign a specialized staff member to ${application.applicationNumber}`}
      >
        <form onSubmit={handleAssignConsultant} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Qualified Consultant
            </label>
            <select
              value={selectedConsultantId}
              onChange={(e) => setSelectedConsultantId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Choose Staff / Consultant...</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignment Instructions / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please expedite GST ITC reconciliation..."
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning || !selectedConsultantId}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 cursor-pointer"
            >
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Full Page Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
};
