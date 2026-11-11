'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Car,
  Calendar,
  AlertTriangle,
  RefreshCw,
  PieChart,
  Percent,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { rentalService, ExecutiveReportResponse } from '@/services/rental.service';

export default function AdminReportsPage() {
  const [data, setData] = useState<ExecutiveReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rentalService.getExecutiveReport();
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể tải báo cáo thống kê quản trị');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo Cáo & Thống Kê Quản Trị
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng quan doanh thu, lượt thuê, tỷ lệ khai thác đội xe, thống kê sự cố/bảo hiểm và các dòng xe thịnh hành
          </p>
        </div>

        <Button
          onClick={fetchReports}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto flex items-center space-x-2"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* KPI Cards: Doanh thu & Lượt thuê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng doanh thu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">Tổng Doanh Thu</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {formatCurrency(data?.overview.totalRevenue || 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Thuê gốc, gia hạn và phụ phí
          </p>
        </div>

        {/* Tỷ lệ khai thác xe */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">Tỷ Lệ Khai Thác Đội Xe</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1 tracking-tight">
            {data?.overview.fleetUtilizationRate || 0}%
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {data?.fleetStatus.rentedCars || 0} / {data?.fleetStatus.totalFleet || 0} xe đang lăn bánh
          </p>
        </div>

        {/* Lượt thuê hoàn tất */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">Đơn Thuê Hoàn Tất</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {data?.overview.completedBookings || 0}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Trên tổng số {data?.overview.totalBookings || 0} đơn đặt xe
          </p>
        </div>

        {/* Tỷ lệ hủy/từ chối */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-xs uppercase font-medium text-slate-500 tracking-wider">Tỷ Lệ Hủy / Từ Chối</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1 tracking-tight">
            {data?.overview.cancellationRate || 0}%
          </h3>
          <p className="text-xs text-slate-400 mt-1">Đơn bị huỷ hoặc không đạt yêu cầu</p>
        </div>
      </div>

      {/* Grid 2 Cột: Chi tiết Phân bố Đội xe & Yêu cầu Gia hạn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân bố Đội xe */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Car className="w-5 h-5 text-indigo-600" />
            <span>Phân Bố Trạng Thái Đội Xe (Fleet Status)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 text-center">
              <p className="text-xs text-blue-600 font-semibold">Đang Cho Thuê</p>
              <h4 className="text-2xl font-black text-blue-700 mt-1 font-mono">
                {data?.fleetStatus.rentedCars || 0}
              </h4>
              <p className="text-[11px] text-blue-600/80 mt-0.5">RENTED</p>
            </div>

            <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200/60 text-center">
              <p className="text-xs text-purple-600 font-semibold">Vệ Sinh / Kỹ Thuật</p>
              <h4 className="text-2xl font-black text-purple-700 mt-1 font-mono">
                {data?.fleetStatus.inspectingCars || 0}
              </h4>
              <p className="text-[11px] text-purple-600/80 mt-0.5">INSPECTING</p>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 text-center">
              <p className="text-xs text-emerald-600 font-semibold">Sẵn Sàng Cho Thuê</p>
              <h4 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {data?.fleetStatus.availableCars || 0}
              </h4>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">AVAILABLE</p>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-center">
              <p className="text-xs text-amber-600 font-semibold">Đang Bảo Dưỡng</p>
              <h4 className="text-2xl font-black text-amber-700 mt-1 font-mono">
                {data?.fleetStatus.maintenanceCars || 0}
              </h4>
              <p className="text-[11px] text-amber-600/80 mt-0.5">MAINTENANCE</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng phương tiện quản lý:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {data?.fleetStatus.totalFleet || 0} xe
            </span>
          </div>
        </div>

        {/* Thống kê Gia hạn thời gian thuê (Sprint 6) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Thống Kê Gia Hạn Hợp Đồng Thuê (Sprint 6)</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">Tổng yêu cầu</p>
              <h4 className="text-xl font-bold text-slate-800 mt-1 font-mono">
                {data?.extensions.totalRequests || 0}
              </h4>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-700">Đã chấp thuận</p>
              <h4 className="text-xl font-bold text-emerald-700 mt-1 font-mono">
                {data?.extensions.approvedCount || 0}
              </h4>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <p className="text-xs text-rose-700">Bị từ chối</p>
              <h4 className="text-xl font-bold text-rose-700 mt-1 font-mono">
                {data?.extensions.rejectedCount || 0}
              </h4>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Doanh thu bổ sung từ gia hạn:</span>
            <span className="font-bold text-emerald-700 font-mono text-base">
              +{formatCurrency(data?.extensions.extraRevenue || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid 2 Cột: Sự cố & Bảo hiểm vs Top xe thuê nhiều nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thống kê Sự cố & Bồi thường Bảo hiểm (Sprint 7 & 9) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Thống Kê Sự Cố & Chi Phí Bồi Thường (Sprint 7 & 9)</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
              <span className="font-medium text-slate-600">Tổng số vụ sự cố ghi nhận</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {data?.incidents.totalIncidents || 0} vụ
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl text-xs text-red-950">
              <span className="font-medium">Tổng giá trị thiệt hại thẩm định</span>
              <span className="font-bold font-mono text-sm">
                {formatCurrency(data?.incidents.totalDamageCost || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl text-xs text-blue-950">
              <span className="font-medium">Bảo hiểm chi trả bồi thường</span>
              <span className="font-bold font-mono text-sm text-blue-700">
                {formatCurrency(data?.incidents.insuranceCovered || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl text-xs text-amber-950">
              <span className="font-medium">Khách hàng bồi hoàn trách nhiệm</span>
              <span className="font-bold font-mono text-sm text-amber-800">
                {formatCurrency(data?.incidents.customerCompensation || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Top 5 dòng xe thuê nhiều nhất */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Top Dòng Xe Được Thuê Nhiều Nhất</span>
          </h3>

          <div className="space-y-3 pt-1">
            {(!data?.topRentedModels || data.topRentedModels.length === 0) ? (
              <p className="text-center text-slate-400 py-8 text-xs">Chưa có dữ liệu thuê xe</p>
            ) : (
              data.topRentedModels.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{m.brand} {m.modelName}</p>
                      <p className="text-[11px] text-slate-500">{m.count} lượt thuê hoàn tất</p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                    {formatCurrency(m.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

