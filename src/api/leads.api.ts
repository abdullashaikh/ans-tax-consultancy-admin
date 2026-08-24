import { apiClient } from './client';
import { Lead, LeadStatus, ApiResponse } from '../types';

export interface LeadFilters {
  status?: string;
  assignedTo?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const leadsApi = {
  list: async (filters: LeadFilters = {}) => {
    const res = await apiClient.get<ApiResponse<Lead[]>>('/leads', { params: filters });
    return res.data;
  },

  updateStatus: async (publicId: string, status: LeadStatus, assignedTo?: number) => {
    const res = await apiClient.patch<ApiResponse<Lead>>(`/leads/${publicId}/status`, {
      status,
      assignedTo,
    });
    return res.data;
  },

  convertToClient: async (publicId: string, clientType: 'INDIVIDUAL' | 'BUSINESS', temporaryPassword: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/leads/${publicId}/convert`, {
      clientType,
      temporaryPassword,
    });
    return res.data;
  },
};
