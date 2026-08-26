import { apiClient } from './client';
import { User, ApiResponse } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; expiresIn: number }>>(
      '/auth/login',
      credentials
    );
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<
      ApiResponse<{
        challengeId?: string;
        destinationMasked?: string;
        message: string;
      }>
    >('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: {
    challengeId: string;
    otp: string;
    newPassword: string;
  }) => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },
};
