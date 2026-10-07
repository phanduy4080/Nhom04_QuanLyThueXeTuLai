'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car as CarIcon,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  QrCode,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { carService } from '@/services/car.service';
import { pricingService, PriceCalculationResult } from '@/services/pricing.service';
import { bookingService } from '@/services/booking.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const carId = searchParams.get('carId') || '1';
  const startDateParam = searchParams.get('start') || '2026-10-15T08:00';
  const endDateParam = searchParams.get('end') || '2026-10-18T20:00';
  const insParam = searchParams.get('ins') ? Number(searchParams.get('ins')) : 1;

  const [car, setCar] = useState<any>(null);
  const [quote, setQuote] = useState<PriceCalculationResult | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form customer info
  const [fullName, setFullName] = useState(user?.fullName || 'Nguyễn Văn Khách Hàng');
  const [phone, setPhone] = useState(user?.phone || '0901234567');
  const [email, setEmail] = useState(user?.email || 'khachhang@quickhatch.vn');
  const [idNumber, setIdNumber] = useState('079090001234');
  const [licenseNumber, setLicenseNumber] = useState('GPLX-B2-888999');
  const [pickupBranchId, setPickupBranchId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'VNPAY' | 'CASH'>('BANK_TRANSFER');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const [carRes, branchesRes, quoteRes] = await Promise.all([
          carService.getCarById(carId),
          carService.getBranches(),
          pricingService.calculatePrice({
            vehicleId: carId,
            startDate: new Date(startDateParam).toISOString(),
            endDate: new Date(endDateParam).toISOString(),
            insurancePackageId: insParam,
          }),
        ]);

        if (carRes.data) {
          setCar(carRes.data);
          const carObj = carRes.data as any;
          if (carObj.currentBranchId) {
            setPickupBranchId(carObj.currentBranchId);
          } else if (carObj.branchId) {
            setPickupBranchId(carObj.branchId);
          }
        }
        if (branchesRes.data) setBranches(branchesRes.data);
        if (quoteRes.data) setQuote(quoteRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [carId, startDateParam, endDateParam, insParam]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error('Vui lòng điền đầy đủ họ tên và số điện thoại');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingService.createBooking({
        vehicleId: Number(carId),
        startDate: new Date(startDateParam).toISOString(),
        endDate: new Date(endDateParam).toISOString(),
        customerName: fullName,
        phone,
        email,
        idNumber,
        licenseNumber,
        pickupBranchId: Number(pickupBranchId),
        returnBranchId: Number(pickupBranchId),
        paymentMethod,
        notes: note,
      });

      const newBooking = res.data;
      toast.success('Đặt xe thành công! Đang chuyển đến chi tiết đơn hàng...');
      router.push(`/booking/${newBooking.bookingCode}?carId=${carId}&start=${startDateParam}&end=${endDateParam}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt xe');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang khởi tạo thủ tục đặt xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/cars/${carId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay Lại Báo Giá Xe</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đã giữ xe trong 30 phút</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer Details & Pickup Options */}
        <form onSubmit={handleSubmitBooking} className="lg:col-span-7 space-y-6">
          {/* Thông tin người thuê */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">
                1. Thông Tin Người Lái & Người Thuê Xe
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và Tên (Theo CCCD)"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Số Điện Thoại Nhận Xe"
                type="tel"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                label="Địa Chỉ Email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Số CCCD / Hộ Chiếu"
                placeholder="07909000xxxx"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />

              <div className="sm:col-span-2">
                <Input
                  label="Số Giấy Phép Lái Xe (GPLX)"
                  placeholder="GPLX-B2-xxxxxx"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  helperText="Quý khách vui lòng mang theo GPLX gốc khi nhận xe để nhân viên đối chiếu."
                  required
                />
              </div>
            </div>
          </div>

          {/* Địa điểm & Thời gian bàn giao */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">
                2. Điểm Nhận Xe & Ghi Chú
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Chọn Chi Nhánh Nhận & Trả Xe
                </label>
                <select
                  value={pickupBranchId}
                  onChange={(e) => setPickupBranchId(Number(e.target.value))}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  {branches.map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.name} ({b.addressLine}, {b.province})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Ghi Chú Yêu Cầu Riêng (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Vd: Cần giao xe trước 15 phút, cần chuẩn bị sẵn ghế trẻ em..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán cọc */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">
                3. Phương Thức Thanh Toán Cọc Giữ Xe
              </h2>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                  className="accent-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-slate-900">
                      Chuyển Khoản Ngân Hàng Qua Mã VietQR (Khuyên Dùng)
                    </strong>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                      Tự động xác nhận 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Quét mã QR qua mọi ứng dụng ngân hàng và ví điện tử, hệ thống kích hoạt đơn tức thì.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'VNPAY'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={() => setPaymentMethod('VNPAY')}
                  className="accent-amber-500"
                />
                <div>
                  <strong className="text-sm font-bold text-slate-900">
                    Cổng Thanh Toán VNPAY / Thẻ ATM / Visa / Mastercard
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ thẻ nội địa và thẻ quốc tế bảo mật 3D-Secure.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
            className="w-full h-14 text-base font-black shadow-xl shadow-amber-500/25"
          >
            Xác Nhận & Tạo Đơn Thuê Xe
          </Button>
        </form>

        {/* Right Summary: Car Summary & Financial Breakdown */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Tóm Tắt Đơn Thuê Xe
            </h3>

            {/* Car Brief */}
            {car && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <CarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{car.name}</h4>
                  <span className="text-xs text-slate-500 font-mono">Biển số: {car.licensePlate}</span>
                </div>
              </div>
            )}

            {/* Time Breakdown */}
            <div className="space-y-2 text-xs py-2 border-y border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Nhận xe:</span>
                <span className="font-bold text-slate-900">{startDateParam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trả xe:</span>
                <span className="font-bold text-slate-900">{endDateParam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng thời lượng:</span>
                <span className="font-bold text-amber-700">{quote?.totalDays || 3} Ngày</span>
              </div>
            </div>

            {/* Financial summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền thuê xe ({quote?.totalDays || 3} ngày):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(quote?.pricingBreakdown.rentalSubtotal || 0)}
                </span>
              </div>

              {quote?.selectedInsurance && (
                <div className="flex justify-between text-slate-600">
                  <span>Bảo hiểm ({quote.selectedInsurance.name}):</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(quote.selectedInsurance.totalFee)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tiền cọc thế chấp (hoàn lại khi trả xe):</span>
                <span className="font-bold text-amber-700">
                  {formatCurrency(quote?.pricingBreakdown.depositAmount || car?.depositAmount || 0)}
                </span>
              </div>

              <div className="flex justify-between py-3 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Tổng Tiền Thuê:</span>
                <span className="text-amber-600 text-lg">
                  {formatCurrency(quote?.pricingBreakdown.totalRentalAmount || 0)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý:</strong> Tiền cọc thế chấp xe sẽ được hoàn trả đầy đủ 100% vào tài khoản của Quý khách ngay khi kết thúc hành trình và bàn giao lại xe.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Đang tải form đặt xe...</div>}>
      <BookingContent />
    </Suspense>
  );
}
