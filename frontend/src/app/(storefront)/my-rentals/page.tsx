'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car as CarIcon,
  Calendar,
  Clock,
  MapPin,
  Search,
  FileText,
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  User,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { bookingService, BookingResponse } from '@/services/booking.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { RentalExtensionModal } from '@/components/booking/RentalExtensionModal';
import { ReportIncidentModal } from '@/components/incident/ReportIncidentModal';

export default function MyRentalsPage() {
  const { user, isAuthenticated } = useAuthStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'HISTORY'>('ALL');

  // Tra cứu theo email hoặc phone đối với khách vãng lai
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');

  // Modal Gia hạn hợp đồng (Sprint 6)
  const [selectedBookingForExtension, setSelectedBookingForExtension] = useState<any>(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  // Modal Báo cáo sự cố (Sprint 7)
  const [selectedBookingForIncident, setSelectedBookingForIncident] = useState<any>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const fetchBookings = async (customEmail?: string, customPhone?: string) => {
    try {
      setLoading(true);
      const emailQuery = customEmail || user?.email || lookupEmail;
      const phoneQuery = customPhone || user?.phone || lookupPhone;

      if (!isAuthenticated && !emailQuery && !phoneQuery) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const res = await bookingService.getMyBookings(emailQuery, phoneQuery);
      if (res?.data) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể tải danh sách đơn thuê xe');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      setLookupEmail(user.email || '');
      setLookupPhone(user.phone || '');
      fetchBookings(user.email, user.phone);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone && !lookupEmail) {
      toast.error('Vui lòng nhập số điện thoại hoặc email đã dùng khi đặt xe');
      return;
    }
    fetchBookings(lookupEmail, lookupPhone);
  };

  // Lọc theo Tab
  const filteredBookings = bookings.filter((b) => {
    const status = b.status?.toUpperCase() || '';
    if (activeTab === 'ACTIVE') {
      return ['CONFIRMED', 'IN_RENTAL', 'IN_PROGRESS'].includes(status);
    }
    if (activeTab === 'PENDING') {
      return ['PENDING', 'AWAITING_PAYMENT'].includes(status);
    }
    if (activeTab === 'HISTORY') {
      return ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const upper = status?.toUpperCase() || '';
    switch (upper) {
      case 'IN_RENTAL':
      case 'IN_PROGRESS':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Đang Sử Dụng Xe
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã Xác Nhận (Chờ Nhận Xe)
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ Duyệt Cọc & Hồ Sơ
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Đã Hoàn Tất Thuê Xe
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã Hủy Đơn
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())} • ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Sprint 6 & 7: Cổng Khách Hàng Tự Quản Lý</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Đơn Thuê Xe Của Tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Theo dõi tình trạng đơn đặt xe, ký hợp đồng điện tử, <strong>yêu cầu gia hạn thời gian thuê</strong> hoặc <strong>báo cáo sự cố khẩn cấp</strong> ngay trong suốt hành trình.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchBookings()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/15 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm Mới</span>
            </button>
            <Link href="/cars">
              <Button variant="primary" size="md" className="font-black text-xs shadow-md shadow-amber-400/20">
                Thuê Thêm Xe Khác
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tra cứu đối với khách vãng lai hoặc chưa có đơn tự động */}
      {!isAuthenticated && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Search className="w-4 h-4 text-amber-500" />
            <span>Tra Cứu Nhanh Đơn Đặt Xe Bằng Số Điện Thoại Hoặc Email:</span>
          </div>
          <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nhập số điện thoại đặt xe (VD: 0901234567)"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                placeholder="Hoặc email đặt xe (VD: khachhang@gmail.com)"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              {loading ? 'Đang tìm...' : 'Tra Cứu Đơn'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất Cả ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đang Thuê / Sắp Nhận (
            {
              bookings.filter((b) =>
                ['CONFIRMED', 'IN_RENTAL', 'IN_PROGRESS'].includes(b.status?.toUpperCase() || '')
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chờ Duyệt Cọc (
            {
              bookings.filter((b) =>
                ['PENDING', 'AWAITING_PAYMENT'].includes(b.status?.toUpperCase() || '')
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lịch Sử Đã Hoàn Tất (
            {
              bookings.filter((b) =>
                ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status?.toUpperCase() || '')
              ).length
            }
            )
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Đang tải danh sách đơn thuê xe...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <CarIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Không tìm thấy đơn thuê xe nào</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Bạn chưa có đơn thuê xe nào trong danh mục này hoặc chưa nhập đúng thông tin đặt xe.
            </p>
          </div>
          <Link href="/cars">
            <Button variant="primary" size="md" className="font-bold text-xs">
              Xem Danh Sách Xe Cho Thuê
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const vehicle = booking.vehicle || {};
            const model = vehicle.model || {};
            const carName = vehicle.customName || model.name || `Xe ${vehicle.licensePlate || ''}`;
            const carImg =
              vehicle.featuredImage ||
              vehicle.images?.[0]?.file?.fileUrl ||
              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            const statusUpper = booking.status?.toUpperCase() || '';
            const canExtend = ['CONFIRMED', 'IN_RENTAL', 'IN_PROGRESS'].includes(statusUpper);
            const canReportIncident = ['IN_RENTAL', 'IN_PROGRESS'].includes(statusUpper);

            return (
              <div
                key={booking.bookingId || booking.id || booking.bookingCode}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow space-y-5"
              >
                {/* Top Row: Mã đơn & Trạng thái */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-700 flex items-center justify-center font-black">
                      <CarIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Mã đơn:</span>
                        <strong className="text-sm font-mono font-black text-slate-900">
                          {booking.bookingCode}
                        </strong>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Đặt lúc: {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Middle Row: Chi tiết xe & Thời gian thuê */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Ảnh xe & Tên xe (5 cols) */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div className="w-24 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img
                        src={carImg}
                        alt={carName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900 line-clamp-1">
                        {carName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {vehicle.licensePlate || 'Chờ gán biển số'}
                        </span>
                        <span>•</span>
                        <span>{model.brand?.name || 'Chính hãng'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Nhận xe: {booking.pickupBranch?.branchName || 'Chi nhánh Quận 1'}
                      </p>
                    </div>
                  </div>

                  {/* Thời gian nhận - trả (4 cols) */}
                  <div className="md:col-span-4 bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Nhận Xe:</span>
                        <p className="font-bold text-slate-800">{formatDate(booking.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs border-t border-slate-200/60 pt-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Trả Xe:</span>
                        <p className="font-bold text-slate-800">{formatDate(booking.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Giá tiền & Thời lượng (3 cols) */}
                  <div className="md:col-span-3 text-left md:text-right space-y-1">
                    <span className="text-xs text-slate-400 block">
                      Tổng tiền thuê ({booking.totalDays || 1} ngày):
                    </span>
                    <strong className="text-lg font-black text-amber-600 block">
                      {formatCurrency(booking.totalAmount || 0)}
                    </strong>
                    <div className="text-[11px] text-slate-500">
                      Tiền cọc: <span className="font-bold text-slate-700">{formatCurrency(booking.depositAmount || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Nút hành động trực tiếp (Sprint 6 & Sprint 7) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-3xl">
                  {/* Left: Thông tin hỗ trợ */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Hợp đồng điện tử có hiệu lực pháp lý
                    </span>
                  </div>

                  {/* Right: Hành động Sprint 6 & 7 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* SPRINT 6: Nút Yêu Cầu Gia Hạn Thuê Xe */}
                    {canExtend && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingForExtension(booking);
                          setShowExtensionModal(true);
                        }}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Bấm để yêu cầu kéo dài thời gian thuê xe"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        <span>Yêu Cầu Gia Hạn</span>
                      </button>
                    )}

                    {/* SPRINT 7: Nút Báo Cáo Sự Cố Khẩn Cấp */}
                    {canReportIncident && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingForIncident(booking);
                          setShowIncidentModal(true);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Báo cáo tai nạn, hỏng hóc hoặc mất phụ kiện"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Báo Cáo Sự Cố</span>
                      </button>
                    )}

                    {/* Xem chi tiết & Hợp đồng */}
                    <Link
                      href={`/booking/${booking.bookingCode || booking.bookingId || booking.id}`}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Xem Hợp Đồng & Chi Tiết</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SPRINT 6: Modal Gia Hạn Hợp Đồng Thuê Xe */}
      {selectedBookingForExtension && (
        <RentalExtensionModal
          booking={selectedBookingForExtension}
          isOpen={showExtensionModal}
          onClose={() => {
            setShowExtensionModal(false);
            setSelectedBookingForExtension(null);
          }}
          onSuccess={(updatedBooking) => {
            toast.success('Gia hạn thuê xe thành công!');
            setShowExtensionModal(false);
            setSelectedBookingForExtension(null);
            fetchBookings();
          }}
        />
      )}

      {/* SPRINT 7: Modal Báo Cáo Sự Cố & Minh Chứng */}
      {selectedBookingForIncident && (
        <ReportIncidentModal
          booking={selectedBookingForIncident}
          isOpen={showIncidentModal}
          onClose={() => {
            setShowIncidentModal(false);
            setSelectedBookingForIncident(null);
          }}
          onSuccess={(newIncident) => {
            toast.success('Báo cáo sự cố đã được ghi nhận. Đội ngũ cứu hộ sẽ liên hệ ngay!');
            setShowIncidentModal(false);
            setSelectedBookingForIncident(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
