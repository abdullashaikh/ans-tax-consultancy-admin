import { apiClient } from './client';
import { DocumentItem, DocumentStatus, ApiResponse } from '../types';

export interface DocumentFilters {
  status?: string;
  clientId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const documentsApi = {
  list: async (filters: DocumentFilters = {}) => {
    const res = await apiClient.get<ApiResponse<DocumentItem[]>>('/documents', { params: filters });
    return res.data;
  },

  getDownloadUrl: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<{ downloadUrl: string; expiresAt: string }>>(
      `/documents/${publicId}/download-url`
    );
    return res.data;
  },

  updateStatus: async (publicId: string, status: DocumentStatus, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<DocumentItem>>(`/documents/${publicId}/status`, {
      status,
      notes,
    });
    return res.data;
  },

  listByApplication: async (appPublicId: string) => {
    const res = await apiClient.get<ApiResponse<DocumentItem[]>>(`/documents/by-application/${appPublicId}`);
    return res.data;
  },

  listTypes: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/documents/types');
    return res.data;
  },
};
