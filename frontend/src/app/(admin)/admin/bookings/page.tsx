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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { bookingService, BookingResponse } from '@/services/booking.service';

export default function AdminBookingsPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleApprove = async (id: number, code: string) => {
    try {
      await bookingService.updateBookingStatus(id, 'CONFIRMED', 'Admin đã duyệt cọc thành công');
      toast.success(`Đã duyệt cọc đơn đặt xe ${code} thành công!`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi duyệt cọc đơn');
    }
  };

  const handleCancel = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn đặt xe ${code}?`)) return;
    try {
      await bookingService.updateBookingStatus(id, 'CANCELLED', 'Admin từ chối / hủy đơn');
      toast.info(`Đã hủy đơn ${code}`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy đơn');
    }
  };

  const filteredBookings = bookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shadow-2xs">Đã Xác Nhận</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap shadow-2xs">Chờ Duyệt Cọc</span>;
      case 'IN_RENTAL':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap shadow-2xs">Đang Thuê</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap shadow-2xs">Đã Trả Xe</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap shadow-2xs">Đã Hủy</span>;
      default:
        return <span className="whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý Đơn Đặt Xe
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Duyệt yêu cầu thuê, kiểm tra hồ sơ bằng lái và quản lý lịch trình xe.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng, tên xe..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ Duyệt (PENDING)</option>
            <option value="CONFIRMED">Đã Xác Nhận (CONFIRMED)</option>
            <option value="IN_RENTAL">Đang Thuê (IN_RENTAL)</option>
            <option value="COMPLETED">Đã Hoàn Thành (COMPLETED)</option>
            <option value="CANCELLED">Đã Hủy (CANCELLED)</option>
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
                <th className="py-3.5 px-4 whitespace-nowrap">Lịch Trình Thuê</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tiền Thuê / Cọc</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải danh sách đơn đặt xe...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn đặt xe nào
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">{b.bookingCode}</span>
                        <p className="text-xs text-slate-700 font-bold mt-0.5">{b.customerName}</p>
                        <span className="text-[11px] text-slate-400">{b.phone} • {b.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      <p>{b.carName}</p>
                      <span className="font-mono text-slate-400 text-[11px]">{b.licensePlate}</span>
                    </td>

                    <td className="py-4 px-4 text-xs whitespace-nowrap">
                      <p className="text-slate-800 font-bold flex items-center">
                        <span>{b.startDate ? new Date(b.startDate).toLocaleDateString('vi-VN') : ''}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 mx-1 shrink-0" />
                        <span>{b.endDate ? new Date(b.endDate).toLocaleDateString('vi-VN') : ''}</span>
                      </p>
                      <span className="text-slate-400">Thời lượng: {b.totalDays} ngày</span>
                    </td>

                    <td className="py-4 px-4 text-xs whitespace-nowrap">
                      <p className="font-bold text-slate-900">{formatCurrency(b.totalAmount)}</p>
                      <span className="text-slate-400">Cọc: {formatCurrency(b.depositAmount)}</span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id, b.bookingCode)}
                              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                            >
                              Duyệt Cọc
                            </button>
                            <button
                              onClick={() => handleCancel(b.id, b.bookingCode)}
                              className="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border border-rose-200"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <span className="text-xs text-emerald-600 font-bold">Đã duyệt cọc</span>
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
    </div>
  );
}
