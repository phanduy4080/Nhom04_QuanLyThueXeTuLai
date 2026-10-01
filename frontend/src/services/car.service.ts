import { apiClient } from '@/lib/api/axios';
import { ApiResponse, Car, CarFilterParams } from '@/types';

export const carService = {
  /**
   * Lấy danh sách xe với bộ lọc và phân trang
   */
  async getCars(params?: CarFilterParams): Promise<ApiResponse<Car[]>> {
    const response = await apiClient.get<ApiResponse<Car[]>>('/cars', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết xe theo slug hoặc id
   */
  async getCarBySlug(slug: string): Promise<ApiResponse<Car>> {
    const response = await apiClient.get<ApiResponse<Car>>(`/cars/${slug}`);
    return response.data;
  },

  /**
   * Lấy danh sách xe nổi bật trang chủ
   */
  async getFeaturedCars(): Promise<ApiResponse<Car[]>> {
    const response = await apiClient.get<ApiResponse<Car[]>>('/cars/featured');
    return response.data;
  },

  /**
   * Admin: Tạo xe mới
   */
  async createCar(data: Partial<Car>): Promise<ApiResponse<Car>> {
    const response = await apiClient.post<ApiResponse<Car>>('/cars', data);
    return response.data;
  },

  /**
   * Admin: Cập nhật thông tin xe
   */
  async updateCar(id: string, data: Partial<Car>): Promise<ApiResponse<Car>> {
    const response = await apiClient.patch<ApiResponse<Car>>(`/cars/${id}`, data);
    return response.data;
  },

  /**
   * Admin: Xóa xe
   */
  async deleteCar(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/cars/${id}`);
    return response.data;
  },
};
