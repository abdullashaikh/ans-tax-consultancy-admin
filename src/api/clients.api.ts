import { apiClient } from './client';
import { Client, ApiResponse } from '../types';

export interface ClientFilters {
  clientType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const normalizeClient = (c: any): Client => {
  if (!c) return c;
  const name =
    c.legal_name ||
    c.legalName ||
    c.display_name ||
    c.displayName ||
    c.businessName ||
    c.contactPersonName ||
    (c.user_first_name ? `${c.user_first_name} ${c.user_last_name || ''}`.trim() : 'Client');

  return {
    id: c.id,
    publicId: c.public_id || c.publicId || String(c.id),
    userId: c.user_id || c.userId,
    clientType: c.client_type || c.clientType || 'INDIVIDUAL',
    businessName: c.business_type || c.businessName || name,
    contactPersonName: c.display_name || c.displayName || c.contactPersonName || name,
    contactEmail: c.email || c.contactEmail || '',
    contactPhone: c.phone || c.contactPhone || '',
    panNumber: c.pan_reference || c.panNumber || c.pan || '',
    gstin: c.gstin || '',
    status: c.status || 'ACTIVE',
    notes: c.notes,
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
    addresses: c.addresses || [],
  };
};

export const clientsApi = {
  list: async (filters: ClientFilters = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/clients', { params: filters });
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizeClient),
      };
    }
    return res.data as ApiResponse<Client[]>;
  },

  getById: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/clients/${publicId}`);
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeClient(res.data.data),
      };
    }
    return res.data as ApiResponse<Client>;
  },

  update: async (publicId: string, data: Partial<Client>) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/clients/${publicId}`, data);
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeClient(res.data.data),
      };
    }
    return res.data as ApiResponse<Client>;
  },
};
