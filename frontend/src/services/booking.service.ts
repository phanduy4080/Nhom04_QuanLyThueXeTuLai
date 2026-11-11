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
  // US-07: Định danh & GPLX người thuê chính
  driverDob?: string;
  licenseClass?: string;
  licenseExpiry?: string;
  idCardFront?: string;
  idCardBack?: string;
  licenseFront?: string;
  licenseBack?: string;
  // US-09: Người lái bổ sung
  hasAdditionalDriver?: boolean;
  additionalDriverName?: string;
  additionalDriverPhone?: string;
  additionalDriverEmail?: string;
  additionalDriverIdNumber?: string;
  additionalDriverDob?: string;
  additionalDriverLicenseNumber?: string;
  additionalDriverLicenseClass?: string;
  additionalDriverLicenseExpiry?: string;
  additionalDriverLicenseFront?: string;
  additionalDriverLicenseBack?: string;
  additionalDriverFee?: number;
  pickupBranchId?: number;
  returnBranchId?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface EligibilityResult {
  passed: boolean;
  suggestedStatus: 'APPROVED' | 'REQUIRES_REVIEW' | 'REJECTED';
  evaluatedAt: string;
  driverType: 'PRIMARY' | 'ADDITIONAL';
  score: number;
  checks: {
    age: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      age: number | null;
      message: string;
    };
    licenseExpiry: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      expiryDate: string | null;
      daysRemaining: number | null;
      message: string;
    };
    licenseClass: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      licenseClass: string;
      message: string;
    };
    blacklistAndHistory: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      isBlacklisted: boolean;
      completedRentals: number;
      message: string;
    };
    documents: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      hasIdFront: boolean;
      hasIdBack: boolean;
      hasLicenseFront: boolean;
      hasLicenseBack: boolean;
      message: string;
    };
  };
  summary: string;
  warnings: string[];
  errors: string[];
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  customerName: string;
  phone: string;
  email: string;
  idNumber?: string;
  licenseNumber?: string;
  driverDob?: string | null;
  licenseExpiry?: string | null;
  licenseClass?: string;
  idCardFront?: string | null;
  idCardBack?: string | null;
  licenseFront?: string | null;
  licenseBack?: string | null;
  identityVerified: boolean;
  verificationStatus: string;
  eligibilityResult?: EligibilityResult | null;
  hasAdditionalDriver: boolean;
  additionalDriverName?: string | null;
  additionalDriverPhone?: string | null;
  additionalDriverEmail?: string | null;
  additionalDriverIdNumber?: string | null;
  additionalDriverDob?: string | null;
  additionalDriverLicenseNumber?: string | null;
  additionalDriverLicenseClass?: string | null;
  additionalDriverLicenseExpiry?: string | null;
  additionalDriverLicenseFront?: string | null;
  additionalDriverLicenseBack?: string | null;
  additionalDriverEligibility?: EligibilityResult | null;
  additionalDriverFee: number;
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
  contractNumber?: string | null;
  contractCreatedAt?: string | null;
  contractSignedAt?: string | null;
  contractTerms?: any;
  depositPaidAt?: string | null;
  depositTransactionRef?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  extensions?: RentalExtensionItem[];
  hasActiveExtension?: boolean;
}

