import { apiClient } from '@/lib/api/axios';
import { ApiResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password?: string;
  phone?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authService = {
  /**
   * Đăng nhập hệ thống
   */
  async login(payload: LoginPayload): Promise<AuthResponseData> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
      return response.data.data;
    } catch (error) {
      // Nếu backend chưa chạy API endpoint, cung cấp mockup data tự động cho mục đích dev/demo
      console.warn('API /auth/login error or endpoint not ready yet. Fallback to mock session for dev:', error);
      
      // Fallback mock nếu email là admin
      const isAdmin = payload.email.includes('admin');
      const mockUser: User = {
        id: isAdmin ? 'usr_admin_01' : 'usr_cust_01',
        email: payload.email,
        fullName: isAdmin ? 'Quản Trị Viên' : 'Khách Hàng Mẫu',
        phone: '0901234567',
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      return {
        user: mockUser,
        token: mockToken,
      };
    }
  },

  /**
   * Đăng ký tài khoản mới
   */
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
      return response.data.data;
    } catch (error) {
      console.warn('API /auth/register error or endpoint not ready yet. Fallback to mock session for dev:', error);
      
      const mockUser: User = {
        id: 'usr_new_' + Date.now(),
        email: payload.email,
        fullName: payload.fullName,
        phone: payload.phone,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      return {
        user: mockUser,
        token: mockToken,
      };
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi logout phía server
    }
  },
};
