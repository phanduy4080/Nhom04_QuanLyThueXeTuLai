import { apiClient } from '@/lib/api/axios';

export type IncidentType =
  | 'BREAKDOWN'
  | 'ACCIDENT'
  | 'LOST_ACCESSORY'
  | 'THEFT'
  | 'TRAFFIC_VIOLATION'
  | 'OTHER';

export type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'INSURANCE_PROCESSING'
  | 'ASSESSMENT'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'CLOSED';

export type LiableParty = 'INSURER' | 'COMPANY' | 'CUSTOMER' | 'THIRD_PARTY';

export interface IncidentItem {
  incidentId: number;
  incidentCode: string;
  bookingId: number;
  bookingCode: string;
  customerName: string;
  vehicleId: number;
  carName: string;
  licensePlate: string;
  incidentType: IncidentType;
  status: IncidentStatus;
  title: string;
  description: string;
  location?: string;
  occurredAt: string;
  contactPhone?: string;
  evidencePhotos: string[];

  // Bảo hiểm (US-19)
  insuranceClaimNumber?: string;
  insurerName?: string;
  insuranceAppraiser?: string;
  insuranceContact?: string;
  insuranceStatus?: string;
  insuranceNotes?: string;

  // Phân định trách nhiệm & Chi phí (US-19)
  totalDamageCost: number;
  insuranceCoverageAmount: number;
  companyShareAmount: number;
  customerShareAmount: number;
  deductedFromDeposit: number;
  customerPaymentStatus: string;
  liabilityParty: LiableParty;
  liabilityNotes?: string;
  resolutionNotes?: string;

  reportedByName?: string;
  reportedByPhone?: string;
  reportedAt: string;
  assignedStaffName?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface CreateIncidentPayload {
  bookingIdOrCode: string | number;
  incidentType: IncidentType;
  title: string;
  description: string;
  location?: string;
  occurredAt?: string;
  contactPhone?: string;
  evidencePhotos?: string[];
}

export interface UpdateIncidentClaimPayload {
  status?: IncidentStatus;
  insuranceClaimNumber?: string;
  insurerName?: string;
  insuranceAppraiser?: string;
  insuranceContact?: string;
  insuranceStatus?: string;
  insuranceNotes?: string;
  totalDamageCost?: number;
  insuranceCoverageAmount?: number;
  companyShareAmount?: number;
  customerShareAmount?: number;
  deductedFromDeposit?: number;
  customerPaymentStatus?: string;
  liabilityParty?: LiableParty;
  liabilityNotes?: string;
  resolutionNotes?: string;
}

export const incidentService = {
  // US-18: Khách hàng gửi thông báo sự cố
  createIncident: async (payload: CreateIncidentPayload) => {
    const res = await apiClient.post('/incidents', payload);
    return res.data;
  },

  // US-19: Lấy danh sách hồ sơ sự cố (Admin/Staff)
  getIncidents: async (params?: {
    status?: string;
    incidentType?: string;
    search?: string;
    bookingId?: number;
  }) => {
    const res = await apiClient.get('/incidents', { params });
    return res.data;
  },

  // Xem chi tiết 1 hồ sơ sự cố
  getIncidentByIdOrCode: async (idOrCode: string | number) => {
    const res = await apiClient.get(`/incidents/${idOrCode}`);
    return res.data;
  },

  // Lấy các sự cố của 1 đơn đặt xe
  getIncidentsByBooking: async (bookingIdOrCode: string | number) => {
    const res = await apiClient.get(`/incidents/booking/${bookingIdOrCode}`);
    return res.data;
  },

  // US-19: Nhân viên cập nhật tiến độ bảo hiểm & phân định chi phí
  updateClaimAndLiability: async (
    idOrCode: string | number,
    payload: UpdateIncidentClaimPayload,
  ) => {
    const res = await apiClient.patch(`/incidents/${idOrCode}/claim`, payload);
    return res.data;
  },
};

