'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Info,
  Upload,
  UserPlus,
  ShieldCheck,
  XCircle,
  Eye,
  Trash2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { carService } from '@/services/car.service';
import { pricingService, PriceCalculationResult } from '@/services/pricing.service';
import { bookingService } from '@/services/booking.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Helper component upload & preview ảnh giấy tờ
function DocumentUploader({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      toast.success(`Đã tải lên ${label}`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {value ? (
          <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã tải lên
          </span>
        ) : (
          <span className="text-slate-400 font-medium">Chưa có ảnh</span>
        )}
      </div>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-emerald-200 bg-slate-50 h-28 flex items-center justify-center">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 rounded-xl cursor-pointer transition-colors px-3 py-2 text-center group">
          <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-500 mb-1 transition-colors" />
          <span className="text-xs font-bold text-slate-600 group-hover:text-amber-800">
            Chọn ảnh từ máy
          </span>
          <span className="text-[10px] text-slate-400">JPG, PNG (Tối đa 5MB)</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const carId = searchParams.get('carId') || '1';
  const startDateParam = searchParams.get('start') || '2026-10-15T08:00';
  const endDateParam = searchParams.get('end') || '2026-10-18T20:00';
  const insParam = searchParams.get('ins') ? Number(searchParams.get('ins')) : 1;

  const [car, setCar] = useState<any>(null);
  const [quote, setQuote] = useState<PriceCalculationResult | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // US-07: Thông tin người thuê chính & Hồ sơ định danh
  const [fullName, setFullName] = useState(user?.fullName || 'Nguyễn Văn An');
  const [phone, setPhone] = useState(user?.phone || '0901234567');
  const [email, setEmail] = useState(user?.email || 'nguyenvanan@gmail.com');
  const [idNumber, setIdNumber] = useState('079095012345');
  const [driverDob, setDriverDob] = useState('1998-05-15');
  const [licenseNumber, setLicenseNumber] = useState('GPLX-79888999');
  const [licenseClass, setLicenseClass] = useState('B2');
  const [licenseExpiry, setLicenseExpiry] = useState('2032-12-31');

  // Ảnh giấy tờ người thuê chính (US-07)
  const [idCardFront, setIdCardFront] = useState('');
  const [idCardBack, setIdCardBack] = useState('');
  const [licenseFront, setLicenseFront] = useState('');
  const [licenseBack, setLicenseBack] = useState('');

  // US-09: Đăng ký thêm người lái bổ sung
  const [hasAdditionalDriver, setHasAdditionalDriver] = useState(false);
  const [additionalDriverName, setAdditionalDriverName] = useState('Trần Thị Bình');
  const [additionalDriverPhone, setAdditionalDriverPhone] = useState('0912345678');
  const [additionalDriverEmail, setAdditionalDriverEmail] = useState('tranbinh@gmail.com');
  const [additionalDriverIdNumber, setAdditionalDriverIdNumber] = useState('079196098765');
  const [additionalDriverDob, setAdditionalDriverDob] = useState('1996-08-20');
  const [additionalDriverLicenseNumber, setAdditionalDriverLicenseNumber] = useState('GPLX-88776655');
  const [additionalDriverLicenseClass, setAdditionalDriverLicenseClass] = useState('B2');
  const [additionalDriverLicenseExpiry, setAdditionalDriverLicenseExpiry] = useState('2030-10-25');
  const [additionalDriverLicenseFront, setAdditionalDriverLicenseFront] = useState('');
  const [additionalDriverLicenseBack, setAdditionalDriverLicenseBack] = useState('');

  const [pickupBranchId, setPickupBranchId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'VNPAY' | 'CASH'>('BANK_TRANSFER');
  const [note, setNote] = useState('');

  // Kết quả đối chiếu điều kiện tự động (US-08)
  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

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

  // US-08 & US-09: Tự động chạy đối chiếu điều kiện theo thời gian thực
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setEligibilityChecking(true);
        const res = await bookingService.checkEligibility({
          startDate: new Date(startDateParam).toISOString(),
          endDate: new Date(endDateParam).toISOString(),
          primaryDriver: {
            name: fullName,
            phone,
            email,
            idNumber,
            dob: driverDob,
            licenseNumber,
            licenseClass,
            licenseExpiry,
            idCardFront,
            idCardBack,
            licenseFront,
            licenseBack,
          },
          additionalDriver: hasAdditionalDriver
            ? {
                name: additionalDriverName,
                phone: additionalDriverPhone,
                email: additionalDriverEmail,
                idNumber: additionalDriverIdNumber,
                dob: additionalDriverDob,
                licenseNumber: additionalDriverLicenseNumber,
                licenseClass: additionalDriverLicenseClass,
                licenseExpiry: additionalDriverLicenseExpiry,
                licenseFront: additionalDriverLicenseFront,
                licenseBack: additionalDriverLicenseBack,
              }
            : undefined,
        });

        if (res.data) {
          setEligibilityResult(res.data);
        }
      } catch (e) {
        console.warn('Realtime eligibility check warning:', e);
      } finally {
        setEligibilityChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    startDateParam,
    endDateParam,
    fullName,
    phone,
    email,
    idNumber,
    driverDob,
    licenseNumber,
    licenseClass,
    licenseExpiry,
    idCardFront,
    idCardBack,
    licenseFront,
    licenseBack,
    hasAdditionalDriver,
    additionalDriverName,
    additionalDriverPhone,
    additionalDriverEmail,
    additionalDriverIdNumber,
    additionalDriverDob,
    additionalDriverLicenseNumber,
    additionalDriverLicenseClass,
    additionalDriverLicenseExpiry,
    additionalDriverLicenseFront,
    additionalDriverLicenseBack,
  ]);

  const totalDays = quote?.totalDays || 3;
  const additionalDriverFeePerDay = 100000;
  const additionalDriverTotalFee = hasAdditionalDriver ? additionalDriverFeePerDay * totalDays : 0;
  const grandTotal = (quote?.pricingBreakdown.totalRentalAmount || 0) + additionalDriverTotalFee;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error('Vui lòng điền đầy đủ họ tên và số điện thoại');
      return;
    }

    if (hasAdditionalDriver && !additionalDriverName) {
      toast.error('Vui lòng điền họ tên người lái bổ sung');
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
        driverDob,
        licenseClass,
        licenseExpiry,
        idCardFront,
        idCardBack,
        licenseFront,
        licenseBack,
        hasAdditionalDriver,
        additionalDriverName: hasAdditionalDriver ? additionalDriverName : undefined,
        additionalDriverPhone: hasAdditionalDriver ? additionalDriverPhone : undefined,
        additionalDriverEmail: hasAdditionalDriver ? additionalDriverEmail : undefined,
        additionalDriverIdNumber: hasAdditionalDriver ? additionalDriverIdNumber : undefined,
        additionalDriverDob: hasAdditionalDriver ? additionalDriverDob : undefined,
        additionalDriverLicenseNumber: hasAdditionalDriver ? additionalDriverLicenseNumber : undefined,
        additionalDriverLicenseClass: hasAdditionalDriver ? additionalDriverLicenseClass : undefined,
        additionalDriverLicenseExpiry: hasAdditionalDriver ? additionalDriverLicenseExpiry : undefined,
        additionalDriverLicenseFront: hasAdditionalDriver ? additionalDriverLicenseFront : undefined,
        additionalDriverLicenseBack: hasAdditionalDriver ? additionalDriverLicenseBack : undefined,
        additionalDriverFee: additionalDriverTotalFee,
        pickupBranchId: Number(pickupBranchId),
        returnBranchId: Number(pickupBranchId),
        paymentMethod,
        notes: note,
      });

      const newBooking = res.data;
      toast.success('Hồ sơ đã được gửi & đối chiếu điều kiện thành công!');
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
          <p className="text-sm font-semibold text-slate-500">Đang khởi tạo thủ tục đặt xe & đối chiếu...</p>
        </div>
      </div>
    );
  }

  const primaryResult = eligibilityResult?.primaryResult;
  const additionalResult = eligibilityResult?.additionalResult;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Navigation */}
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
          {/* US-07: Thông tin người thuê chính & Giấy tờ định danh */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">
                  1. Thông Tin Người Lái Chính & Hồ Sơ Định Danh (US-07)
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                Bắt buộc
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và Tên (Theo CCCD)"
                placeholder="Nguyễn Văn An"
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
                placeholder="07909501xxxx"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />

              <Input
                label="Ngày Sinh (Độ tuổi ≥ 21)"
                type="date"
                value={driverDob}
                onChange={(e) => setDriverDob(e.target.value)}
                required
              />

              <Input
                label="Số Giấy Phép Lái Xe (GPLX)"
                placeholder="GPLX-79xxxxxx"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Hạng GPLX
                </label>
                <select
                  value={licenseClass}
                  onChange={(e) => setLicenseClass(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="B1">Hạng B1 (Số tự động)</option>
                  <option value="B2">Hạng B2 (Số sàn & tự động - Phổ biến)</option>
                  <option value="C">Hạng C (Tải & du lịch)</option>
                  <option value="D">Hạng D</option>
                  <option value="E">Hạng E</option>
                </select>
              </div>

              <Input
                label="Ngày Hết Hạn GPLX"
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                helperText="Phải còn hạn sau ngày kết thúc thuê"
                required
              />
            </div>

            {/* US-07: Nộp ảnh CCCD và GPLX trực tuyến */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Ảnh chụp giấy tờ định danh & bằng lái xe (Tải lên trực tuyến)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <DocumentUploader
                  label="CCCD Mặt Trước"
                  value={idCardFront}
                  onChange={setIdCardFront}
                />
                <DocumentUploader
                  label="CCCD Mặt Sau"
                  value={idCardBack}
                  onChange={setIdCardBack}
                />
                <DocumentUploader
                  label="GPLX Mặt Trước"
                  value={licenseFront}
                  onChange={setLicenseFront}
                />
                <DocumentUploader
                  label="GPLX Mặt Sau"
                  value={licenseBack}
                  onChange={setLicenseBack}
                />
              </div>
            </div>

            {/* US-08: Widget đối chiếu điều kiện tự động của Người Thuê Chính */}
            {primaryResult && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-black uppercase text-slate-800 tracking-wide">
                      US-08: Hệ thống đối chiếu điều kiện người thuê chính
                    </span>
                  </div>
                  {primaryResult.suggestedStatus === 'APPROVED' ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đạt Tiêu Chuẩn Duyệt
                    </span>
                  ) : primaryResult.suggestedStatus === 'REQUIRES_REVIEW' ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Cần Nhân Viên Xem Thêm
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Không Đạt Yêu Cầu
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Tiêu chí 1: Độ tuổi */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    {primaryResult.checks.age.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : primaryResult.checks.age.status === 'WARNING' ? (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-slate-800">Độ tuổi người lái</strong>
                      <span className="text-slate-500">{primaryResult.checks.age.message}</span>
                    </div>
                  </div>

                  {/* Tiêu chí 2: Hạn GPLX */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    {primaryResult.checks.licenseExpiry.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : primaryResult.checks.licenseExpiry.status === 'WARNING' ? (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-slate-800">Thời hạn GPLX</strong>
                      <span className="text-slate-500">{primaryResult.checks.licenseExpiry.message}</span>
                    </div>
                  </div>

                  {/* Tiêu chí 3: Hạng bằng */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    {primaryResult.checks.licenseClass.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-slate-800">Hạng bằng lái xe</strong>
                      <span className="text-slate-500">{primaryResult.checks.licenseClass.message}</span>
                    </div>
                  </div>

                  {/* Tiêu chí 4: Lịch sử & Danh sách đen */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2">
                    {primaryResult.checks.blacklistAndHistory.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-slate-800">Lịch sử & Danh sách đen</strong>
                      <span className="text-slate-500">{primaryResult.checks.blacklistAndHistory.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* US-09: Đăng ký thêm người lái bổ sung */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900">
                  2. Đăng Ký Thêm Người Lái Bổ Sung (US-09)
                </h2>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                +100.000 đ / ngày
              </span>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 cursor-pointer hover:bg-indigo-50/70 transition-colors">
              <input
                type="checkbox"
                checked={hasAdditionalDriver}
                onChange={(e) => setHasAdditionalDriver(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block text-sm">
                  Tôi muốn đăng ký thêm người lái phụ cùng điều khiển phương tiện
                </span>
                <p className="text-slate-600 mt-0.5">
                  Người lái bổ sung cũng sẽ được bảo hiểm toàn diện bảo vệ và được đối chiếu điều kiện lái xe (độ tuổi, hạn GPLX, lý lịch) tương tự người thuê chính.
                </p>
              </div>
            </label>

            {hasAdditionalDriver && (
              <div className="space-y-5 pt-2 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Họ và Tên Người Lái Phụ"
                    placeholder="Trần Thị Bình"
                    value={additionalDriverName}
                    onChange={(e) => setAdditionalDriverName(e.target.value)}
                    required
                  />

                  <Input
                    label="Số Điện Thoại Người Lái Phụ"
                    type="tel"
                    placeholder="0912345678"
                    value={additionalDriverPhone}
                    onChange={(e) => setAdditionalDriverPhone(e.target.value)}
                    required
                  />

                  <Input
                    label="Email Người Lái Phụ"
                    type="email"
                    placeholder="email@example.com"
                    value={additionalDriverEmail}
                    onChange={(e) => setAdditionalDriverEmail(e.target.value)}
                  />

                  <Input
                    label="Số CCCD Người Lái Phụ"
                    placeholder="07919609xxxx"
                    value={additionalDriverIdNumber}
                    onChange={(e) => setAdditionalDriverIdNumber(e.target.value)}
                    required
                  />

                  <Input
                    label="Ngày Sinh Người Lái Phụ (≥ 21 tuổi)"
                    type="date"
                    value={additionalDriverDob}
                    onChange={(e) => setAdditionalDriverDob(e.target.value)}
                    required
                  />

                  <Input
                    label="Số GPLX Người Lái Phụ"
                    placeholder="GPLX-88xxxxxx"
                    value={additionalDriverLicenseNumber}
                    onChange={(e) => setAdditionalDriverLicenseNumber(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Hạng GPLX Người Lái Phụ
                    </label>
                    <select
                      value={additionalDriverLicenseClass}
                      onChange={(e) => setAdditionalDriverLicenseClass(e.target.value)}
                      className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                    >
                      <option value="B1">Hạng B1 (Số tự động)</option>
                      <option value="B2">Hạng B2 (Số sàn & tự động)</option>
                      <option value="C">Hạng C</option>
                      <option value="D">Hạng D</option>
                    </select>
                  </div>

                  <Input
                    label="Hạn GPLX Người Lái Phụ"
                    type="date"
                    value={additionalDriverLicenseExpiry}
                    onChange={(e) => setAdditionalDriverLicenseExpiry(e.target.value)}
                    helperText="Phải còn hạn sau ngày trả xe"
                    required
                  />
                </div>

                {/* Upload GPLX người lái phụ */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Ảnh chụp GPLX của Người Lái Bổ Sung
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <DocumentUploader
                      label="GPLX Người Lái Phụ (Mặt Trước)"
                      value={additionalDriverLicenseFront}
                      onChange={setAdditionalDriverLicenseFront}
                    />
                    <DocumentUploader
                      label="GPLX Người Lái Phụ (Mặt Sau)"
                      value={additionalDriverLicenseBack}
                      onChange={setAdditionalDriverLicenseBack}
                    />
                  </div>
                </div>

                {/* US-09: Widget đối chiếu điều kiện tự động Người Lái Bổ Sung */}
                {additionalResult && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-700" />
                        <span className="text-xs font-black uppercase text-indigo-950 tracking-wide">
                          US-09: Kết quả đối chiếu Người Lái Bổ Sung
                        </span>
                      </div>
                      {additionalResult.suggestedStatus === 'APPROVED' ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đủ Điều Kiện Lái
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Chờ Bổ Sung / Xét Duyệt
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-indigo-100 flex items-start gap-2">
                        {additionalResult.checks.age.status === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block text-slate-800">Độ tuổi người lái phụ</strong>
                          <span className="text-slate-500">{additionalResult.checks.age.message}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-indigo-100 flex items-start gap-2">
                        {additionalResult.checks.licenseExpiry.status === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block text-slate-800">Hạn GPLX người lái phụ</strong>
                          <span className="text-slate-500">{additionalResult.checks.licenseExpiry.message}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Địa điểm & Thời gian bàn giao */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">
                3. Điểm Nhận Xe & Ghi Chú
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
                4. Phương Thức Thanh Toán Cọc Giữ Xe
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
            className="w-full h-14 text-base font-black shadow-xl shadow-amber-500/25 cursor-pointer"
          >
            Xác Nhận & Nộp Hồ Sơ Đặt Xe
          </Button>
        </form>

        {/* Right Summary: Car Summary & Financial Breakdown */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Tóm Tắt Đơn Thuê Xe</span>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                Sprint 3 Ready
              </span>
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
                <span className="font-bold text-amber-700">{totalDays} Ngày</span>
              </div>
            </div>

            {/* Financial summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền thuê xe ({totalDays} ngày):</span>
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

              {/* Phí người lái bổ sung US-09 */}
              {hasAdditionalDriver && (
                <div className="flex justify-between text-indigo-700 font-semibold bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                  <span>Phí người lái bổ sung ({totalDays} ngày):</span>
                  <span className="font-bold">{formatCurrency(additionalDriverTotalFee)}</span>
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
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Hệ thống tự động:</strong> Giấy tờ của Quý khách và người lái phụ sẽ được hệ thống mã hóa và tự động đối chiếu theo quy định hiện hành để kích hoạt đơn nhanh chóng.
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
