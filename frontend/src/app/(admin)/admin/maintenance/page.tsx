'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Gauge,
  Search,
  RefreshCw,
  Car,
  Filter,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  rentalService,
  MaintenanceAlertsResponse,
  VehicleMaintenanceAlert,
} from '@/services/rental.service';

export default function AdminMaintenancePage() {
  const [data, setData] = useState<MaintenanceAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INSPECTING'>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rentalService.getMaintenanceAlerts();
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể tải dữ liệu cảnh báo bảo dưỡng & bảo hiểm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkReady = async (vehicleId: number, licensePlate: string) => {
    try {
      setActionLoading(vehicleId);
      const res = await rentalService.markVehicleReady(vehicleId);
      toast.success(res.message || `Xe ${licensePlate} đã sẵn sàng cho thuê (AVAILABLE)!`);
      fetchAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVehicles = (data?.vehicles || []).filter((v) => {
    const matchesSearch =
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.branchName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterSeverity === 'CRITICAL') return v.overallSeverity === 'CRITICAL';
    if (filterSeverity === 'WARNING') return v.overallSeverity === 'WARNING';
    if (filterSeverity === 'INSPECTING') return v.status === 'INSPECTING';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
            <span className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
              <Wrench className="w-6 h-6" />
            </span>
            <span>Bảo Dưỡng & Cảnh Báo Bảo Hiểm (Sprint 11 - US-27)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi hạn bảo hiểm, đăng kiểm & chu kỳ bảo dưỡng xe theo km, nhận cảnh báo tự động
          </p>
        </div>

        <Button
          onClick={fetchAlerts}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto flex items-center space-x-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Đội Xe</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {data?.summary.totalVehicles || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Đang hoạt động trên hệ thống</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setFilterSeverity('CRITICAL')}
          className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-400 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Cảnh Báo Nguy Cấp</p>
            <h3 className="text-3xl font-black text-red-600 mt-1">
              {data?.summary.criticalAlerts || 0}
            </h3>
            <p className="text-xs text-red-500 mt-1">Hạn &le; 7 ngày hoặc &le; 300 km</p>
          </div>
          <div className="p-3 bg-red-100 text-red-700 rounded-xl animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setFilterSeverity('WARNING')}
          className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Cần Lưu Ý Sớm</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">
              {data?.summary.warningAlerts || 0}
            </h3>
            <p className="text-xs text-amber-600 mt-1">Hạn &le; 30 ngày hoặc &le; 1.000 km</p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setFilterSeverity('ALL')}
          className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Đội Xe An Toàn</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">
              {data?.summary.safeCount || 0}
            </h3>
            <p className="text-xs text-emerald-600 mt-1">Bảo hiểm & bảo dưỡng đầy đủ</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm theo biển số, dòng xe, chi nhánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={filterSeverity === 'ALL' ? 'primary' : 'outline'}
            onClick={() => setFilterSeverity('ALL')}
            className="text-xs"
          >
            Tất cả ({data?.vehicles.length || 0})
          </Button>
          <Button
            size="sm"
            variant={filterSeverity === 'CRITICAL' ? 'danger' : 'outline'}
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`text-xs ${filterSeverity === 'CRITICAL' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 border-red-200'}`}
          >
            Nguy cấp ({data?.summary.criticalAlerts || 0})
          </Button>
          <Button
            size="sm"
            variant={filterSeverity === 'WARNING' ? 'primary' : 'outline'}
            onClick={() => setFilterSeverity('WARNING')}
            className={`text-xs ${filterSeverity === 'WARNING' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-amber-700 border-amber-200'}`}
          >
            Lưu ý ({data?.summary.warningAlerts || 0})
          </Button>
          <Button
            size="sm"
            variant={filterSeverity === 'INSPECTING' ? 'primary' : 'outline'}
            onClick={() => setFilterSeverity('INSPECTING')}
            className="text-xs border-indigo-200 text-indigo-700"
          >
            Đang kiểm tra/vệ sinh (US-26)
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Phương tiện & Chi nhánh</th>
                <th className="px-4 py-3.5">ODO Hiện tại</th>
                <th className="px-4 py-3.5">Hạn Bảo Hiểm Dân Sự</th>
                <th className="px-4 py-3.5">Hạn Đăng Kiểm Kỹ Thuật</th>
                <th className="px-4 py-3.5">Bảo Dưỡng Định Kỳ</th>
                <th className="px-4 py-3.5">Trạng thái xe</th>
                <th className="px-5 py-3.5 text-right">Thao tác (US-26)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Không tìm thấy phương tiện nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.vehicleId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Xe & Chi nhánh */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                          <Car className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{v.carName}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {v.licensePlate}
                            </span>
                            <span className="text-xs text-slate-500">{v.branchName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ODO */}
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-slate-800 flex items-center space-x-1.5">
                        <Gauge className="w-4 h-4 text-slate-400" />
                        <span>{v.odometerKm.toLocaleString('vi-VN')} km</span>
                      </div>
                    </td>

                    {/* Bảo hiểm */}
                    <td className="px-4 py-4">
                      {v.insuranceExpiryDate ? (
                        <div>
                          <p className="text-xs font-medium text-slate-800">{v.insuranceExpiryDate}</p>
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                              v.insuranceStatus === 'CRITICAL'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : v.insuranceStatus === 'WARNING'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {v.daysToInsurance !== null && v.daysToInsurance <= 0
                              ? 'Đã hết hạn!'
                              : `Còn ${v.daysToInsurance} ngày`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa cập nhật</span>
                      )}
                    </td>

                    {/* Đăng kiểm */}
                    <td className="px-4 py-4">
                      {v.inspectionExpiryDate ? (
                        <div>
                          <p className="text-xs font-medium text-slate-800">{v.inspectionExpiryDate}</p>
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                              v.inspectionStatus === 'CRITICAL'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : v.inspectionStatus === 'WARNING'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {v.daysToInspection !== null && v.daysToInspection <= 0
                              ? 'Đã hết hạn!'
                              : `Còn ${v.daysToInspection} ngày`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa cập nhật</span>
                      )}
                    </td>

                    {/* Bảo dưỡng km */}
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-xs text-slate-600">
                          Mốc: <span className="font-mono font-bold text-slate-800">{v.nextMaintenanceKm.toLocaleString('vi-VN')} km</span>
                        </p>
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                            v.maintenanceStatus === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                              : v.maintenanceStatus === 'WARNING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {v.kmRemaining <= 0 ? 'Đã quá hạn km!' : `Còn ${v.kmRemaining} km`}
                        </span>
                      </div>
                    </td>

                    {/* Trạng thái xe */}
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          v.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'RENTED'
                            ? 'bg-blue-100 text-blue-800'
                            : v.status === 'INSPECTING'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.status === 'AVAILABLE'
                          ? 'Sẵn sàng'
                          : v.status === 'RENTED'
                          ? 'Đang cho thuê'
                          : v.status === 'INSPECTING'
                          ? 'Vệ sinh/kỹ thuật'
                          : 'Bảo dưỡng'}
                      </span>
                    </td>

                    {/* Thao tác (US-26) */}
                    <td className="px-5 py-4 text-right">
                      {v.status === 'INSPECTING' || v.status === 'MAINTENANCE' ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkReady(v.vehicleId, v.licensePlate)}
                          disabled={actionLoading === v.vehicleId}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          {actionLoading === v.vehicleId ? (
                            'Đang xử lý...'
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Sẵn Sàng Cho Thuê (US-26)
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Đã sẵn sàng</span>
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
