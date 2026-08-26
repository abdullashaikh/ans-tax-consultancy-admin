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

export const normalizeApplication = (app: any): Application => {
  if (!app) return app;
  return {
    id: app.id,
    publicId: app.public_id || app.publicId || String(app.id),
    applicationNumber: app.application_number || app.applicationNumber || `ANS-${app.id}`,
    clientId: app.client_id || app.clientId,
    clientName: app.client_name || app.clientName || 'Client',
    clientEmail: app.client_email || app.clientEmail,
    clientPhone: app.client_phone || app.clientPhone,
    serviceId: app.service_id || app.serviceId,
    serviceName: app.service_name || app.serviceName || app.title || 'Tax Service',
    serviceCategory: app.category_name || app.serviceCategory || 'Compliance',
    title: app.title || app.service_name || 'Tax Filing Application',
    description: app.description || app.notes,
    status: app.status || 'DRAFT',
    priority: app.priority || 'NORMAL',
    quotedAmount: app.quoted_amount ?? app.quotedAmount,
    currency: app.currency || 'INR',
    assignedConsultantId: app.assigned_consultant_id || app.assignedConsultantId,
    assignedConsultantName:
      app.consultant_name ||
      app.assignedConsultantName ||
      (app.consultant_first_name
        ? `${app.consultant_first_name} ${app.consultant_last_name || ''}`.trim()
        : undefined),
    targetCompletionDate: app.target_completion_date || app.targetCompletionDate,
    filedDate: app.submitted_at || app.filedDate,
    completedDate: app.completed_at || app.completedDate,
    createdAt: app.created_at || app.createdAt || new Date().toISOString(),
    updatedAt: app.updated_at || app.updatedAt || app.created_at || new Date().toISOString(),
    assignments: app.assignments,
    statusHistory: app.statusHistory,
    documents: app.documents,
  };
};

export const applicationsApi = {
  list: async (filters: ApplicationFilters = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/applications', { params: filters });
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizeApplication),
      };
    }
    return res.data as ApiResponse<Application[]>;
  },

  getById: async (publicId: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/applications/${publicId}`);
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeApplication(res.data.data),
      };
    }
    return res.data as ApiResponse<Application>;
  },

  updateStatus: async (publicId: string, status: ApplicationStatus, reason?: string) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/applications/${publicId}/status`, {
      status,
      reason,
    });
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeApplication(res.data.data),
      };
    }
    return res.data as ApiResponse<Application>;
  },

  assignConsultant: async (publicId: string, consultantId: number, notes?: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/applications/${publicId}/assign`, {
      consultantId,
      notes,
    });
    if (res.data && res.data.data) {
      return {
        ...res.data,
        data: normalizeApplication(res.data.data),
      };
    }
    return res.data as ApiResponse<Application>;
  },
};
