import { apiClient } from './client';
import { Payment, ApiResponse } from '../types';

export interface PaymentFilters {
  status?: string;
  applicationId?: number;
  page?: number;
  limit?: number;
}

export const normalizePayment = (p: any): Payment => {
  if (!p) return p;
  return {
    id: p.id,
    publicId: p.public_id || p.publicId || String(p.id),
    paymentReference: p.payment_reference || p.paymentReference || `PAY-${p.id}`,
    clientId: p.client_id || p.clientId,
    clientName: p.client_name || p.clientName || 'Client',
    applicationId: p.application_id || p.applicationId,
    applicationNumber: p.application_number || p.applicationNumber,
    amount: String(p.amount || 0),
    currency: p.currency || 'INR',
    paymentGateway: p.payment_gateway || p.paymentGateway || 'RAZORPAY',
    gatewayPaymentId: p.gateway_payment_id || p.gatewayPaymentId,
    gatewayOrderId: p.gateway_order_id || p.gatewayOrderId,
    paymentMethod: p.payment_method || p.paymentMethod || 'UPI / NetBanking',
    status: p.status || 'CREATED',
    failureReason: p.failure_reason || p.failureReason,
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
  };
};

export const paymentsApi = {
  list: async (filters: PaymentFilters = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/payments', { params: filters });
    if (res.data && Array.isArray(res.data.data)) {
      return {
        ...res.data,
        data: res.data.data.map(normalizePayment),
      };
    }
    return res.data as ApiResponse<Payment[]>;
  },
};
