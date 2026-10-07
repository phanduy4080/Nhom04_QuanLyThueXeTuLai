'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car as CarIcon,
  TrendingUp,
  CalendarCheck,
  Users,
  ArrowUpRight,
  Plus,
  Activity,
  DollarSign,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { carService } from '@/services/car.service';
import { bookingService } from '@/services/booking.service';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<any[]>([]);
  const [kpi, setKpi] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [carsRes, kpiRes, bookingsRes] = await Promise.all([
          carService.getCars(),
          bookingService.getDashboardKpi(),
          bookingService.getBookings({ limit: 5 }),
        ]);
        if (carsRes.data) setCars(carsRes.data);
        if (kpiRes.data) setKpi(kpiRes.data);
        if (bookingsRes.data) setRecentBookings(bookingsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalCars = kpi?.totalVehicles ?? cars.length;
  const availableCars = kpi?.availableVehicles ?? cars.filter((c) => c.status === 'AVAILABLE').length;
  const rentedCars = kpi?.rentedVehicles ?? cars.filter((c) => c.status === 'RENTED').length;
  const maintenanceCars = cars.filter((c) => c.status === 'MAINTENANCE').length;
  const pendingBookings = kpi?.pendingBookings ?? 0;
  const totalRevenue = kpi?.totalRevenue ?? 0;

  const stats = [
    {
      title: 'Tổng Số Xe Trong Đội',
      value: `${totalCars} Xe`,
      subtext: `${availableCars} xe sẵn sàng • ${rentedCars} xe đang thuê`,
      icon: <CarIcon className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Doanh Thu Thuê Xe',
      value: `${formatCurrency(totalRevenue)}`,
      subtext: 'Tổng doanh thu các đơn đã xác nhận',
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Lịch Đặt Chờ Xác Nhận',
      value: `${pendingBookings} Đơn Hàng`,
      subtext: 'Cần duyệt hồ sơ & duyệt cọc',
      icon: <CalendarCheck className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Hiệu Suất Vận Hành Đội Xe',
      value: `${totalCars > 0 ? Math.round(((totalCars - availableCars) / totalCars) * 100) : 0}%`,
      subtext: 'Tỉ lệ xe đang khai thác trên tổng đội',
      icon: <Users className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Quản Trị Xe Tự Lái QuickHatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Xin Chào, Quản Trị Viên!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Hôm nay có <strong>{availableCars} xe sẵn sàng</strong> phục vụ khách hàng. Hệ thống vận hành ổn định.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/cars">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Thêm Xe Mới
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-3xl border bg-white shadow-2xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-2xl ${stat.color} border`}>
                {stat.icon}
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Fleet Status Breakdown + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Fleet Status Progress & Fleet Highlights (US-01 & US-02) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Tình Trạng Vận Hành Đội Xe
              </h3>
              <p className="text-xs text-slate-500">Phân bố trạng thái các xe trong hệ thống</p>
            </div>
            <Link
              href="/admin/cars"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Quản lý xe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Utilization Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Tỷ lệ xe đang sẵn sàng khai thác:</span>
              <span className="text-emerald-600">{Math.round((availableCars / totalCars) * 100)}% ({availableCars}/{totalCars} xe)</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(availableCars / totalCars) * 100}%` }}
                className="bg-emerald-500 h-full"
                title="Sẵn sàng"
              />
              <div
                style={{ width: `${(maintenanceCars / totalCars) * 100}%` }}
                className="bg-purple-500 h-full"
                title="Bảo dưỡng"
              />
            </div>
          </div>

          {/* Quick Fleet List */}
          <div className="divide-y divide-slate-100">
            {cars.slice(0, 4).map((car: any) => (
              <div key={car.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                    <CarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{car.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{car.licensePlate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(car.pricePerDay)}/ngày
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                      car.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {car.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Bảo dưỡng'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Module Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Truy Cập Nhanh Các Mục</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/admin/cars"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-400 text-gray-950">
                    <CarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      Quản Lý Đội Xe & Giá
                    </strong>
                    <span className="text-[11px] text-slate-500">Thêm xe, đổi trạng thái, sửa bảng giá</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/bookings"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500 text-white">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      Quản Lý Đơn Đặt Xe
                    </strong>
                    <span className="text-[11px] text-slate-500">Duyệt hồ sơ và xác nhận cọc</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500 text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      Khách Hàng & Phân Quyền
                    </strong>
                    <span className="text-[11px] text-slate-500">Xác thực GPLX, CCCD và quyền hạn</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Yêu Cầu Đặt Xe Gần Đây</h3>
            <p className="text-xs text-slate-500">Danh sách các hợp đồng thuê xe mới phát sinh</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
              <tr>
                <th className="py-3 px-4">Mã Đặt Xe</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Xe Thuê</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Chưa có đơn đặt xe nào gần đây
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id || b.bookingCode} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.bookingCode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{b.customerName}</td>
                    <td className="py-3.5 px-4">{b.carName}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.startDate ? new Date(b.startDate).toLocaleDateString('vi-VN') : ''} ({b.totalDays} ngày)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.status === 'CONFIRMED' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap">
                          Đã xác nhận
                        </span>
                      ) : b.status === 'PENDING' ? (
                        <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold whitespace-nowrap">
                          Chờ duyệt
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold whitespace-nowrap">
                          {b.status}
                        </span>
                      )}
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
