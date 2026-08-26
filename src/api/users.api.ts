import { apiClient } from './client';
import { User, RoleName, ApiResponse } from '../types';

export interface UserFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const normalizeUser = (u: any): User => {
  if (!u) return u;
  const roles: RoleName[] = Array.isArray(u.roles)
    ? u.roles
    : typeof u.roles === 'string'
    ? (u.roles.split(',').filter(Boolean) as RoleName[])
    : typeof u.roles_csv === 'string'
    ? (u.roles_csv.split(',').filter(Boolean) as RoleName[])
    : [];

  return {
    id: u.id,
    publicId: u.public_id || u.publicId || String(u.id),
    email: u.email || '',
    firstName: u.first_name || u.firstName || 'User',
    lastName: u.last_name || u.lastName || '',
    phone: u.phone,
    status: u.status || 'ACTIVE',
    roles: roles.length > 0 ? roles : ['CLIENT'],
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
    clientId: u.client_id || u.clientId,
    clientPublicId: u.client_public_id || u.clientPublicId,
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
  };
};

export const usersApi = {
  list: async (filters: UserFilters = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/users', { params: filters });
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizeUser),
      };
    }
    return res.data as ApiResponse<User[]>;
  },

  getById: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/users/${publicId}`);
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeUser(res.data.data),
      };
    }
    return res.data as ApiResponse<User>;
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
    const res = await apiClient.patch<ApiResponse<any>>(`/users/${publicId}`, data);
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeUser(res.data.data),
      };
    }
    return res.data as ApiResponse<User>;
  },
};
