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
  applicationTitle?: string;
  clientEmail?: string;
  clientPhone?: string;
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

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminService {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  icon?: string | null;
  short_description: string | null;
  description: string | null;
  features?: any;
  eligibility?: string | null;
  documents_required_description?: string | null;
  processing_time?: string | null;
  base_price: string | number | null;
  discount_price?: string | number | null;
  currency: string;
  is_active: boolean;
  is_featured?: boolean;
  display_order: number;
  category_name?: string;
  category_slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PriceHistoryEntry {
  id: number;
  service_id: number;
  previous_base_price: string | null;
  new_base_price: string;
  previous_discount_price: string | null;
  new_discount_price: string | null;
  currency: string;
  changed_by: number | null;
  reason: string | null;
  created_at: string;
  changed_by_name?: string | null;
}

export interface WebsiteContentItem {
  id: number;
  section_key: string;
  content_key: string;
  content_value: string | null;
  content_type: 'TEXT' | 'HTML' | 'JSON' | 'IMAGE_URL' | 'BOOLEAN';
  display_order: number;
  is_published: boolean;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SuperAdminSummary {
  totalUsers: number;
  totalClients: number;
  totalApplications: number;
  totalServices: number;
  activeServices: number;
  totalCategories: number;
  activeCategories: number;
  recentPriceChanges: Array<PriceHistoryEntry & { service_name?: string }>;
  recentLogs: AuditLog[];
}
