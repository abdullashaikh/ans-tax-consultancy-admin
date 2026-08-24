import { apiClient } from './client';
import { AuditLog, ApiResponse } from '../types';

export interface AuditFilters {
  action?: string;
  entityType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  list: async (filters: AuditFilters = {}) => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', { params: filters });
    return res.data;
  },
};
