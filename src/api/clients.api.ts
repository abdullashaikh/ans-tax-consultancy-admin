import { apiClient } from './client';
import { Client, ApiResponse } from '../types';

export interface ClientFilters {
  clientType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const clientsApi = {
  list: async (filters: ClientFilters = {}) => {
    const res = await apiClient.get<ApiResponse<Client[]>>('/clients', { params: filters });
    return res.data;
  },

  getById: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<Client>>(`/clients/${publicId}`);
    return res.data;
  },

  update: async (publicId: string, data: Partial<Client>) => {
    const res = await apiClient.patch<ApiResponse<Client>>(`/clients/${publicId}`, data);
    return res.data;
  },
};
