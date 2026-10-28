'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  X,
  Building2,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { carService } from '@/services/car.service';
import { Branch } from '@/types';

interface BranchFormData {
  code: string;
  name: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  phone: string;
  email: string;
  latitude: number | '';
  longitude: number | '';
  openTime: string;
  closeTime: string;
  isPickupPoint: boolean;
  isActive: boolean;
}

const defaultFormData: BranchFormData = {
  code: '',
  name: '',
  addressLine: '',
  ward: '',
  district: '',
  province: 'Hồ Chí Minh',
  phone: '',
  email: '',
  latitude: '',
  longitude: '',
  openTime: '07:00',
  closeTime: '21:00',
  isPickupPoint: true,
  isActive: true,
};

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Form State
  const [formData, setFormData] = useState<BranchFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await carService.getBranches({
        includeInactive: true,
        search: searchTerm || undefined,
        province: selectedProvince !== 'ALL' ? selectedProvince : undefined,
      });
      if (res.data) {
        setBranches(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách chi nhánh trạm xe');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedProvince]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const provinces = useMemo(() => {
    return Array.from(new Set(branches.map((b) => b.province))).filter(Boolean);
  }, [branches]);

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setFormData(defaultFormData);
    setShowAddModal(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    const hour = branch.branchHours?.[0];
    setFormData({
      code: branch.code,
      name: branch.name,
      addressLine: branch.addressLine,
      ward: branch.ward || '',
      district: branch.district || '',
      province: branch.province,
      phone: branch.phone || '',
      email: branch.email || '',
      latitude: branch.latitude ? Number(branch.latitude) : '',
      longitude: branch.longitude ? Number(branch.longitude) : '',
      openTime: hour?.openTime || '07:00',
      closeTime: hour?.closeTime || '21:00',
      isPickupPoint: branch.isPickupPoint,
      isActive: branch.isActive,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim() || !formData.addressLine.trim() || !formData.province.trim()) {
      toast.error('Vui lòng điền đầy đủ mã, tên, địa chỉ và tỉnh/thành phố');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        addressLine: formData.addressLine.trim(),
        ward: formData.ward.trim() || undefined,
        district: formData.district.trim() || undefined,
        province: formData.province.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        latitude: formData.latitude !== '' ? Number(formData.latitude) : undefined,
        longitude: formData.longitude !== '' ? Number(formData.longitude) : undefined,
        openTime: formData.openTime || '07:00',
        closeTime: formData.closeTime || '21:00',
        isPickupPoint: formData.isPickupPoint,
        isActive: formData.isActive,
      };

      if (showEditModal && selectedBranch) {
        await carService.updateBranch(selectedBranch.branchId, payload);
        toast.success(`Cập nhật chi nhánh "${formData.name}" thành công!`);
        setShowEditModal(false);
      } else {
        await carService.createBranch(payload);
        toast.success(`Tạo trạm xe mới thành công!`);
        setShowAddModal(false);
      }
      fetchBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin chi nhánh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBranch) return;
    try {
      setSubmitting(true);
      const res = await carService.deleteBranch(selectedBranch.branchId);
      toast.success(res.message || 'Đã xử lý chi nhánh');
      setShowDeleteModal(false);
      fetchBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa chi nhánh');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (selectedStatus === 'ACTIVE' && !b.isActive) return false;
      if (selectedStatus === 'INACTIVE' && b.isActive) return false;
      return true;
    });
  }, [branches, selectedStatus]);

  const hasActiveFilters = searchTerm !== '' || selectedProvince !== 'ALL' || selectedStatus !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProvince('ALL');
    setSelectedStatus('ALL');
  };

  // Metrics
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.isActive).length;
  const pickupCount = branches.filter((b) => b.isPickupPoint && b.isActive).length;
  const totalFleetInBranches = branches.reduce((acc, b) => acc + (b._count?.vehicles || 0), 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header: Clean & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/admin/cars" className="hover:text-slate-900 transition-colors">
              Đội xe
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">Chi nhánh & Trạm xe</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Chi Nhánh & Trạm Xe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mạng lưới điểm giao nhận xe, trạm bãi lưu đậu và hotline hỗ trợ khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBranches}
            leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            className="text-xs font-semibold"
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-semibold shadow-xs"
          >
            Thêm trạm xe mới
          </Button>
        </div>
      </div>

      {/* 2. Sleek KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Tổng trạm & chi nhánh
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalBranches}</span>
            <span className="text-xs text-slate-500 font-medium">điểm</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            {activeBranches} trạm đang vận hành
          </span>
        </div>

        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Điểm nhận xe tại chỗ
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{pickupCount}</span>
            <span className="text-xs text-slate-500 font-medium">trạm giao nhận</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Có nhân viên bàn giao trực tiếp
          </span>
        </div>

        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Xe đang lưu đậu
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalFleetInBranches}</span>
            <span className="text-xs text-slate-500 font-medium">xe</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Phân bổ trên toàn hệ thống bãi
          </span>
        </div>

        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Tỉnh / Thành phố
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{provinces.length}</span>
            <span className="text-xs text-slate-500 font-medium">khu vực</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Độ phủ sóng thị trường
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên trạm, mã (CN_SGN...), địa chỉ, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="h-9 px-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-700"
          >
            <option value="ALL">Khu vực: Tất cả</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-700"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngưng</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-9 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Table: Minimal, Clean & Scan-friendly */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tên trạm xe & Mã</th>
                <th className="py-3 px-4">Địa chỉ & Khu vực</th>
                <th className="py-3 px-4">Hotline & Email</th>
                <th className="py-3 px-4">Giờ làm việc</th>
                <th className="py-3 px-4 text-center">Xe tại trạm</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Đang tải danh sách trạm xe...</span>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-7 h-7 mx-auto mb-1.5 text-slate-300" />
                    <span>Không tìm thấy chi nhánh trạm xe nào</span>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b) => {
                  const hour = b.branchHours?.[0];
                  return (
                    <tr key={b.branchId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Tên & Mã */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                            <MapPin className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{b.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {b.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Địa chỉ */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-1 block">
                          {b.addressLine}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{[b.ward, b.district, b.province].filter(Boolean).join(', ')}</span>
                          {b.latitude && b.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-0.5 shrink-0"
                              title="Xem vị trí trên Google Maps"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Map</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="py-3.5 px-4">
                        {b.phone ? (
                          <span className="font-medium text-slate-800 block">{b.phone}</span>
                        ) : (
                          <span className="text-slate-400 block">—</span>
                        )}
                        {b.email && (
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                            {b.email}
                          </span>
                        )}
                      </td>

                      {/* Giờ làm việc */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {hour?.openTime || '07:00'} - {hour?.closeTime || '21:00'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {b.isPickupPoint ? 'Điểm nhận trực tiếp' : 'Văn phòng hành chính'}
                        </span>
                      </td>

                      {/* Xe tại trạm */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {b._count?.vehicles ?? 0} xe
                        </span>
                      </td>

                      {/* Trạng thái (Minimal dot badge) */}
                      <td className="py-3.5 px-4 text-center">
                        {b.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>Tạm ngưng</span>
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Chỉnh sửa trạm xe"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Xóa / Ngưng hoạt động"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Clean Modal: Thêm / Sửa Chi Nhánh */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {showEditModal ? 'Cập nhật chi nhánh trạm xe' : 'Thêm chi nhánh trạm xe mới'}
                </h3>
                <p className="text-xs text-slate-500">
                  Thông tin địa chỉ trạm, giờ mở cửa và hotline tiếp đón
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              {/* Nhóm 1: Mã & Tên */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã trạm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: CN_SGN_03"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono font-bold uppercase"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên trạm / chi nhánh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Trạm Xe Quận 7 - Phú Mỹ Hưng"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Nhóm 2: Địa chỉ chi tiết */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ số nhà & tên đường <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 101 Nguyễn Lương Bằng"
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phường / Xã</label>
                    <input
                      type="text"
                      placeholder="VD: P. Tân Phú"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quận / Huyện</label>
                    <input
                      type="text"
                      placeholder="VD: Quận 7"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tỉnh / TP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Hồ Chí Minh"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 3: Hotline & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại hotline</label>
                  <input
                    type="text"
                    placeholder="VD: 02854112233"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email tiếp nhận</label>
                  <input
                    type="email"
                    placeholder="VD: q7@quickhatch.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>
              </div>

              {/* Nhóm 4: Tọa độ GPS & Giờ mở cửa */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vĩ độ (Lat)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="VD: 10.728"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kinh độ (Lng)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="VD: 106.721"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ mở cửa</label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ đóng cửa</label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>
              </div>

              {/* Nhóm 5: Tùy chọn Checkbox */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPickupPoint}
                    onChange={(e) => setFormData({ ...formData, isPickupPoint: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Cho phép khách hàng trực tiếp đến nhận & trả xe tại trạm này</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Kích hoạt trạm xe hoạt động trên toàn hệ thống</span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="text-xs font-semibold">
                  {showEditModal ? 'Lưu thay đổi' : 'Tạo trạm xe'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Clean Modal: Xác Nhận Xóa */}
      {showDeleteModal && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Xác nhận xóa chi nhánh
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn có chắc muốn xóa chi nhánh{' '}
              <span className="font-semibold text-slate-900">
                {selectedBranch.name}
              </span>{' '}
              ({selectedBranch.code})?
            </p>

            {(selectedBranch._count?.vehicles || 0) > 0 || (selectedBranch._count?.bookingsPickup || 0) > 0 ? (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Trạm đang có <strong>{selectedBranch._count?.vehicles || 0} xe</strong> và{' '}
                <strong>{selectedBranch._count?.bookingsPickup || 0} đơn đặt</strong>. Sẽ tự động chuyển sang <strong>Tạm ngưng</strong> để bảo toàn lịch sử.
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">
                Trạm chưa có dữ liệu liên kết và sẽ được xóa hoàn toàn.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                className="text-xs"
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={submitting}
                className="text-xs"
              >
                {(selectedBranch._count?.vehicles || 0) > 0 ||
                (selectedBranch._count?.bookingsPickup || 0) > 0
                  ? 'Tạm ngưng'
                  : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
