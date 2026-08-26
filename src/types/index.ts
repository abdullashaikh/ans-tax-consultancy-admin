export type RoleName = 'SUPER_ADMIN' | 'ADMIN' | 'CONSULTANT' | 'STAFF' | 'CLIENT';

export interface User {
  id: number;
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roles: RoleName[];
  permissions: string[];
  clientId?: number;
  clientPublicId?: string;
  createdAt?: string;
}

export interface ClientAddress {
  id: number;
  addressType: 'REGISTERED' | 'COMMUNICATION' | 'BRANCH' | 'RESIDENTIAL';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface Client {
  id: number;
  publicId: string;
  userId: number;
  clientType: 'INDIVIDUAL' | 'BUSINESS';
  businessName?: string;
  contactPersonName?: string;
  contactEmail: string;
  contactPhone?: string;
  panNumber?: string;
  gstin?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
  createdAt: string;
  addresses?: ClientAddress[];
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ACTION_REQUIRED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIVED'
  | 'FILED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type ApplicationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ApplicationAssignment {
  id: number;
  consultantId: number;
  consultantName?: string;
  assignedAt: string;
  status: 'ACTIVE' | 'REASSIGNED' | 'COMPLETED';
}

export interface ApplicationStatusHistory {
  id: number;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  changedByUserId: number;
  changedByName?: string;
  reason?: string;
  createdAt: string;
}

export interface Application {
  id: number;
  publicId: string;
  applicationNumber: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceId: number;
  serviceName?: string;
  serviceCategory?: string;
  title: string;
  description?: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  quotedAmount?: string;
  currency: string;
  assignedConsultantId?: number;
  assignedConsultantName?: string;
  targetCompletionDate?: string;
  filedDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
  assignments?: ApplicationAssignment[];
  statusHistory?: ApplicationStatusHistory[];
  documents?: DocumentItem[];
}

export type DocumentStatus = 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'ARCHIVED';

export interface DocumentItem {
  id: number;
  publicId: string;
  clientId: number;
  clientName?: string;
  applicationId?: number;
  applicationNumber?: string;
  documentTypeId: number;
  documentTypeName?: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedBy: number;
  uploadedByName?: string;
  createdAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'CLOSED';

export interface Lead {
  id: number;
  publicId: string;
  name: string;
  email?: string;
  phone?: string;
  serviceId?: number;
  serviceName?: string;
  businessType?: string;
  city?: string;
  message?: string;
  source?: string;
  status: LeadStatus;
  assignedTo?: number;
  assignedToName?: string;
  convertedClientId?: number;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  publicId: string;
  clientId: number;
  clientName?: string;
  consultantId: number;
  consultantName?: string;
  appointmentType: 'IN_PERSON' | 'PHONE' | 'VIDEO';
  status: AppointmentStatus;
  scheduledStart: string;
  scheduledEnd: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  publicId: string;
  paymentReference: string;
  clientId: number;
  clientName?: string;
  applicationId?: number;
  applicationNumber?: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paymentGateway: string;
  paymentMethod?: string;
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: any[];
  };
}
