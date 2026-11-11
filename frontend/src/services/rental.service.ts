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

export interface ReturnInspectionPreview {
  bookingId: number;
  bookingCode: string;
  carName: string;
  licensePlate: string;
  checkoutOdo: number;
  returnOdo: number;
  kmDriven: number;
  allowedKm: number;
  dailyLimit: number;
  excessKm: number;
  extraKmRate: number;
  excessKmFee: number;
  scheduledEndDate: string;
  actualReturnTime: string;
  lateHours: number;
  lateFee: number;
  checkoutFuel: number;
  returnFuelPercent: number;
  fuelShortagePercent: number;
  fuelShortageFee: number;
  isInteriorDirty: boolean;
  cleaningFee: number;
  newDamages: string;
  newDamagesFee: number;
  totalPenaltyFee: number;
  depositAmount: number;
  isDisputed: boolean;
  disputeReason: string;
}

export interface CreateReturnHandoverPayload {
  bookingId: number | string;
  returnOdo: number;
  returnFuelPercent: number;
  actualReturnTime?: string;
  isInteriorDirty?: boolean;
  newDamages?: string;
  newDamagesFee?: number;
  isDisputed?: boolean;
  disputeReason?: string;
  inspectionPhotos?: string[];
  staffName?: string;
  carCondition?: string;
}

export interface CreateSettlementPayload {
  bookingId: number | string;
  handoverId?: number;
  damageCompensation?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface SettlementItem {
  settlementId: number;
  settlementCode: string;
  bookingId: number;
  bookingCode: string;
  totalRentalAmount: number;
  totalPenalties: number;
  damageCompensation: number;
  totalPayable: number;
  depositAmount: number;
  refundAmount: number;
  additionalCharge: number;
  settlementStatus: string;
  paymentMethod: string;
  notes: string;
  settledAt: string;
  message?: string;
}

export interface VehicleMaintenanceAlert {
  vehicleId: number;
  carName: string;
  licensePlate: string;
  branchName: string;
  odometerKm: number;
  status: string;
  insuranceExpiryDate: string | null;
  daysToInsurance: number | null;
  insuranceStatus: 'CRITICAL' | 'WARNING' | 'OK';
  inspectionExpiryDate: string | null;
  daysToInspection: number | null;
  inspectionStatus: 'CRITICAL' | 'WARNING' | 'OK';
  lastMaintenanceKm: number | null;
  nextMaintenanceKm: number;
  kmRemaining: number;
  maintenanceStatus: 'CRITICAL' | 'WARNING' | 'OK';
  overallSeverity: 'CRITICAL' | 'WARNING' | 'OK';
}

export interface MaintenanceAlertsResponse {
  summary: {
    totalVehicles: number;
    criticalAlerts: number;
    warningAlerts: number;
    safeCount: number;
  };
  vehicles: VehicleMaintenanceAlert[];
}

export interface ExecutiveReportResponse {
  overview: {
    totalRevenue: number;
    completedRevenue: number;
    extraExtensionRevenue: number;
    penaltyRevenue: number;
    totalBookings: number;
    completedBookings: number;
    inRentalBookings: number;
    cancellationRate: number;
    fleetUtilizationRate: number;
  };
  fleetStatus: {
    totalFleet: number;
    rentedCars: number;
    inspectingCars: number;
    availableCars: number;
    maintenanceCars: number;
  };
  extensions: {
    totalRequests: number;
    approvedCount: number;
    rejectedCount: number;
    extraRevenue: number;
  };
  incidents: {
    totalIncidents: number;
    totalDamageCost: number;
    insuranceCovered: number;
    customerCompensation: number;
  };
  topRentedModels: Array<{
    modelName: string;
    brand: string;
    count: number;
    revenue: number;
  }>;
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
   * US-13, US-14, US-15: Lập biên bản bàn giao xe (CHECKOUT)
   */
  createHandover: async (data: Record<string, any>): Promise<ApiResponse<HandoverRecordItem>> => {
    const res = await apiClient.post<ApiResponse<HandoverRecordItem>>('/rental/handovers', data);
    return res.data;
  },

  /**
   * US-20, US-22: Xem trước tính toán đối chiếu và phí vi phạm khi trả xe
   */
  calculateReturnInspection: async (data: CreateReturnHandoverPayload): Promise<ApiResponse<ReturnInspectionPreview>> => {
    const res = await apiClient.post<ApiResponse<ReturnInspectionPreview>>('/rental/return/preview', data);
    return res.data;
  },

  /**
   * US-20, US-21, US-22, US-23, US-26: Lập biên bản hoàn trả xe (CHECKIN)
   */
  createReturnHandover: async (data: CreateReturnHandoverPayload): Promise<ApiResponse<HandoverRecordItem>> => {
    const res = await apiClient.post<ApiResponse<HandoverRecordItem>>('/rental/return', data);
    return res.data;
  },

  /**
   * US-24, US-25: Quyết toán hợp đồng thuê & cấn trừ cọc
   */
  createSettlement: async (data: CreateSettlementPayload): Promise<ApiResponse<SettlementItem>> => {
    const res = await apiClient.post<ApiResponse<SettlementItem>>('/rental/settlement', data);
    return res.data;
  },

  /**
   * Lấy quyết toán của một đơn đặt xe
   */
  getSettlementByBooking: async (bookingIdOrCode: string | number): Promise<ApiResponse<SettlementItem | null>> => {
    const res = await apiClient.get<ApiResponse<SettlementItem | null>>(`/rental/settlement/booking/${bookingIdOrCode}`);
    return res.data;
  },

  /**
   * US-26: Chuyển xe sang AVAILABLE sẵn sàng cho thuê
   */
  markVehicleReady: async (vehicleId: number | string): Promise<ApiResponse<{ vehicleId: number; licensePlate: string; status: string; message: string }>> => {
    const res = await apiClient.patch<ApiResponse<{ vehicleId: number; licensePlate: string; status: string; message: string }>>(`/rental/vehicle/${vehicleId}/ready`);
    return res.data;
  },

  /**
   * US-27: Lấy danh sách cảnh báo bảo dưỡng & bảo hiểm
   */
  getMaintenanceAlerts: async (): Promise<ApiResponse<MaintenanceAlertsResponse>> => {
    const res = await apiClient.get<ApiResponse<MaintenanceAlertsResponse>>('/rental/analytics/maintenance');
    return res.data;
  },

  /**
   * US-28: Lấy báo cáo thống kê quản trị toàn diện
   */
  getExecutiveReport: async (): Promise<ApiResponse<ExecutiveReportResponse>> => {
    const res = await apiClient.get<ApiResponse<ExecutiveReportResponse>>('/rental/analytics/executive-report');
    return res.data;
  },
};
