// ==========================================
// User & Auth Types
// ==========================================
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  driverLicenseNo?: string;
  driverLicenseImage?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ==========================================
// Car & Fleet Types
// ==========================================
export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED';
export type TransmissionType = 'AUTOMATIC' | 'MANUAL';
export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PLUGIN_HYBRID' | 'LPG';

export interface Category {
  id: string;
  name: string; // VD: Sedan, SUV, MPV, Bán tải
  slug: string;
  description?: string;
}

export interface Car {
  id: string;
  name: string;
  slug: string;
  brand: string; // VinFast, Toyota, Mazda, Hyundai...
  modelYear: number;
  licensePlate: string;
  category: Category;
  categoryId: string;
  seats: number; // 4, 5, 7 chỗ
  transmission: TransmissionType;
  fuelType: FuelType;
  fuelConsumption?: string; // VD: 6.5L/100km hoặc 15kWh/100km
  pricePerDay: number;
  depositAmount: number;
  images: string[];
  thumbnail: string;
  features: string[]; // Camera 360, Cửa sổ trời, Cảm biến áp suất lốp, ETC...
  status: CarStatus;
  currentOdo: number;
  description?: string;
  location?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
}

export interface CarFilterParams {
  categoryId?: string;
  brand?: string;
  seats?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  minPrice?: number;
  maxPrice?: number;
  status?: CarStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
}

// ==========================================
// Booking & Rental Types
// ==========================================
export type BookingStatus =
  | 'PENDING'       // Đang chờ thanh toán cọc / chờ duyệt
  | 'CONFIRMED'     // Đã cọc, xe được giữ
  | 'PICKED_UP'     // Đã bàn giao xe cho khách (Đang thuê)
  | 'COMPLETED'     // Đã trả xe và quyết toán hợp đồng
  | 'CANCELLED';    // Hủy đặt xe

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  user?: User;
  carId: string;
  car?: Car;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalDays: number;
  rentalPrice: number;
  extraFees: number;
  depositAmount: number;
  depositPaid: number;
  totalAmount: number;
  status: BookingStatus;
  driverLicenseImage?: string;
  citizenIdImage?: string;
  note?: string;
  createdAt: string;
}

export interface HandoverRecord {
  id: string;
  bookingId: string;
  staffId: string;
  odoCheckIn: number;
  odoCheckOut?: number;
  fuelCheckIn: number; // % pin hoặc vạch xăng (1-8)
  fuelCheckOut?: number;
  checkInImages: string[];
  checkOutImages?: string[];
  checkInNotes?: string;
  checkOutNotes?: string;
  extraFee: number;
  completedAt?: string;
}

// ==========================================
// Fleet & Org Management Types
// ==========================================
export interface Brand {
  brandId: number;
  name: string;
  country?: string;
  isActive: boolean;
}

export interface VehicleCategory {
  categoryId: number;
  code: string;
  name: string;
  description?: string;
  requiredLicenseClasses?: string[];
  sortOrder?: number;
  isActive: boolean;
}

export interface VehicleModel {
  modelId: number;
  brandId: number;
  categoryId: number;
  name: string;
  variant: string;
  seats: number;
  doors?: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  engineCc?: number;
  powerHp?: number;
  fuelTankLiters?: number;
  batteryKwh?: number;
  evRangeKm?: number;
  trunkLiters?: number;
  fuelConsumptionL100km?: number;
  launchYear?: number;
  isActive: boolean;
  createdAt?: string;
  brand?: Brand;
  category?: VehicleCategory;
  _count?: {
    vehicles: number;
    pricePlans?: number;
  };
}

export interface BranchHour {
  branchId: number;
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
}

export interface Branch {
  branchId: number;
  code: string;
  name: string;
  addressLine: string;
  ward?: string;
  district?: string;
  province: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  isPickupPoint: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  branchHours?: BranchHour[];
  _count?: {
    vehicles: number;
    bookingsPickup?: number;
  };
}

// ==========================================
// API Response Wrapper
// ==========================================
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
