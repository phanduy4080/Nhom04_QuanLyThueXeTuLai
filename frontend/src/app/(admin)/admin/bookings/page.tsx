'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [bookings, setBookings] = useState([
    {
      id: '1',
      bookingCode: 'DH-2610-000042',
      customerName: 'Nguyễn Văn Khách Hàng',
      phone: '0901234567',
      carName: 'VinFast VF 8 Plus (51K-888.88)',
      startDate: '15/10/2026 08:00',
      endDate: '18/10/2026 20:00',
      totalDays: 3,
      totalAmount: 3600000,
      depositAmount: 10000000,
      status: 'CONFIRMED',
      licenseVerified: true,
    },
    {
      id: '2',
      bookingCode: 'DH-2610-000041',
      customerName: 'Trần Thị Mai',
      phone: '0918889999',
      carName: 'Mazda CX-5 Premium (51H-678.90)',
      startDate: '16/10/2026 09:00',
      endDate: '19/10/2026 18:00',
      totalDays: 3,
      totalAmount: 3300000,
      depositAmount: 10000000,
      status: 'PENDING',
      licenseVerified: true,
    },
    {
      id: '3',
      bookingCode: 'DH-2610-000040',
      customerName: 'Lê Hoàng Long',
      phone: '0933221100',
      carName: 'Toyota Vios 1.5G (51F-123.45)',
      startDate: '14/10/2026 08:00',
      endDate: '15/10/2026 20:00',
      totalDays: 1,
      totalAmount: 700000,
      depositAmount: 5000000,
      status: 'IN_RENTAL',
      licenseVerified: true,
    },
    {
      id: '4',
      bookingCode: 'DH-2610-000039',
      customerName: 'Phạm Minh Trí',
      phone: '0977665544',
      carName: 'VinFast VF 3 Eco (51K-999.99)',
      startDate: '10/10/2026 07:00',
      endDate: '12/10/2026 19:00',
      totalDays: 2,
      totalAmount: 900000,
      depositAmount: 5000000,
      status: 'COMPLETED',
      licenseVerified: true,
    },
  ]);

  const handleApprove = (id: string, code: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CONFIRMED' } : b)),
    );
    toast.success(`Đã duyệt đơn đặt xe ${code} thành công!`);
  };

  const handleCancel = (id: string, code: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)),
    );
    toast.info(`Đã từ chối / hủy đơn ${code}`);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.carName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

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
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{b.bookingCode}</span>
                      <p className="text-xs text-slate-700 font-bold mt-0.5">{b.customerName}</p>
                      <span className="text-[11px] text-slate-400">{b.phone}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {b.carName}
                  </td>

                  <td className="py-4 px-4 text-xs whitespace-nowrap">
                    <p className="text-slate-800 font-bold flex items-center">
                      <span>{b.startDate}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 mx-1 shrink-0" />
                      <span>{b.endDate}</span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
