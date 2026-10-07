import { apiClient } from '@/lib/api/axios';
import { ApiResponse } from '@/types';

export interface CalculatePricePayload {
  vehicleId: string;
  startDate: string;
  endDate: string;
  insurancePackageId?: number;
  extraIds?: number[];
  promoCode?: string;
}

export interface PriceCalculationResult {
  vehicleId: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricingBreakdown: {
    dailyRate: number;
    rentalSubtotal: number;
    insuranceFee: number;
    extrasFee: number;
    discountAmount: number;
    totalRentalAmount: number;
    depositAmount: number;
    totalPayableAtPickup: number;
  };
  selectedInsurance: {
    id: number;
    name: string;
    pricePerDay: number;
    totalFee: number;
    customerDeductible: number;
    coverageText: string;
  } | null;
  selectedExtras: Array<{
    id: number;
    name: string;
    price: number;
    totalFee: number;
  }>;
  transparencyPolicy: {
    policyName: string;
    minDriverAge: number;
    minLicenseYears: number;
    lateFeeNotice: string;
    fuelNotice: string;
    cleaningFeeNotice: string;
    cancellationPolicy: Array<{
      condition: string;
      feePercent: string;
      description: string;
    }>;
  } | null;
}

export const pricingService = {
  /**
   * US-06: Tính toán chi tiết báo giá và chính sách minh bạch
   */
  async calculatePrice(payload: CalculatePricePayload): Promise<ApiResponse<PriceCalculationResult>> {
    const response = await apiClient.post<ApiResponse<PriceCalculationResult>>('/pricing/calculate', payload);
    return response.data;
  },

  /**
   * US-03: Lấy danh sách bảng giá
   */
  async getPricePlans() {
    const response = await apiClient.get('/pricing/plans');
    return response.data;
  },

  /**
   * US-03: Tạo bảng giá theo bậc
   */
  async createPricePlan(data: Record<string, unknown>) {
    const response = await apiClient.post('/pricing/plans', data);
    return response.data;
  },

  /**
   * Lấy danh sách chính sách thuê
   */
  async getPolicies() {
    const response = await apiClient.get('/pricing/policies');
    return response.data;
  },

  /**
   * Lấy gói bảo hiểm & dịch vụ gia tăng
   */
  async getInsurancePackages() {
    const response = await apiClient.get('/pricing/insurance-packages');
    return response.data;
  },

  async getExtras() {
    const response = await apiClient.get('/pricing/extras');
    return response.data;
  },
};
