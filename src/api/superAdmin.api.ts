import { apiClient } from './client';
import {
  ApiResponse,
  ServiceCategory,
  AdminService,
  PriceHistoryEntry,
  WebsiteContentItem,
  SuperAdminSummary,
  User,
  RoleName,
  RegionType,
  CategoryRegionType,
} from '../types';

export const superAdminApi = {
  // ==========================================================================
  // DASHBOARD KPI SUMMARY
  // ==========================================================================
  async getSummary(): Promise<ApiResponse<SuperAdminSummary>> {
    const response = await apiClient.get<ApiResponse<SuperAdminSummary>>('/audit-logs/super-admin-summary');
    return response.data;
  },

  // ==========================================================================
  // CATEGORIES MANAGEMENT
  // ==========================================================================
  async getCategories(all: boolean = true, region?: string): Promise<ApiResponse<ServiceCategory[]>> {
    const response = await apiClient.get<ApiResponse<ServiceCategory[]>>('/services/categories', {
      params: { all: all ? 'true' : 'false', region },
    });
    return response.data;
  },

  async createCategory(data: {
    name: string;
    slug: string;
    region?: CategoryRegionType;
    description?: string;
    icon?: string;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<ServiceCategory>> {
    const response = await apiClient.post<ApiResponse<ServiceCategory>>('/services/categories', data);
    return response.data;
  },

  async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      region?: CategoryRegionType;
      description?: string;
      icon?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<ServiceCategory>> {
    const response = await apiClient.put<ApiResponse<ServiceCategory>>(`/services/categories/${id}`, data);
    return response.data;
  },

  async toggleCategoryStatus(id: number, isActive: boolean): Promise<ApiResponse<ServiceCategory>> {
    const response = await apiClient.patch<ApiResponse<ServiceCategory>>(`/services/categories/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  async deleteCategory(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/services/categories/${id}`);
    return response.data;
  },

  // ==========================================================================
  // SERVICES & PRICING MANAGEMENT
  // ==========================================================================
  async getServices(params?: {
    categoryId?: number;
    categorySlug?: string;
    region?: string;
    search?: string;
    featured?: boolean;
    all?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminService[]>> {
    const response = await apiClient.get<ApiResponse<AdminService[]>>('/services', {
      params: {
        categoryId: params?.categoryId,
        categorySlug: params?.categorySlug,
        region: params?.region,
        search: params?.search,
        featured: params?.featured,
        all: params?.all !== false ? 'true' : 'false',
        page: params?.page,
        limit: params?.limit,
      },
    });
    return response.data;
  },

  async getServiceById(id: number): Promise<ApiResponse<AdminService>> {
    const response = await apiClient.get<ApiResponse<AdminService>>(`/services/${id}`);
    return response.data;
  },

  async createService(data: {
    categoryId: number;
    name: string;
    slug: string;
    region?: RegionType;
    icon?: string;
    shortDescription?: string;
    description?: string;
    features?: any;
    overview?: string;
    eligibility?: string;
    documentsRequiredDescription?: string;
    requiredDocuments?: any;
    deliverables?: any;
    processSteps?: any;
    processingTime?: string;
    turnaround?: string;
    basePrice?: number;
    discountPrice?: number;
    promoPrice?: number;
    pricingNotes?: string;
    exclusions?: any;
    relatedServiceIds?: number[];
    seoTitle?: string;
    metaDescription?: string;
    h1Heading?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    currency?: string;
    billingPeriod?: string;
    pricingMode?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
  }): Promise<ApiResponse<AdminService>> {
    const response = await apiClient.post<ApiResponse<AdminService>>('/services', data);
    return response.data;
  },

  async updateService(
    id: number,
    data: {
      categoryId?: number;
      name?: string;
      slug?: string;
      region?: RegionType;
      icon?: string;
      shortDescription?: string;
      description?: string;
      features?: any;
      overview?: string;
      eligibility?: string;
      documentsRequiredDescription?: string;
      requiredDocuments?: any;
      deliverables?: any;
      processSteps?: any;
      processingTime?: string;
      turnaround?: string;
      basePrice?: number;
      discountPrice?: number;
      promoPrice?: number;
      pricingNotes?: string;
      exclusions?: any;
      relatedServiceIds?: number[];
      seoTitle?: string;
      metaDescription?: string;
      h1Heading?: string;
      primaryCtaText?: string;
      primaryCtaLink?: string;
      currency?: string;
      billingPeriod?: string;
      pricingMode?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
    }
  ): Promise<ApiResponse<AdminService>> {
    const response = await apiClient.put<ApiResponse<AdminService>>(`/services/${id}`, data);
    return response.data;
  },

  async toggleServiceStatus(id: number, isActive: boolean): Promise<ApiResponse<AdminService>> {
    const response = await apiClient.patch<ApiResponse<AdminService>>(`/services/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  async updatePricing(
    id: number,
    data: {
      basePrice: number;
      discountPrice?: number | null;
      promoPrice?: number | null;
      currency?: string;
      reason?: string;
    }
  ): Promise<ApiResponse<AdminService>> {
    const response = await apiClient.patch<ApiResponse<AdminService>>(`/services/${id}/pricing`, data);
    return response.data;
  },

  async getPriceHistory(serviceId: number): Promise<ApiResponse<PriceHistoryEntry[]>> {
    const response = await apiClient.get<ApiResponse<PriceHistoryEntry[]>>(`/services/${serviceId}/price-history`);
    return response.data;
  },

  async deleteService(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/services/${id}`);
    return response.data;
  },

  // ==========================================================================
  // WEBSITE CONTENT (CMS)
  // ==========================================================================
  async getAllCmsContent(): Promise<ApiResponse<{ items: WebsiteContentItem[]; grouped: Record<string, Record<string, any>> }>> {
    const response = await apiClient.get<ApiResponse<{ items: WebsiteContentItem[]; grouped: Record<string, Record<string, any>> }>>('/cms/content/all');
    return response.data;
  },

  async updateCmsContent(
    items: Array<{
      sectionKey: string;
      contentKey: string;
      contentValue: string | null;
      contentType?: string;
      displayOrder?: number;
      isPublished?: boolean;
    }>
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>('/cms/content', { items });
    return response.data;
  },

  // ==========================================================================
  // USER & STAFF MANAGEMENT
  // ==========================================================================
  async createStaffUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    roles: RoleName[];
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  async updateUserRolesAndStatus(
    publicId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      roles?: RoleName[];
    }
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${publicId}`, data);
    return response.data;
  },
};
