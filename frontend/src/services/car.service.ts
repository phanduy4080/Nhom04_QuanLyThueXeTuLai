import { apiClient } from '@/lib/api/axios';
import { ApiResponse, Car, CarFilterParams } from '@/types';

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
   * US-02 (Admin/Staff): Cập nhật trạng thái xe & lịch sử
   */
  async updateCarStatus(id: string, payload: VehicleStatusUpdatePayload): Promise<ApiResponse<Car>> {
    const response = await apiClient.patch<ApiResponse<Car>>(`/fleet/vehicles/${id}/status`, payload);
    return response.data;
  },

  /**
   * Lấy danh mục, hãng và dòng xe
   */
  async getCategories() {
    const response = await apiClient.get('/fleet/categories');
    return response.data;
  },

  async getBrands() {
    const response = await apiClient.get('/fleet/brands');
    return response.data;
  },

  async getModels(brandId?: number, categoryId?: number) {
    const response = await apiClient.get('/fleet/models', { params: { brandId, categoryId } });
    return response.data;
  },

  async getBranches() {
    const response = await apiClient.get('/org/branches');
    return response.data;
  },
};
