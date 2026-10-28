import { apiClient } from '@/lib/api/axios';
import { ApiResponse, Car, CarFilterParams, VehicleModel, Branch, Brand, VehicleCategory } from '@/types';

export interface VehicleStatusUpdatePayload {
  status: string;
  reason?: string;
}

export const carService = {
  /**
   * US-04: Lấy danh sách xe với bộ lọc và phân trang
   */
  async getCars(params?: CarFilterParams): Promise<ApiResponse<Car[]>> {
    const response = await apiClient.get<ApiResponse<Car[]>>('/fleet/vehicles', { params });
    return response.data;
  },

  /**
   * US-06: Lấy chi tiết xe theo ID
   */
  async getCarById(id: string): Promise<ApiResponse<Car>> {
    const response = await apiClient.get<ApiResponse<Car>>(`/fleet/vehicles/${id}`);
    return response.data;
  },

  /**
   * US-05: Kiểm tra tính sẵn sàng của xe theo khoảng thời gian
   */
  async checkAvailability(id: string, startDate: string, endDate: string) {
    const response = await apiClient.get<ApiResponse<{ isAvailable: boolean; message: string }>>(
      `/fleet/vehicles/${id}/availability`,
      { params: { startDate, endDate } },
    );
    return response.data;
  },

  /**
   * US-01 (Admin/Staff): Tạo xe mới
   */
  async createCar(data: Record<string, unknown>): Promise<ApiResponse<Car>> {
    const response = await apiClient.post<ApiResponse<Car>>('/fleet/vehicles', data);
    return response.data;
  },

  /**
   * US-01 (Admin/Staff): Cập nhật thông tin xe
   */
  async updateCar(id: string, data: Record<string, unknown>): Promise<ApiResponse<Car>> {
    const response = await apiClient.put<ApiResponse<Car>>(`/fleet/vehicles/${id}`, data);
    return response.data;
  },

  /**
   * Admin/Staff: Xóa xe (Soft delete)
   */
  async deleteCar(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `/fleet/vehicles/${id}`,
    );
    return response.data;
  },

  /**
   * US-02 (Admin/Staff): Cập nhật trạng thái xe & lịch sử
   */
  async updateCarStatus(id: string, payload: VehicleStatusUpdatePayload): Promise<ApiResponse<Car>> {
    const response = await apiClient.patch<ApiResponse<Car>>(`/fleet/vehicles/${id}/status`, payload);
    return response.data;
  },

  /**
   * Lấy danh mục, hãng xe
   */
  async getCategories(): Promise<ApiResponse<VehicleCategory[]>> {
    const response = await apiClient.get<ApiResponse<VehicleCategory[]>>('/fleet/categories');
    return response.data;
  },

  async getBrands(): Promise<ApiResponse<Brand[]>> {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/fleet/brands');
    return response.data;
  },

  /**
   * ==========================================
   * QUẢN LÝ DÒNG XE (VEHICLE MODELS)
   * ==========================================
   */
  async getModels(params?: {
    brandId?: number;
    categoryId?: number;
    includeInactive?: boolean;
    search?: string;
  }): Promise<ApiResponse<VehicleModel[]>> {
    const response = await apiClient.get<ApiResponse<VehicleModel[]>>('/fleet/models', { params });
    return response.data;
  },

  async getModelById(id: number): Promise<ApiResponse<VehicleModel>> {
    const response = await apiClient.get<ApiResponse<VehicleModel>>(`/fleet/models/${id}`);
    return response.data;
  },

  async createModel(data: Record<string, unknown>): Promise<ApiResponse<VehicleModel>> {
    const response = await apiClient.post<ApiResponse<VehicleModel>>('/fleet/models', data);
    return response.data;
  },

  async updateModel(id: number, data: Record<string, unknown>): Promise<ApiResponse<VehicleModel>> {
    const response = await apiClient.put<ApiResponse<VehicleModel>>(`/fleet/models/${id}`, data);
    return response.data;
  },

  async deleteModel(id: number): Promise<ApiResponse<{ success: boolean; message: string; action: string }>> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean; message: string; action: string }>>(
      `/fleet/models/${id}`,
    );
    return response.data;
  },

  /**
   * ==========================================
   * QUẢN LÝ CHI NHÁNH & TRẠM XE (BRANCHES)
   * ==========================================
   */
  async getBranches(params?: {
    includeInactive?: boolean;
    search?: string;
    province?: string;
  }): Promise<ApiResponse<Branch[]>> {
    const response = await apiClient.get<ApiResponse<Branch[]>>('/org/branches', { params });
    return response.data;
  },

  async getBranchById(id: number): Promise<ApiResponse<Branch>> {
    const response = await apiClient.get<ApiResponse<Branch>>(`/org/branches/${id}`);
    return response.data;
  },

  async createBranch(data: Record<string, unknown>): Promise<ApiResponse<Branch>> {
    const response = await apiClient.post<ApiResponse<Branch>>('/org/branches', data);
    return response.data;
  },

  async updateBranch(id: number, data: Record<string, unknown>): Promise<ApiResponse<Branch>> {
    const response = await apiClient.put<ApiResponse<Branch>>(`/org/branches/${id}`, data);
    return response.data;
  },

  async deleteBranch(id: number): Promise<ApiResponse<{ success: boolean; message: string; action: string }>> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean; message: string; action: string }>>(
      `/org/branches/${id}`,
    );
    return response.data;
  },
};

