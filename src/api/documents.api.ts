import { apiClient } from './client';
import { DocumentItem, DocumentStatus, ApiResponse } from '../types';

export interface DocumentFilters {
  status?: string;
  clientId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const normalizeDocument = (doc: any): DocumentItem => {
  if (!doc) return doc;
  return {
    id: doc.id,
    publicId: doc.public_id || doc.publicId || String(doc.id),
    clientId: doc.client_id || doc.clientId,
    clientName: doc.client_name || doc.clientName || 'Client',
    applicationId: doc.application_id || doc.applicationId,
    applicationNumber: doc.application_number || doc.applicationNumber,
    documentTypeId: doc.document_type_id || doc.documentTypeId,
    documentTypeName: doc.document_type_name || doc.documentTypeName || 'Tax File',
    originalFileName: doc.original_file_name || doc.originalFileName || 'document.pdf',
    fileSize: Number(doc.file_size || doc.fileSize || 0),
    mimeType: doc.mime_type || doc.mimeType || 'application/pdf',
    status: doc.status || 'UPLOADED',
    uploadedBy: doc.uploaded_by || doc.uploadedBy,
    uploadedByName:
      doc.uploaded_by_name ||
      doc.uploadedByName ||
      (doc.uploaded_by_first_name
        ? `${doc.uploaded_by_first_name} ${doc.uploaded_by_last_name || ''}`.trim()
        : undefined),
    createdAt: doc.created_at || doc.createdAt || doc.uploaded_at || doc.uploadedAt || new Date().toISOString(),
  };
};

export const documentsApi = {
  list: async (filters: DocumentFilters = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/documents', { params: filters });
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizeDocument),
      };
    }
    return res.data as ApiResponse<DocumentItem[]>;
  },

  getDownloadUrl: async (publicId: string, disposition: 'attachment' | 'inline' = 'attachment') => {
    const res = await apiClient.get<ApiResponse<{ downloadUrl: string; expiresAt: string; fileName?: string; mimeType?: string }>>(
      `/documents/${publicId}/download-url`,
      { params: { disposition } }
    );
    return res.data;
  },

  downloadDocument: async (publicId: string, customFileName?: string): Promise<boolean> => {
    const res = await documentsApi.getDownloadUrl(publicId, 'attachment');
    if (res.success && res.data?.downloadUrl) {
      const fileName = customFileName || res.data.fileName || 'document.pdf';
      const link = document.createElement('a');
      link.href = res.data.downloadUrl;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 150);
      return true;
    }
    throw new Error('Failed to generate secure download URL');
  },

  updateStatus: async (publicId: string, status: DocumentStatus, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/documents/${publicId}/status`, {
      status,
      notes,
    });
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeDocument(res.data.data),
      };
    }
    return res.data as ApiResponse<DocumentItem>;
  },

  listByApplication: async (appPublicId: string) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/documents/by-application/${appPublicId}`);
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizeDocument),
      };
    }
    return res.data as ApiResponse<DocumentItem[]>;
  },

  listTypes: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/documents/types');
    return res.data;
  },
};
