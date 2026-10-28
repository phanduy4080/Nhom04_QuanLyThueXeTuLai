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
  FileText,
  AlertTriangle,
  ArrowRight,
  Headphones,
  Check,
  UserPlus,
  Upload,
  XCircle,
  Eye,
  AlertCircle,
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
  const [bookingData, setBookingData] = useState<any>(null);

  // Modal cập nhật hồ sơ
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalForm, setModalForm] = useState({
    idNumber: '',
    driverDob: '',
    licenseNumber: '',
    licenseClass: 'B2',
    licenseExpiry: '',
    idCardFront: '',
    idCardBack: '',
    licenseFront: '',
    licenseBack: '',
    hasAdditionalDriver: false,
    additionalDriverName: '',
    additionalDriverPhone: '',
    additionalDriverEmail: '',
    additionalDriverIdNumber: '',
    additionalDriverDob: '',
    additionalDriverLicenseNumber: '',
    additionalDriverLicenseClass: 'B2',
    additionalDriverLicenseExpiry: '',
    additionalDriverLicenseFront: '',
    additionalDriverLicenseBack: '',
  });

  const fetchBookingInfo = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingByIdOrCode(bookingCode);
      if (res.data) {
        const b = res.data;
        setBookingData(b);
        setModalForm({
          idNumber: b.idNumber || '',
          driverDob: b.driverDob || '',
          licenseNumber: b.licenseNumber || '',
          licenseClass: b.licenseClass || 'B2',
          licenseExpiry: b.licenseExpiry || '',
          idCardFront: b.idCardFront || '',
          idCardBack: b.idCardBack || '',
          licenseFront: b.licenseFront || '',
          licenseBack: b.licenseBack || '',
          hasAdditionalDriver: Boolean(b.hasAdditionalDriver),
          additionalDriverName: b.additionalDriverName || '',
          additionalDriverPhone: b.additionalDriverPhone || '',
          additionalDriverEmail: b.additionalDriverEmail || '',
          additionalDriverIdNumber: b.additionalDriverIdNumber || '',
          additionalDriverDob: b.additionalDriverDob || '',
          additionalDriverLicenseNumber: b.additionalDriverLicenseNumber || '',
          additionalDriverLicenseClass: b.additionalDriverLicenseClass || 'B2',
          additionalDriverLicenseExpiry: b.additionalDriverLicenseExpiry || '',
          additionalDriverLicenseFront: b.additionalDriverLicenseFront || '',
          additionalDriverLicenseBack: b.additionalDriverLicenseBack || '',
        });

        if (b.carId) {
          const carRes = await carService.getCarById(String(b.carId));
          if (carRes.data) setCar(carRes.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Không tìm thấy thông tin đơn đặt xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingInfo();
  }, [bookingCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async () => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn đặt xe này?')) {
      try {
        if (bookingData?.id) {
          await bookingService.updateBookingStatus(bookingData.id, 'CANCELLED', 'Khách hàng yêu cầu hủy đơn');
        }
        setBookingData((prev: any) => ({ ...prev, status: 'CANCELLED' }));
        toast.info('Đã gửi yêu cầu hủy đơn thuê xe thành công');
      } catch (err: any) {
        toast.error('Lỗi khi hủy đơn');
      }
    }
  };

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setModalForm((prev) => ({ ...prev, [field]: reader.result as string }));
      toast.success('Đã tải ảnh lên thành công');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      await bookingService.verifyDocuments(bookingData.bookingCode || bookingData.id, modalForm);
      toast.success('Đã cập nhật hồ sơ & hệ thống đã tự động đối chiếu điều kiện');
      setShowUploadModal(false);
      fetchBookingInfo();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang tải thông tin đơn đặt xe...</p>
        </div>
      </div>
    );
  }

  const b = bookingData;
  const primaryEligibility = b?.eligibilityResult;
  const additionalEligibility = b?.additionalDriverEligibility;

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

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Cập Nhật Giấy Tờ (US-07)
          </Button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Header Status Bar */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-md">
                MÃ ĐƠN: {b?.bookingCode}
              </span>
              <span className="text-xs text-slate-400">
                Tạo lúc: {b?.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : ''}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Chi Tiết Đơn Đặt Xe Tự Lái
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {b?.status === 'CONFIRMED' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã Xác Nhận & Giữ Xe</span>
              </span>
            ) : b?.status === 'PENDING' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-gray-950 font-black text-sm shadow-md">
                <Clock className="w-4 h-4" />
                <span>Chờ Duyệt Hồ Sơ & Cọc</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-sm">
                <span>{b?.status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Status of Verification Banner (US-07 & US-08) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">
                Tình trạng thẩm định hồ sơ thuê xe (US-08):
              </span>
              <span className="text-slate-500">
                {b?.verificationStatus === 'APPROVED'
                  ? 'Hồ sơ đã tự động đạt điều kiện lái xe (Đủ tuổi, hạn GPLX và lý lịch hợp lệ).'
                  : b?.verificationStatus === 'REQUIRES_REVIEW'
                  ? 'Hồ sơ đang chờ chuyên viên đối chiếu bổ sung khi nhận xe.'
                  : 'Hồ sơ chưa hoàn thiện hoặc chưa đạt chuẩn.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {b?.verificationStatus === 'APPROVED' ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã Đạt Tiêu Chuẩn
              </span>
            ) : b?.verificationStatus === 'REQUIRES_REVIEW' ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Chờ Xem Xét
              </span>
            ) : (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Cần Bổ Sung
              </span>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer ml-1"
            >
              Chỉnh sửa hồ sơ
            </button>
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
                    {b?.carName || car?.name || 'VinFast VF 8 Plus'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Biển số: <strong className="text-slate-900">{b?.licensePlate || car?.licensePlate}</strong>
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded">
                    Tự lái • Nhận xe tại: {b?.pickupBranch}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Lịch Trình Thuê ({b?.totalDays} Ngày)</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <strong className="text-slate-900 block">
                      Nhận xe: {b?.startDate ? new Date(b.startDate).toLocaleString('vi-VN') : ''}
                    </strong>
                    <span className="text-slate-500">{b?.pickupBranch}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5" />
                  <div>
                    <strong className="text-slate-900 block">
                      Trả xe: {b?.endDate ? new Date(b.endDate).toLocaleString('vi-VN') : ''}
                    </strong>
                    <span className="text-slate-500">{b?.returnBranch}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Customer & Driver Identification (US-07) */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Hồ Sơ Định Danh & Bằng Lái Người Thuê Chính (US-07)
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-xs text-amber-700 hover:underline font-bold"
              >
                Cập nhật ảnh
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Họ và tên:</span>
                <strong className="text-slate-900 font-bold">{b?.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Số điện thoại:</span>
                <span className="text-slate-800 font-semibold">{b?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Số CCCD / Hộ chiếu:</span>
                <span className="text-slate-800 font-mono font-semibold">{b?.idNumber || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Ngày sinh:</span>
                <span className="text-slate-800 font-semibold">{b?.driverDob || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Số GPLX:</span>
                <span className="text-slate-800 font-mono font-semibold">{b?.licenseNumber || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Hạng GPLX:</span>
                <span className="text-amber-800 font-bold px-2 py-0.5 bg-amber-100 rounded">
                  {b?.licenseClass || 'B2'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Hạn GPLX:</span>
                <span className="text-slate-800 font-semibold">{b?.licenseExpiry || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Trạng thái hồ sơ:</span>
                <span className="text-emerald-700 font-bold">
                  {b?.identityVerified ? 'Đã xác minh' : 'Chờ kiểm tra'}
                </span>
              </div>
            </div>

            {/* Ảnh giấy tờ đính kèm */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 block mb-2">Ảnh giấy tờ nộp trực tuyến:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'CCCD Mặt trước', img: b?.idCardFront },
                  { label: 'CCCD Mặt sau', img: b?.idCardBack },
                  { label: 'GPLX Mặt trước', img: b?.licenseFront },
                  { label: 'GPLX Mặt sau', img: b?.licenseBack },
                ].map((item, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">{item.label}</span>
                    {item.img ? (
                      <div className="h-24 rounded-lg overflow-hidden border border-slate-100">
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-[11px] italic">
                        Chưa nộp ảnh
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* US-08: Kết quả đối chiếu chi tiết */}
            {primaryEligibility?.checks && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Đối chiếu điều kiện lái xe (US-08 Checklist):
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <li className="flex items-center gap-1.5">
                    {primaryEligibility.checks.age?.status === 'PASS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{primaryEligibility.checks.age?.message}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {primaryEligibility.checks.licenseExpiry?.status === 'PASS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{primaryEligibility.checks.licenseExpiry?.message}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {primaryEligibility.checks.licenseClass?.status === 'PASS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{primaryEligibility.checks.licenseClass?.message}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {primaryEligibility.checks.blacklistAndHistory?.status === 'PASS' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{primaryEligibility.checks.blacklistAndHistory?.message}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* 3. Additional Driver (US-09) */}
          {b?.hasAdditionalDriver && (
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-200">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-700" />
                  <h3 className="text-sm font-black text-indigo-950 uppercase">
                    Người Lái Bổ Sung Đã Đăng Ký (US-09)
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  Phí: {formatCurrency(b.additionalDriverFee || 0)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Họ và tên:</span>
                  <strong className="text-slate-900 font-bold">{b.additionalDriverName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số điện thoại:</span>
                  <span className="text-slate-800 font-semibold">{b.additionalDriverPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số CCCD:</span>
                  <span className="text-slate-800 font-mono font-semibold">{b.additionalDriverIdNumber || '---'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày sinh:</span>
                  <span className="text-slate-800 font-semibold">{b.additionalDriverDob || '---'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số GPLX:</span>
                  <span className="text-slate-800 font-mono font-semibold">{b.additionalDriverLicenseNumber || '---'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hạng GPLX:</span>
                  <span className="text-indigo-800 font-bold px-2 py-0.5 bg-indigo-100 rounded">
                    {b.additionalDriverLicenseClass || 'B2'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hạn GPLX:</span>
                  <span className="text-slate-800 font-semibold">{b.additionalDriverLicenseExpiry || '---'}</span>
                </div>
              </div>

              {/* Ảnh GPLX người lái phụ */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-600 block mb-2">Ảnh GPLX người lái phụ:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2 bg-white rounded-xl border border-indigo-100 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Mặt trước</span>
                    {b.additionalDriverLicenseFront ? (
                      <div className="h-24 rounded-lg overflow-hidden border">
                        <img src={b.additionalDriverLicenseFront} alt="Mặt trước" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-[11px] italic">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-indigo-100 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Mặt sau</span>
                    {b.additionalDriverLicenseBack ? (
                      <div className="h-24 rounded-lg overflow-hidden border">
                        <img src={b.additionalDriverLicenseBack} alt="Mặt sau" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-[11px] italic">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Kết quả đối chiếu US-09 */}
              {additionalEligibility?.checks && (
                <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-900 block mb-1">
                    Kết quả đối chiếu điều kiện người lái bổ sung (US-09):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{additionalEligibility.checks.age?.message}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{additionalEligibility.checks.licenseExpiry?.message}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Financial & Deposit Breakdown */}
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Bảng Kê Chi Phí & Tiền Cọc</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">
                Phương thức: {b?.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển Khoản Ngân Hàng (VietQR)' : 'Thanh Toán Tại Quầy'}
              </span>
            </h3>

            <div className="divide-y divide-amber-200/60 text-xs space-y-2">
              <div className="flex justify-between pt-2">
                <span className="text-slate-700">Tiền thuê xe ({b?.totalDays} ngày × {formatCurrency(b?.dailyPrice || 0)}):</span>
                <strong className="text-slate-900">{formatCurrency((b?.dailyPrice || 0) * (b?.totalDays || 1))}</strong>
              </div>

              {b?.hasAdditionalDriver && (
                <div className="flex justify-between pt-2 text-indigo-800 font-semibold">
                  <span>Phí người lái bổ sung ({b?.totalDays} ngày):</span>
                  <strong>{formatCurrency(b?.additionalDriverFee || 0)}</strong>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <span className="text-slate-700">Tiền cọc thế chấp xe:</span>
                <div className="text-right">
                  <strong className="text-amber-900 block">{formatCurrency(b?.depositAmount || 0)}</strong>
                  <span className="text-[10px] text-emerald-600 font-semibold">(Đã cọc - Hoàn lại 100% khi trả xe)</span>
                </div>
              </div>

              <div className="flex justify-between pt-3 text-sm font-black text-slate-900">
                <span>Tổng Tiền Thuê:</span>
                <span className="text-amber-600 text-lg">{formatCurrency(b?.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 5. Support Hotline & Cancel Option */}
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

            {b?.status === 'PENDING' && (
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

      {/* Modal Cập nhật hồ sơ định danh & GPLX trực tuyến (US-07 & US-09) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Cập Nhật Giấy Tờ Định Danh & GPLX (US-07)
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocuments} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số CCCD / Hộ chiếu</label>
                  <input
                    type="text"
                    value={modalForm.idNumber}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, idNumber: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày sinh (≥ 21 tuổi)</label>
                  <input
                    type="date"
                    value={modalForm.driverDob}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, driverDob: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số GPLX</label>
                  <input
                    type="text"
                    value={modalForm.licenseNumber}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn GPLX</label>
                  <input
                    type="date"
                    value={modalForm.licenseExpiry}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, licenseExpiry: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              {/* Upload ảnh */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block">Tải ảnh chụp giấy tờ:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">CCCD Trước</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('idCardFront', e)}
                      className="text-[10px]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">CCCD Sau</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('idCardBack', e)}
                      className="text-[10px]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">GPLX Trước</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('licenseFront', e)}
                      className="text-[10px]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">GPLX Sau</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('licenseBack', e)}
                      className="text-[10px]"
                    />
                  </div>
                </div>
              </div>

              {/* Option đăng ký thêm người lái bổ sung nếu chưa có (US-09) */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalForm.hasAdditionalDriver}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, hasAdditionalDriver: e.target.checked }))}
                    className="rounded text-indigo-600"
                  />
                  <span>Đăng ký thêm người lái bổ sung (US-09)</span>
                </label>

                {modalForm.hasAdditionalDriver && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Họ tên người lái phụ</label>
                      <input
                        type="text"
                        value={modalForm.additionalDriverName}
                        onChange={(e) => setModalForm((prev) => ({ ...prev, additionalDriverName: e.target.value }))}
                        className="w-full h-9 px-2 bg-white border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        value={modalForm.additionalDriverPhone}
                        onChange={(e) => setModalForm((prev) => ({ ...prev, additionalDriverPhone: e.target.value }))}
                        className="w-full h-9 px-2 bg-white border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Số GPLX người lái phụ</label>
                      <input
                        type="text"
                        value={modalForm.additionalDriverLicenseNumber}
                        onChange={(e) => setModalForm((prev) => ({ ...prev, additionalDriverLicenseNumber: e.target.value }))}
                        className="w-full h-9 px-2 bg-white border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hạn GPLX người lái phụ</label>
                      <input
                        type="date"
                        value={modalForm.additionalDriverLicenseExpiry}
                        onChange={(e) => setModalForm((prev) => ({ ...prev, additionalDriverLicenseExpiry: e.target.value }))}
                        className="w-full h-9 px-2 bg-white border rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={uploading}
                >
                  Lưu & Tự Động Đối Chiếu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
