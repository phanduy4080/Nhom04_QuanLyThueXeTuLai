import { create } from 'zustand';
import { Car } from '@/types';

export interface BookingDraft {
  car: Car | null;
  startDate: string | null;
  endDate: string | null;
  pickupLocation: string;
  returnLocation: string;
  totalDays: number;
  totalPrice: number;
  depositAmount: number;
  // Thông tin người thuê
  fullName: string;
  phone: string;
  email: string;
  driverLicenseNo: string;
  driverLicenseImage?: string;
  citizenIdImage?: string;
  note?: string;
}

interface BookingStore {
  draft: BookingDraft;
  setCar: (car: Car) => void;
  setDates: (startDate: string, endDate: string, totalDays: number) => void;
  setLocations: (pickup: string, returnLoc: string) => void;
  setCustomerInfo: (info: Partial<BookingDraft>) => void;
  resetDraft: () => void;
}

const initialDraft: BookingDraft = {
  car: null,
  startDate: null,
  endDate: null,
  pickupLocation: 'Văn phòng chính (TP.HCM)',
  returnLocation: 'Văn phòng chính (TP.HCM)',
  totalDays: 1,
  totalPrice: 0,
  depositAmount: 0,
  fullName: '',
  phone: '',
  email: '',
  driverLicenseNo: '',
  note: '',
};

export const useBookingStore = create<BookingStore>((set) => ({
  draft: initialDraft,
  setCar: (car) =>
    set((state) => ({
      draft: {
        ...state.draft,
        car,
        depositAmount: car.depositAmount,
        totalPrice: car.pricePerDay * state.draft.totalDays,
      },
    })),
  setDates: (startDate, endDate, totalDays) =>
    set((state) => ({
      draft: {
        ...state.draft,
        startDate,
        endDate,
        totalDays,
        totalPrice: state.draft.car ? state.draft.car.pricePerDay * totalDays : 0,
      },
    })),
  setLocations: (pickupLocation, returnLocation) =>
    set((state) => ({
      draft: {
        ...state.draft,
        pickupLocation,
        returnLocation,
      },
    })),
  setCustomerInfo: (info) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...info,
      },
    })),
  resetDraft: () => set({ draft: initialDraft }),
}));
