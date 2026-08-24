import { apiClient } from './client';
import { Application, ApplicationStatus, ApiResponse } from '../types';

export interface ApplicationFilters {
  status?: string;
  priority?: string;
  serviceId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const applicationsApi = {
  list: async (filters: ApplicationFilters = {}) => {
    const res = await apiClient.get<ApiResponse<Application[]>>('/applications', { params: filters });
    return res.data;
  },

  getById: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<Application>>(`/applications/${publicId}`);
    return res.data;
  },

  updateStatus: async (publicId: string, status: ApplicationStatus, reason?: string) => {
    const res = await apiClient.patch<ApiResponse<Application>>(`/applications/${publicId}/status`, {
      status,
      reason,
    });
    return res.data;
  },

  assignConsultant: async (publicId: string, consultantId: number, notes?: string) => {
    const res = await apiClient.post<ApiResponse<Application>>(`/applications/${publicId}/assign`, {
      consultantId,
      notes,
    });
    return res.data;
  },
};
