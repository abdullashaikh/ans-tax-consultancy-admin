import { apiClient } from './client';
import { Payment, ApiResponse } from '../types';

export interface PaymentFilters {
  status?: string;
  applicationId?: number;
  page?: number;
  limit?: number;
}

export const paymentsApi = {
  list: async (filters: PaymentFilters = {}) => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/payments', { params: filters });
    return res.data;
  },
};
