import { apiClient } from './client';
import { User, RoleName, ApiResponse } from '../types';

export interface UserFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const usersApi = {
  list: async (filters: UserFilters = {}) => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users', { params: filters });
    return res.data;
  },

  getById: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${publicId}`);
    return res.data;
  },

  adminUpdate: async (
    publicId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      roles?: RoleName[];
    }
  ) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${publicId}`, data);
    return res.data;
  },
};
