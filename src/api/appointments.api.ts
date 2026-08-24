import { apiClient } from './client';
import { Appointment, AppointmentStatus, ApiResponse } from '../types';

export interface AppointmentFilters {
  status?: string;
  consultantId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export const appointmentsApi = {
  list: async (filters: AppointmentFilters = {}) => {
    const res = await apiClient.get<ApiResponse<Appointment[]>>('/appointments', { params: filters });
    return res.data;
  },

  updateStatus: async (publicId: string, status: AppointmentStatus) => {
    const res = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${publicId}/status`, { status });
    return res.data;
  },
};
