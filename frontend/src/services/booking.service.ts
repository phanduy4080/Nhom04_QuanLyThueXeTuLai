import { apiClient } from '@/lib/api/axios';

export interface CreateBookingPayload {
  vehicleId: number;
  startDate: string;
  endDate: string;
  customerName: string;
  phone: string;
  email: string;
  idNumber?: string;
  licenseNumber?: string;
  pickupBranchId?: number;
  returnBranchId?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  customerName: string;
  phone: string;
  email: string;
  idNumber?: string;
  licenseNumber?: string;
  carId: number;
  carName: string;
  licensePlate: string;
  thumbnail: string;
  images: string[];
  pickupBranch: string;
  returnBranch: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPrice: number;
  totalAmount: number;
  depositAmount: number;
  insuranceFee: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  approvedAt?: string | null;
  createdAt: string;
}

export const bookingService = {
  // Tạo đơn đặt xe mới
  createBooking: async (payload: CreateBookingPayload) => {
    const res = await apiClient.post('/bookings', payload);
    return res.data;
  },

  // Lấy danh sách đơn đặt xe (Admin / Staff)
  getBookings: async (params?: { status?: string; branchId?: number; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/bookings', { params });
    return res.data;
  },

  // Xem chi tiết 1 đơn đặt xe
  getBookingByIdOrCode: async (idOrCode: string | number) => {
    const res = await apiClient.get(`/bookings/${idOrCode}`);
    return res.data;
  },

  // Cập nhật trạng thái đơn (Duyệt cọc, Hủy, Hoàn tất)
  updateBookingStatus: async (id: number, status: string, notes?: string) => {
    const res = await apiClient.patch(`/bookings/${id}/status`, { status, notes });
    return res.data;
  },

  // KPI Dashboard thống kê
  getDashboardKpi: async () => {
    const res = await apiClient.get('/bookings/dashboard/kpi');
    return res.data;
  },

  // Đơn đặt của tôi
  getMyBookings: async (email?: string, phone?: string) => {
    const res = await apiClient.get('/bookings/my-bookings', { params: { email, phone } });
    return res.data;
  },
};
