import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  File,
} from 'lucide-react';
import { documentsApi } from '../../api/documents.api';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    publicId: string;
    originalFileName?: string;
    documentTypeName?: string;
    mimeType?: string;
    fileSize?: number;
    clientName?: string;
  } | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !document?.publicId) {
      setDownloadUrl(null);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchPreviewUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await documentsApi.getDownloadUrl(document.publicId, 'inline');
        if (isMounted) {
          if (res.success && res.data?.downloadUrl) {
            setDownloadUrl(res.data.downloadUrl);
          } else {
            setError('Unable to load document preview from secure storage.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Failed to generate secure document preview URL.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPreviewUrl();

    // Prevent body scroll while modal is open
    const originalStyle = window.getComputedStyle(window.document.body).overflow;
    window.document.body.style.overflow = 'hidden';

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, document?.publicId, onClose]);

  if (!isOpen || !document) return null;

  const fileName = document.originalFileName || 'Document Preview';
  const docType = document.documentTypeName || 'Tax Document';
  const mimeType = (document.mimeType || '').toLowerCase();
  const fileExt = (fileName.split('.').pop() || '').toLowerCase();

  const isPdf = mimeType.includes('pdf') || fileExt === 'pdf';
  const isImage =
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(fileExt);
  const isSpreadsheet =
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    ['xlsx', 'xls', 'csv'].includes(fileExt);
  const isDoc = mimeType.includes('word') || ['doc', 'docx'].includes(fileExt);

  const getHeaderIcon = () => {
    if (isPdf) return <FileText className="w-5 h-5 text-rose-600" />;
    if (isImage) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (isSpreadsheet) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (isDoc) return <FileText className="w-5 h-5 text-indigo-600" />;
    return <File className="w-5 h-5 text-amber-600" />;
  };

  const handleDownload = async () => {
    if (!document?.publicId) return;
    try {
      setDownloading(true);
      await documentsApi.downloadDocument(document.publicId, fileName);
    } catch (err: any) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER (Only File Name & Type on Header with Top Close Icon) */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              {getHeaderIcon()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 truncate tracking-tight">
                {fileName}
              </h2>
              <p className="text-xs font-semibold text-amber-800 tracking-wide mt-0.5">
                {docType} {document.clientName ? `• ${document.clientName}` : ''}
              </p>
            </div>
          </div>

          {/* Close Icon on Top */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PREVIEW BODY AREA */}
        <div className="flex-1 bg-slate-100/70 relative overflow-hidden flex items-center justify-center p-3 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-xs font-semibold">Loading secure document preview from AWS S3...</p>
            </div>
          )}

          {error && !loading && (
            <div className="max-w-md p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Preview Unavailable</h3>
              <p className="text-xs text-slate-600">{error}</p>
              {downloadUrl && (
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Download File Instead
                </button>
              )}
            </div>
          )}

          {!loading && !error && downloadUrl && (
            <>
              {isPdf ? (
                <iframe
                  src={`${downloadUrl}#toolbar=1`}
                  title={fileName}
                  className="w-full h-full rounded-2xl border border-slate-200/80 bg-white shadow-inner"
                />
              ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                  <img
                    src={downloadUrl}
                    alt={fileName}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-lg border border-slate-200/60 bg-white"
                  />
                </div>
              ) : (
                <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 mx-auto flex items-center justify-center">
                    {getHeaderIcon()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fileName}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      This file format ({fileExt.toUpperCase()}) cannot be rendered directly inside the browser viewer.
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20 text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {fileExt.toUpperCase()} Document</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER (Close button on bottom + Download button) */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[11px]">Esc</kbd> to close
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {downloadUrl && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 text-amber-700 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? 'Downloading...' : 'Download'}</span>
              </button>
            )}

            {/* Close button on bottom */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Close Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
