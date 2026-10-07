'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Car as CarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Printer,
  ChevronLeft,
  QrCode,
  FileText,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Headphones,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { carService } from '@/services/car.service';
import { bookingService } from '@/services/booking.service';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookingCode = resolvedParams.id;

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking detail state
  const [booking, setBooking] = useState<any>({
    code: bookingCode,
    status: 'PENDING',
    createdAt: new Date().toLocaleDateString('vi-VN'),
    customer: {
      fullName: 'Khách Hàng',
      phone: '',
      email: '',
      idNumber: '',
      licenseNumber: '',
    },
    pickup: {
      branchName: 'Chi Nhánh Sân Bay Tân Sơn Nhất',
      address: '45 Trường Sơn, Phường 2, Tân Bình, TP. Hồ Chí Minh',
      time: '',
    },
    returnLocation: {
      branchName: 'Chi Nhánh Sân Bay Tân Sơn Nhất',
      address: '45 Trường Sơn, Phường 2, Tân Bình, TP. Hồ Chí Minh',
      time: '',
    },
    totalDays: 1,
    dailyRate: 0,
    rentalSubtotal: 0,
    insurancePackageName: 'Gói Tiêu Chuẩn (Miễn Phí)',
    insuranceFee: 0,
    depositAmount: 0,
    depositPaid: 0,
    totalAmount: 0,
    paymentMethod: 'Chuyển Khoản Ngân Hàng (VietQR)',
  });

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getBookingByIdOrCode(bookingCode);
        if (res.data) {
          const b = res.data;
          setBooking({
            id: b.id,
            code: b.bookingCode,
            status: b.status,
            createdAt: b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : '',
            customer: {
              fullName: b.customerName,
              phone: b.phone,
              email: b.email,
              idNumber: b.idNumber || '---',
              licenseNumber: b.licenseNumber || '---',
            },
            pickup: {
              branchName: b.pickupBranch,
              address: '45 Trường Sơn, Phường 2, Tân Bình, TP. Hồ Chí Minh',
              time: b.startDate ? new Date(b.startDate).toLocaleString('vi-VN') : '',
            },
            returnLocation: {
              branchName: b.returnBranch,
              address: '45 Trường Sơn, Phường 2, Tân Bình, TP. Hồ Chí Minh',
              time: b.endDate ? new Date(b.endDate).toLocaleString('vi-VN') : '',
            },
            totalDays: b.totalDays,
            dailyRate: b.dailyPrice,
            rentalSubtotal: b.totalAmount,
            insurancePackageName: 'Gói Bảo Hiểm Toàn Diện 2 Chiều',
            insuranceFee: b.insuranceFee || 0,
            depositAmount: b.depositAmount,
            depositPaid: b.depositAmount,
            totalAmount: b.totalAmount,
            paymentMethod: b.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển Khoản Ngân Hàng (VietQR)' : 'Thanh Toán Tại Quầy',
          });

          if (b.carId) {
            const carRes = await carService.getCarById(String(b.carId));
            if (carRes.data) setCar(carRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingInfo();
  }, [bookingCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async () => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn đặt xe này?')) {
      try {
        if (booking.id) {
          await bookingService.updateBookingStatus(booking.id, 'CANCELLED', 'Khách hàng yêu cầu hủy đơn');
        }
        setBooking((prev: any) => ({ ...prev, status: 'CANCELLED' }));
        toast.info('Đã gửi yêu cầu hủy đơn thuê xe thành công');
      } catch (err: any) {
        toast.error('Lỗi khi hủy đơn');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Về Danh Sách Xe</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            In Phiếu Đặt Xe
          </Button>

          <Link href="/cars">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Thuê Thêm Xe
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Header Status Bar */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-md">
                MÃ ĐƠN: {booking.code}
              </span>
              <span className="text-xs text-slate-400">Tạo lúc: {booking.createdAt}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Chi Tiết Đơn Đặt Xe Tự Lái
            </h1>
          </div>

          <div>
            {booking.status === 'CONFIRMED' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Xác Nhận & Giữ Xe</span>
              </span>
            ) : booking.status === 'PENDING' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-gray-950 font-black text-sm shadow-md">
                <Clock className="w-4 h-4" />
                <span>Chờ Thanh Toán Cọc</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-sm">
                <span>Đã Hủy</span>
              </span>
            )}
          </div>
        </div>

        {/* Progression Steps */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <p className="text-xs font-bold text-slate-900">1. Tạo Đơn</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Đã hoàn thành</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <p className="text-xs font-bold text-slate-900">2. Cọc Giữ Chỗ</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Đã xác nhận cọc</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs opacity-80">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-gray-950 text-xs font-bold flex items-center justify-center mx-auto mb-1">
                3
              </span>
              <p className="text-xs font-bold text-slate-900">3. Bàn Giao Xe</p>
              <span className="text-[10px] text-amber-600 font-semibold">Ngày 15/10/2026</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs opacity-60">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center mx-auto mb-1">
                4
              </span>
              <p className="text-xs font-bold text-slate-900">4. Hoàn Tất Cọc</p>
              <span className="text-[10px] text-slate-400">Khi trả xe</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. Vehicle & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CarIcon className="w-4 h-4 text-amber-500" />
                <span>Phương Tiện Thuê</span>
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                  <CarIcon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {car?.name || 'VinFast VF 8 Plus (2024)'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Biển số: <strong className="text-slate-900">{car?.licensePlate || '51K-888.88'}</strong>
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded">
                    {car?.category || 'SUV Điện'} • {car?.seats || 5} chỗ • Tự động
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Lịch Trình Thuê ({booking.totalDays} Ngày)</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <strong className="text-slate-900 block">Nhận xe: {booking.pickup.time}</strong>
                    <span className="text-slate-500">{booking.pickup.branchName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5" />
                  <div>
                    <strong className="text-slate-900 block">Trả xe: {booking.returnLocation.time}</strong>
                    <span className="text-slate-500">{booking.returnLocation.branchName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Customer & Driver Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              <span>Thông Tin Người Thuê & Giấy Tờ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Họ và Tên:</span>
                <strong className="text-slate-900 text-sm font-bold">{booking.customer.fullName}</strong>
              </div>

              <div>
                <span className="text-slate-400 block">Số Điện Thoại / Email:</span>
                <span className="text-slate-800 font-semibold block">{booking.customer.phone}</span>
                <span className="text-slate-500">{booking.customer.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Số CCCD / GPLX:</span>
                <span className="text-slate-800 font-semibold block">{booking.customer.idNumber}</span>
                <span className="text-amber-700 font-bold">{booking.customer.licenseNumber} (Đã xác thực)</span>
              </div>
            </div>
          </div>

          {/* 3. Financial & Deposit Breakdown */}
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Bảng Kê Chi Phí & Tiền Cọc</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">
                Phương thức: {booking.paymentMethod}
              </span>
            </h3>

            <div className="divide-y divide-amber-200/60 text-xs space-y-2">
              <div className="flex justify-between pt-2">
                <span className="text-slate-700">Tiền thuê xe ({booking.totalDays} ngày × {formatCurrency(booking.dailyRate)}):</span>
                <strong className="text-slate-900">{formatCurrency(booking.rentalSubtotal)}</strong>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-700">Gói bảo hiểm:</span>
                <span className="font-semibold text-emerald-700">{booking.insurancePackageName}</span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-700">Tiền cọc thế chấp xe:</span>
                <div className="text-right">
                  <strong className="text-amber-900 block">{formatCurrency(booking.depositAmount)}</strong>
                  <span className="text-[10px] text-emerald-600 font-semibold">(Đã cọc - Hoàn lại 100% khi trả xe)</span>
                </div>
              </div>

              <div className="flex justify-between pt-3 text-sm font-black text-slate-900">
                <span>Tổng Tiền Thuê:</span>
                <span className="text-amber-600 text-lg">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* 4. Support Hotline & Cancel Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-slate-900 text-sm block">Cần Hỗ Trợ Giao Nhận Xe?</strong>
                <span>Hotline cứu hộ & hỗ trợ 24/7: <strong>0901 234 567</strong></span>
              </div>
            </div>

            {booking.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={handleCancelBooking}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
              >
                Yêu cầu hủy đơn thuê
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
