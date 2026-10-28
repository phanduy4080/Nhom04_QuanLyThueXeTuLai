import { apiClient } from '@/lib/api/axios';
import { ApiResponse } from '@/types';

export interface HandoverRecordItem {
  id: number;
  handoverCode: string;
  bookingId: number;
  bookingCode: string;
  contractNumber: string;
  customerName: string;
  customerPhone: string;
  customerIdNumber: string;
  customerLicenseNumber: string;
  hasAdditionalDriver: boolean;
  additionalDriverName?: string | null;
  additionalDriverPhone?: string | null;
  additionalDriverIdNumber?: string | null;
  additionalDriverLicenseNumber?: string | null;
  vehicleId: string;
  carName: string;
  brand: string;
  model: string;
  licensePlate: string;
  color: string;
  seats: number;
  type: 'CHECKOUT' | 'CHECKIN';
  odoMeter: number;
  fuelLevel: string;
  status: string;
  signedAt: string;
  createdAt: string;
  pickupBranch: string;
  returnBranch: string;
  rentalPeriod: {
    startDate: string | null;
    endDate: string | null;
    totalDays: number;
  };
  conditionSummary: string;
  checklist: {
    exterior: Record<string, boolean>;
    interior: Record<string, boolean>;
    accessories: Record<string, boolean>;
  };
  damages: Array<{
    position: string;
    description: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  photos: string[];
  signatures: {
    staffSignature?: string;
    customerSignature?: string;
  };
  staffName: string;
  notes: string;
}

export const rentalService = {
  /**
   * Lấy danh sách biên bản bàn giao
   */
  getHandovers: async (params?: { type?: string; status?: string; search?: string; bookingCode?: string }): Promise<ApiResponse<HandoverRecordItem[]>> => {
    const res = await apiClient.get<ApiResponse<HandoverRecordItem[]>>('/rental/handovers', { params });
    return res.data;
  },

  /**
   * Lấy chi tiết một biên bản bàn giao theo ID hoặc Mã biên bản
   */
  getHandoverById: async (idOrCode: string | number): Promise<ApiResponse<HandoverRecordItem>> => {
    const res = await apiClient.get<ApiResponse<HandoverRecordItem>>(`/rental/handovers/${idOrCode}`);
    return res.data;
  },

  /**
   * Lấy biên bản bàn giao gắn với một đơn đặt xe
   */
  getHandoverByBooking: async (bookingIdOrCode: string | number): Promise<ApiResponse<HandoverRecordItem | null>> => {
    const res = await apiClient.get<ApiResponse<HandoverRecordItem | null>>(`/rental/handovers/booking/${bookingIdOrCode}`);
    return res.data;
  },

  /**
   * US-13, US-14, US-15: Lập biên bản bàn giao xe
   */
  createHandover: async (data: Record<string, any>): Promise<ApiResponse<HandoverRecordItem>> => {
    const res = await apiClient.post<ApiResponse<HandoverRecordItem>>('/rental/handovers', data);
    return res.data;
  },
};
