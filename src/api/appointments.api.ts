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

export const normalizeAppointment = (a: any): Appointment => {
  if (!a) return a;
  return {
    id: a.id,
    publicId: a.public_id || a.publicId || String(a.id),
    clientId: a.client_id || a.clientId,
    clientName: a.client_name || a.clientName || 'Client',
    consultantId: a.consultant_id || a.consultantId,
    consultantName:
      a.consultant_name ||
      a.consultantName ||
      (a.consultant_first_name
        ? `${a.consultant_first_name} ${a.consultant_last_name || ''}`.trim()
        : 'Consultant'),
    appointmentType: a.appointment_type || a.appointmentType || 'VIDEO',
    status: a.status || 'REQUESTED',
    scheduledStart: a.scheduled_start || a.scheduledStart || new Date().toISOString(),
    scheduledEnd: a.scheduled_end || a.scheduledEnd || new Date().toISOString(),
    meetingUrl: a.meeting_url || a.meetingUrl,
    notes: a.notes,
    createdAt: a.created_at || a.createdAt || new Date().toISOString(),
  };
};

export const appointmentsApi = {
  list: async (filters: AppointmentFilters = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/appointments', { params: filters });
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizeAppointment),
      };
    }
    return res.data as ApiResponse<Appointment[]>;
  },

  updateStatus: async (publicId: string, status: AppointmentStatus) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/appointments/${publicId}/status`, { status });
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeAppointment(res.data.data),
      };
    }
    return res.data as ApiResponse<Appointment>;
  },
};