export interface RentalExtensionItem {
  extensionId: number;
  extensionCode: string;
  currentEndDate: string;
  newEndDate: string;
  extendedDays: number;
  dailyPrice: number;
  extraAmount: number;
  reason?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  systemDecision?: 'AUTO_APPROVED' | 'AUTO_REJECTED' | 'MANUAL_REVIEW' | null;
  systemNotes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ExtensionPreviewData {
  bookingId: number;
  bookingCode: string;
  carName: string;
  licensePlate: string;
  currentEndDate: string;
  newEndDate: string;
  currentTotalDays: number;
  extendedDays: number;
  newTotalDays: number;
  dailyPrice: number;
  extraAmount: number;
  currentTotalAmount: number;
  newTotalAmount: number;
  isAvailable: boolean;
  conflictReason: string | null;
  systemSuggestedDecision: 'AUTO_APPROVED' | 'AUTO_REJECTED';
  decisionNote: string;
}

export interface RequestExtensionPayload {
  newEndDate: string;
  reason?: string;
}

export const bookingService = {
  // Tạo đơn đặt xe mới
  createBooking: async (payload: CreateBookingPayload) => {
    const res = await apiClient.post('/bookings', payload);
    return res.data;
  },

  // US-08 & US-09: Pre-check kiểm tra điều kiện hồ sơ theo thời gian thực
  checkEligibility: async (payload: {
    startDate: string;
    endDate: string;
    primaryDriver: any;
    additionalDriver?: any;
  }) => {
    const res = await apiClient.post('/bookings/check-eligibility', payload);
    return res.data;
  },

  // US-07 & US-08: Khách hàng nộp hoặc cập nhật giấy tờ định danh & GPLX
  verifyDocuments: async (idOrCode: string | number, payload: any) => {
    const res = await apiClient.post(`/bookings/${idOrCode}/verify-documents`, payload);
    return res.data;
  },

  // US-08: Admin xét duyệt hồ sơ
  reviewVerification: async (id: number, payload: {
    verificationStatus: 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW';
    rejectionReason?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post(`/bookings/${id}/review-verification`, payload);
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

  // US-10: Nhân viên duyệt yêu cầu thuê xe của khách hàng
  approveBooking: async (id: number, notes?: string) => {
    const res = await apiClient.post(`/bookings/${id}/approve`, { notes });
    return res.data;
  },

  // US-10: Nhân viên từ chối yêu cầu thuê xe của khách hàng kèm lý do
  rejectBooking: async (id: number, reason: string, notes?: string) => {
    const res = await apiClient.post(`/bookings/${id}/reject`, { reason, notes });
    return res.data;
  },

  // US-11: Khách hàng thanh toán tiền cọc/tạm ứng để xác nhận giữ xe
  payDeposit: async (idOrCode: string | number, payload: {
    paymentMethod: string;
    transactionRef?: string;
    amount?: number;
    notes?: string;
  }) => {
    const res = await apiClient.post(`/bookings/${idOrCode}/pay-deposit`, payload);
    return res.data;
  },

  // US-11: Lấy thông tin thanh toán tiền cọc (VietQR ngân hàng, nội dung chuyển khoản)
  getDepositInfo: async (idOrCode: string | number) => {
    const res = await apiClient.get(`/bookings/${idOrCode}/deposit-info`);
    return res.data;
  },

  // US-12: Xem chi tiết Hợp đồng thuê xe điện tử
  getRentalContract: async (idOrCode: string | number) => {
    const res = await apiClient.get(`/bookings/${idOrCode}/contract`);
    return res.data;
  },

  // US-12: Khởi tạo lại Hợp đồng thuê xe điện tử
  generateRentalContract: async (idOrCode: string | number) => {
    const res = await apiClient.post(`/bookings/${idOrCode}/generate-contract`);
    return res.data;
  },

  // US-16 & US-17: Khách hàng xem trước chi phí & kiểm tra tự động trước khi xin gia hạn
  previewExtension: async (idOrCode: string | number, payload: RequestExtensionPayload) => {
    const res = await apiClient.post(`/bookings/${idOrCode}/extend/preview`, payload);
    return res.data;
  },

  // US-16 & US-17: Gửi yêu cầu gia hạn thời gian thuê và tự động xét duyệt
  requestExtension: async (idOrCode: string | number, payload: RequestExtensionPayload) => {
    const res = await apiClient.post(`/bookings/${idOrCode}/extend`, payload);
    return res.data;
  },

  // US-16: Lấy lịch sử các lần gia hạn của đơn thuê xe
  getExtensions: async (idOrCode: string | number) => {
    const res = await apiClient.get(`/bookings/${idOrCode}/extensions`);
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
