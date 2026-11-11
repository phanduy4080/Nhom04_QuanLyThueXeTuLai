'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Building2,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Car,
  Eye,
  FileText,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  incidentService,
  IncidentItem,
  IncidentStatus,
  IncidentType,
} from '@/services/incident.service';
import { IncidentClaimModal } from '@/components/incident/IncidentClaimModal';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.incidentType = filterType;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await incidentService.getIncidents(params);
      if (res?.data) {
        setIncidents(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, searchTerm]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'REPORTED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">Mới Báo Cáo</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">Đang Thẩm Tra</span>;
      case 'INSURANCE_PROCESSING':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">Bảo Hiểm Xử Lý</span>;
      case 'ASSESSMENT':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800">Giám Định</span>;
      case 'DISPUTED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800">Tranh Chấp</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">Đã Thỏa Thuận</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-800">Đã Đóng</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getTypeBadge = (type: IncidentType) => {
    switch (type) {
      case 'ACCIDENT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">Tai Nạn / Va Quẹt</span>;
      case 'BREAKDOWN':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Hỏng Hóc Xe</span>;
      case 'LOST_ACCESSORY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800">Mất Phụ Kiện</span>;
      case 'THEFT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">Mất Cắp</span>;
      case 'TRAFFIC_VIOLATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">Vi Phạm GT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">Khác</span>;
    }
  };

  // KPIs
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter((i) => ['REPORTED', 'UNDER_REVIEW'].includes(i.status)).length;
  const insuranceIncidents = incidents.filter((i) => ['INSURANCE_PROCESSING', 'ASSESSMENT'].includes(i.status)).length;
  const resolvedIncidents = incidents.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-rose-600" />
              Quản Lý Sự Cố & Hồ Sơ Bảo Hiểm
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
              Sprint 7 • US-18 & US-19
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận báo cáo sự cố khách hàng, làm việc với giám định bảo hiểm và phân định trách nhiệm chi phí
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchIncidents}
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          Làm Mới
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Tổng số sự cố</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalIncidents}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <p className="text-xs font-bold text-amber-700 uppercase">Chờ xử lý / Thẩm tra</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{pendingIncidents}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <p className="text-xs font-bold text-indigo-700 uppercase">Hồ sơ bảo hiểm</p>
          <p className="text-2xl font-black text-indigo-800 mt-1">{insuranceIncidents}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <p className="text-xs font-bold text-emerald-700 uppercase">Đã bồi thường xong</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{resolvedIncidents}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo mã sự cố, mã đơn, biển số xe, tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="REPORTED">Mới báo cáo</option>
            <option value="UNDER_REVIEW">Đang thẩm tra</option>
            <option value="INSURANCE_PROCESSING">Bảo hiểm đang xử lý</option>
            <option value="ASSESSMENT">Giám định thiệt hại</option>
            <option value="DISPUTED">Đang tranh chấp</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="CLOSED">Đã đóng</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="ALL">Tất cả loại sự cố</option>
            <option value="ACCIDENT">Tai nạn / Va chạm</option>
            <option value="BREAKDOWN">Hỏng hóc kỹ thuật</option>
            <option value="LOST_ACCESSORY">Mất phụ kiện</option>
            <option value="THEFT">Mất cắp</option>
            <option value="TRAFFIC_VIOLATION">Vi phạm giao thông</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase text-slate-600 tracking-wider">
                <th className="py-3.5 px-4">Mã Sự Cố / Đơn</th>
                <th className="py-3.5 px-4">Phương Tiện</th>
                <th className="py-3.5 px-4">Phân Loại & Tiêu Đề</th>
                <th className="py-3.5 px-4">Chi Phí Thiệt Hại</th>
                <th className="py-3.5 px-4">Bảo Hiểm (US-19)</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                    Đang tải danh sách hồ sơ sự cố...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy hồ sơ sự cố nào
                  </td>
                </tr>
              ) : (
                incidents.map((item) => (
                  <tr key={item.incidentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-mono font-bold text-rose-700 block">
                          {item.incidentCode}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Đơn: #{item.bookingCode}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.occurredAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-slate-900">{item.carName}</p>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.licensePlate}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.customerName}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="space-y-1">
                        <div>{getTypeBadge(item.incidentType)}</div>
                        <p className="font-bold text-slate-900 truncate" title={item.title}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1" title={item.location}>
                          📍 {item.location || 'Chưa rõ'}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-black text-slate-900 block">
                          {formatCurrency(item.totalDamageCost)}
                        </span>
                        <span className="text-[11px] text-rose-700 font-bold block">
                          Khách: {formatCurrency(item.customerShareAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Bảo hiểm: {formatCurrency(item.insuranceCoverageAmount)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="text-xs font-bold text-indigo-950 block">
                          {item.insurerName || 'Chưa nộp'}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-700">
                          {item.insuranceClaimNumber || 'Chưa có mã'}
                        </span>
                        <span className={`block text-[10px] font-bold ${item.insuranceStatus === 'APPROVED' ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {item.insuranceStatus}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedIncident(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xử Lý Hồ Sơ (US-19)</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* US-19: Modal Lập Hồ Sơ, Làm Việc Với Bảo Hiểm & Phân Định Trách Nhiệm Chi Phí */}
      <IncidentClaimModal
        incident={selectedIncident}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        onSuccess={() => {
          setSelectedIncident(null);
          fetchIncidents();
        }}
      />
    </div>
  );
}
