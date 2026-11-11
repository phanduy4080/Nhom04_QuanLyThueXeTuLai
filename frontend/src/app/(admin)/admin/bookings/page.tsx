'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck,
  ShieldCheck,
  Filter,
  ArrowRight,
  RefreshCw,
  UserPlus,
  User,
  FileText,
  AlertCircle,
  ExternalLink,
  KeyRound,
  CalendarPlus,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { bookingService, BookingResponse } from '@/services/booking.service';
import { rentalService, HandoverRecordItem } from '@/services/rental.service';
import { RentalContractModal } from '@/components/booking/RentalContractModal';
import { RejectBookingModal } from '@/components/booking/RejectBookingModal';
import { HandoverInspectionModal } from '@/components/booking/HandoverInspectionModal';
import { HandoverProtocolViewModal } from '@/components/booking/HandoverProtocolViewModal';
import { RentalExtensionModal } from '@/components/booking/RentalExtensionModal';
import { VehicleReturnModal } from '@/components/booking/VehicleReturnModal';
import { FinalSettlementModal } from '@/components/booking/FinalSettlementModal';

export default function AdminBookingsPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterVerification, setFilterVerification] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal xem chi tiết hồ sơ & đối chiếu (US-08, US-09)
  const [inspectBooking, setInspectBooking] = useState<BookingResponse | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // US-10 & US-12 Modals
  const [rejectingBooking, setRejectingBooking] = useState<BookingResponse | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [viewingContract, setViewingContract] = useState<any | null>(null);
  const [contractLoading, setContractLoading] = useState(false);

  // US-13, US-14, US-15: Bàn Giao Xe & Biên Bản Bàn Giao
  const [handoverBooking, setHandoverBooking] = useState<BookingResponse | null>(null);
  const [viewingHandover, setViewingHandover] = useState<HandoverRecordItem | null>(null);
  const [handoverLoading, setHandoverLoading] = useState(false);

  // US-16 & US-17: Extension Modal
  const [extendingBooking, setExtendingBooking] = useState<BookingResponse | null>(null);

  // US-20, US-21, US-22, US-23: Return Modal
  const [returningBooking, setReturningBooking] = useState<BookingResponse | null>(null);

  // US-24, US-25: Settlement Modal
  const [settlingBooking, setSettlingBooking] = useState<BookingResponse | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const res = await bookingService.getBookings(params);
      if (res.data) setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách đơn đặt xe');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // US-10: Nhân viên duyệt yêu cầu thuê xe
  const handleApprove = async (id: number, code: string) => {
    try {
      await bookingService.approveBooking(id, 'Admin đã phê duyệt yêu cầu thuê xe');
      toast.success(`Đã phê duyệt yêu cầu thuê xe ${code} thành công! Đơn chuyển sang trạng thái Chờ Khách Cọc.`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi duyệt đơn');
    }
  };

  // US-10: Mở modal từ chối
  const handleOpenReject = (booking: BookingResponse) => {
    setRejectingBooking(booking);
  };

  // US-10: Xác nhận từ chối đơn kèm lý do
  const handleConfirmReject = async (reason: string, notes?: string) => {
    if (!rejectingBooking) return;
    try {
      setRejectLoading(true);
      await bookingService.rejectBooking(rejectingBooking.id, reason, notes);
      toast.success(`Đã từ chối đơn đặt xe ${rejectingBooking.bookingCode} và tự động giải phóng xe.`);
      setRejectingBooking(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối đơn');
    } finally {
      setRejectLoading(false);
    }
  };

  // US-12: Xem Hợp đồng thuê xe điện tử
  const handleViewContract = async (idOrCode: string | number) => {
    try {
      setContractLoading(true);
      const res = await bookingService.getRentalContract(idOrCode);
      if (res.data) {
        setViewingContract(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải hợp đồng điện tử');
    } finally {
      setContractLoading(false);
    }
  };

  // US-13, US-14, US-15: Mở modal kiểm tra & lập biên bản bàn giao xe
  const handleOpenHandover = (booking: BookingResponse) => {
    setHandoverBooking(booking);
  };

  // US-14: Xem biên bản bàn giao xe liên kết với đơn
  const handleViewHandover = async (bookingIdOrCode: string | number) => {
    try {
      setHandoverLoading(true);
      const res = await rentalService.getHandoverByBooking(bookingIdOrCode);
      if (res.data) {
        setViewingHandover(res.data);
      } else {
        toast.info('Đơn này chưa có Biên bản bàn giao xe');
      }
    } catch (err: any) {
      toast.error('Không thể tải biên bản bàn giao xe');
    } finally {
      setHandoverLoading(false);
    }
  };

  // Sau khi hoàn tất bàn giao thực tế
  const handleHandoverSuccess = (record: HandoverRecordItem) => {
    fetchBookings();
    setViewingHandover(record);
  };

  // US-08: Admin xét duyệt hồ sơ
  const handleReviewVerification = async (
    status: 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW',
    reason?: string
  ) => {
    if (!inspectBooking) return;
    try {
      setReviewing(true);
      await bookingService.reviewVerification(inspectBooking.id, {
        verificationStatus: status,
        rejectionReason: reason,
      });

      toast.success(
        status === 'APPROVED'
          ? 'Đã duyệt hồ sơ thuê xe hợp lệ!'
          : status === 'REQUIRES_REVIEW'
          ? 'Đã chuyển hồ sơ sang trạng thái yêu cầu kiểm tra bổ sung.'
          : 'Đã từ chối duyệt hồ sơ.'
      );

      // Cập nhật local state
      setInspectBooking((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: status,
              identityVerified: status === 'APPROVED',
            }
          : null
      );
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xét duyệt hồ sơ');
    } finally {
      setReviewing(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterVerification === 'ALL') return true;
    return b.verificationStatus === filterVerification;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">Đã Duyệt (Chờ Cọc)</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Đã Cọc (Giữ Xe)</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Chờ Duyệt</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Đã Từ Chối</span>;
      case 'IN_RENTAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Đang Thuê</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Hoàn Tất</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Đã Hủy</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getVerificationBadge = (vStatus?: string) => {
    switch (vStatus) {
      case 'APPROVED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt Điều Kiện
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Không Đạt
          </span>
        );
      case 'REQUIRES_REVIEW':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Chờ Đối Chiếu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Đơn Đặt Xe
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối chiếu hồ sơ GPLX, xét duyệt, bàn giao, nhận trả xe và quyết toán hợp đồng
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Làm Mới
        </Button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, người lái phụ..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ Duyệt (PENDING)</option>
            <option value="APPROVED">Đã Duyệt (APPROVED)</option>
            <option value="CONFIRMED">Đã Cọc (CONFIRMED)</option>
            <option value="IN_RENTAL">Đang Thuê (IN_RENTAL)</option>
            <option value="COMPLETED">Hoàn Tất (COMPLETED)</option>
            <option value="REJECTED">Từ Chối (REJECTED)</option>
            <option value="CANCELLED">Đã Hủy (CANCELLED)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="w-full h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="ALL">Tất cả tình trạng GPLX</option>
            <option value="APPROVED">GPLX Hợp lệ</option>
            <option value="REQUIRES_REVIEW">Chờ đối chiếu</option>
            <option value="REJECTED">GPLX Không đạt</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Mã Đơn & Khách Hàng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Phương Tiện</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Hồ Sơ & Người Lái Phụ</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Lịch Trình</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tiền Thuê / Cọc</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách đơn đặt xe...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn đặt xe nào
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">{b.bookingCode}</span>
                        <p className="text-xs text-slate-800 font-bold mt-0.5">{b.customerName}</p>
                        <span className="text-[11px] text-slate-400">{b.phone} • {b.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      <p>{b.carName}</p>
                      <span className="font-mono text-slate-400 text-[11px]">{b.licensePlate}</span>
                    </td>

                    {/* Cột Hồ sơ & Lái phụ (US-07, US-08, US-09) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div>{getVerificationBadge(b.verificationStatus)}</div>
                        {b.hasAdditionalDriver ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <UserPlus className="w-3 h-3" /> +1 Lái Phụ ({b.additionalDriverName})
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 block">Lái xe chính</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs whitespace-nowrap">
                      <p className="text-slate-800 font-bold flex items-center">
                        <span>{b.startDate ? new Date(b.startDate).toLocaleDateString('vi-VN') : ''}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 mx-1 shrink-0" />
                        <span>{b.endDate ? new Date(b.endDate).toLocaleDateString('vi-VN') : ''}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-slate-400">Thời lượng: {b.totalDays} ngày</span>
                        {b.hasActiveExtension && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                            +Đã gia hạn
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs whitespace-nowrap">
                      <p className="font-bold text-slate-900">{formatCurrency(b.totalAmount)}</p>
                      <span className="text-slate-400">Cọc: {formatCurrency(b.depositAmount)}</span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Hồ Sơ */}
                        <button
                          onClick={() => setInspectBooking(b)}
                          className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition"
                          title="Đối chiếu hồ sơ định danh & GPLX"
                        >
                          Hồ Sơ
                        </button>

                        {/* Hợp Đồng */}
                        {['APPROVED', 'CONFIRMED', 'IN_RENTAL', 'COMPLETED'].includes(b.status) && (
                          <button
                            onClick={() => handleViewContract(b.id)}
                            className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition"
                            title="Xem Hợp Đồng Thuê Xe Điện Tử"
                          >
                            Hợp Đồng
                          </button>
                        )}

                        {/* Biên Bản Bàn Giao */}
                        {['IN_RENTAL', 'COMPLETED'].includes(b.status) && (
                          <button
                            onClick={() => handleViewHandover(b.id)}
                            className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition"
                            title="Xem Biên Bản Bàn Giao Xe"
                          >
                            Biên Bản
                          </button>
                        )}

                        {/* Gia Hạn */}
                        {['CONFIRMED', 'IN_RENTAL'].includes(b.status) && (
                          <button
                            onClick={() => setExtendingBooking(b)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md text-xs font-medium transition"
                            title="Gia hạn thời gian thuê"
                          >
                            Gia Hạn
                          </button>
                        )}

                        {/* Giao Xe Thực Tế */}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleOpenHandover(b)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold transition"
                            title="Lập Biên bản bàn giao giao xe cho khách"
                          >
                            Giao Xe
                          </button>
                        )}

                        {/* Trả Xe */}
                        {b.status === 'IN_RENTAL' && (
                          <button
                            onClick={() => setReturningBooking(b)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
                            title="Đối chiếu ODO & nhận lại xe"
                          >
                            Trả Xe
                          </button>
                        )}

                        {/* Quyết Toán */}
                        {['IN_RENTAL', 'COMPLETED'].includes(b.status) && (
                          <button
                            onClick={() => setSettlingBooking(b)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold transition"
                            title="Quyết toán hợp đồng & cấn trừ cọc"
                          >
                            Quyết Toán
                          </button>
                        )}

                        {/* Thao tác duyệt / từ chối */}
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id, b.bookingCode)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
                            >
                              Duyệt Đơn
                            </button>
                            <button
                              onClick={() => handleOpenReject(b)}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md text-xs font-medium transition"
                            >
                              Từ Chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Đối Chiếu Hồ Sơ & Xét Duyệt (US-08 & US-09) */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Đối Chiếu Hồ Sơ Định Danh & GPLX (US-08)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Đơn hàng: <strong>{inspectBooking.bookingCode}</strong> • Khách: {inspectBooking.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* 1. Người Thuê Chính */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                    Người Thuê & Lái Chính: {inspectBooking.customerName}
                  </h4>
                </div>
                {getVerificationBadge(inspectBooking.verificationStatus)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Số CCCD / Hộ chiếu:</span>
                  <strong className="text-slate-900">{inspectBooking.idNumber || 'Chưa cung cấp'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Ngày sinh:</span>
                  <strong className="text-slate-900">{inspectBooking.driverDob || 'Chưa cung cấp'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Số GPLX:</span>
                  <strong className="text-slate-900">{inspectBooking.licenseNumber || 'Chưa cung cấp'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Hạng & Hạn GPLX:</span>
                  <strong className="text-slate-900">
                    {inspectBooking.licenseClass || 'B2'} • Hết hạn: {inspectBooking.licenseExpiry || 'N/A'}
                  </strong>
                </div>
              </div>

              {/* Ảnh giấy tờ */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Ảnh Giấy Tờ Nộp Trực Tuyến:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'CCCD Mặt trước', img: inspectBooking.idCardFront },
                    { label: 'CCCD Mặt sau', img: inspectBooking.idCardBack },
                    { label: 'GPLX Mặt trước', img: inspectBooking.licenseFront },
                    { label: 'GPLX Mặt sau', img: inspectBooking.licenseBack },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-1.5 bg-white rounded-lg border text-center text-[10px]">
                      <span className="font-bold text-slate-700 block mb-1">{doc.label}</span>
                      {doc.img ? (
                        <div
                          onClick={() => setSelectedPhoto(doc.img!)}
                          className="h-20 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border"
                        >
                          <img src={doc.img} alt={doc.label} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 rounded bg-slate-100 flex items-center justify-center text-slate-400 italic">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist đối chiếu US-08 */}
              {inspectBooking.eligibilityResult?.checks && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                  <span className="font-bold text-indigo-950 block">
                    Kết quả tự động đối chiếu điều kiện lái xe (US-08):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <p className="flex items-center gap-1.5">
                      {inspectBooking.eligibilityResult.checks.age?.status === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{inspectBooking.eligibilityResult.checks.age?.message}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      {inspectBooking.eligibilityResult.checks.licenseExpiry?.status === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{inspectBooking.eligibilityResult.checks.licenseExpiry?.message}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      {inspectBooking.eligibilityResult.checks.licenseClass?.status === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{inspectBooking.eligibilityResult.checks.licenseClass?.message}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      {inspectBooking.eligibilityResult.checks.blacklistAndHistory?.status === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{inspectBooking.eligibilityResult.checks.blacklistAndHistory?.message}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Người Lái Bổ Sung (US-09) nếu có */}
            {inspectBooking.hasAdditionalDriver && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-700" />
                    <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wide">
                      Người Lái Bổ Sung (US-09): {inspectBooking.additionalDriverName}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    Phí: {formatCurrency(inspectBooking.additionalDriverFee || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-indigo-100">
                  <div>
                    <span className="text-slate-400 block">Số điện thoại:</span>
                    <strong className="text-slate-900">{inspectBooking.additionalDriverPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Số CCCD:</span>
                    <strong className="text-slate-900">{inspectBooking.additionalDriverIdNumber || '---'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Ngày sinh:</span>
                    <strong className="text-slate-900">{inspectBooking.additionalDriverDob || '---'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GPLX & Hạn:</span>
                    <strong className="text-slate-900">
                      {inspectBooking.additionalDriverLicenseNumber} ({inspectBooking.additionalDriverLicenseClass || 'B2'})
                    </strong>
                  </div>
                </div>

                {/* Ảnh GPLX người lái phụ */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-1.5 bg-white rounded-lg border text-center text-[10px]">
                    <span className="font-bold text-slate-700 block mb-1">GPLX Người Lái Phụ (Trước)</span>
                    {inspectBooking.additionalDriverLicenseFront ? (
                      <div
                        onClick={() => setSelectedPhoto(inspectBooking.additionalDriverLicenseFront!)}
                        className="h-20 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border"
                      >
                        <img src={inspectBooking.additionalDriverLicenseFront} alt="Trước" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 rounded bg-slate-100 flex items-center justify-center text-slate-400 italic">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  <div className="p-1.5 bg-white rounded-lg border text-center text-[10px]">
                    <span className="font-bold text-slate-700 block mb-1">GPLX Người Lái Phụ (Sau)</span>
                    {inspectBooking.additionalDriverLicenseBack ? (
                      <div
                        onClick={() => setSelectedPhoto(inspectBooking.additionalDriverLicenseBack!)}
                        className="h-20 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border"
                      >
                        <img src={inspectBooking.additionalDriverLicenseBack} alt="Sau" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 rounded bg-slate-100 flex items-center justify-center text-slate-400 italic">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>

                {/* Kết quả đối chiếu lái phụ */}
                {inspectBooking.additionalDriverEligibility?.checks && (
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 block">
                      Đối chiếu điều kiện người lái phụ (US-09):
                    </span>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{inspectBooking.additionalDriverEligibility.checks.age?.message}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{inspectBooking.additionalDriverEligibility.checks.licenseExpiry?.message}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions Duyệt / Từ chối hồ sơ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 italic">
                * Hành động duyệt hồ sơ sẽ cập nhật tính hợp lệ của khách hàng và người lái phụ trước khi nhận xe.
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reviewing}
                  onClick={() => handleReviewVerification('REQUIRES_REVIEW', 'Cần khách hàng bổ sung ảnh giấy tờ rõ nét')}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Yêu Cầu Bổ Sung
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={reviewing}
                  onClick={() => handleReviewVerification('REJECTED', 'Không đủ điều kiện theo quy chế')}
                  className="text-rose-700 border-rose-300 hover:bg-rose-50"
                >
                  Từ Chối Hồ Sơ
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={reviewing}
                  onClick={() => handleReviewVerification('APPROVED', 'Hồ sơ đã được chuyên viên kiểm tra hợp lệ')}
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                >
                  Duyệt Hồ Sơ Hợp Lệ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Ảnh */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-3xl max-h-[85vh] bg-white p-2 rounded-2xl overflow-hidden shadow-2xl">
            <img src={selectedPhoto} alt="Zoom" className="w-full h-full object-contain max-h-[80vh]" />
          </div>
        </div>
      )}

      {/* US-10: Modal Từ Chối Đơn Đặt Xe */}
      <RejectBookingModal
        booking={rejectingBooking}
        isOpen={Boolean(rejectingBooking)}
        onClose={() => setRejectingBooking(null)}
        onConfirm={handleConfirmReject}
        loading={rejectLoading}
      />

      {/* US-12: Modal Xem Hợp Đồng Thuê Xe Điện Tử */}
      <RentalContractModal
        contract={viewingContract}
        isOpen={Boolean(viewingContract)}
        onClose={() => setViewingContract(null)}
      />

      {/* US-13, US-14, US-15: Modal Kiểm Tra & Bàn Giao Xe Thực Tế */}
      <HandoverInspectionModal
        booking={handoverBooking}
        isOpen={Boolean(handoverBooking)}
        onClose={() => setHandoverBooking(null)}
        onSuccess={handleHandoverSuccess}
      />

      {/* US-14: Modal Xem & In Biên Bản Bàn Giao Xe Chuẩn Pháp Lý */}
      <HandoverProtocolViewModal
        handover={viewingHandover}
        isOpen={Boolean(viewingHandover)}
        onClose={() => setViewingHandover(null)}
      />

      {/* US-16 & US-17: Modal Gia Hạn Thuê Xe */}
      <RentalExtensionModal
        booking={extendingBooking}
        isOpen={Boolean(extendingBooking)}
        onClose={() => setExtendingBooking(null)}
        onSuccess={() => {
          setExtendingBooking(null);
          fetchBookings();
        }}
      />

      {/* US-20, US-21, US-22, US-23: Modal Trả Xe & Lập Biên Bản CHECKIN */}
      <VehicleReturnModal
        booking={returningBooking}
        isOpen={Boolean(returningBooking)}
        onClose={() => setReturningBooking(null)}
        onSuccess={() => {
          setReturningBooking(null);
          fetchBookings();
        }}
      />

      {/* US-24 & US-25: Modal Quyết Toán Hợp Đồng & Cấn Trừ Cọc */}
      <FinalSettlementModal
        booking={settlingBooking}
        isOpen={Boolean(settlingBooking)}
        onClose={() => setSettlingBooking(null)}
        onSuccess={() => {
          setSettlingBooking(null);
          fetchBookings();
        }}
      />
    </div>
  );
}
