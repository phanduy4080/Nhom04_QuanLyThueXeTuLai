'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Car,
  Fuel,
  Zap,
  ChevronRight,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { carService } from '@/services/car.service';
import { VehicleModel, Brand, VehicleCategory, TransmissionType, FuelType } from '@/types';

interface ModelFormData {
  brandId: number;
  categoryId: number;
  name: string;
  variant: string;
  seats: number;
  doors: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  engineCc: number | '';
  powerHp: number | '';
  fuelTankLiters: number | '';
  batteryKwh: number | '';
  evRangeKm: number | '';
  trunkLiters: number | '';
  fuelConsumptionL100km: number | '';
  launchYear: number | '';
  isActive: boolean;
}

const DEFAULT_FALLBACK_BRANDS: Brand[] = [
  { brandId: 1, name: 'VinFast', country: 'Việt Nam', isActive: true },
  { brandId: 2, name: 'Toyota', country: 'Nhật Bản', isActive: true },
  { brandId: 3, name: 'Mazda', country: 'Nhật Bản', isActive: true },
  { brandId: 4, name: 'Hyundai', country: 'Hàn Quốc', isActive: true },
  { brandId: 5, name: 'Kia', country: 'Hàn Quốc', isActive: true },
  { brandId: 6, name: 'Honda', country: 'Nhật Bản', isActive: true },
  { brandId: 7, name: 'Mitsubishi', country: 'Nhật Bản', isActive: true },
];

const DEFAULT_FALLBACK_CATEGORIES: VehicleCategory[] = [
  { categoryId: 1, code: 'SEDAN', name: 'Sedan 4-5 chỗ', isActive: true },
  { categoryId: 2, code: 'SUV', name: 'SUV 5-7 chỗ', isActive: true },
  { categoryId: 3, code: 'MPV', name: 'MPV 7 chỗ gia đình', isActive: true },
  { categoryId: 4, code: 'EV', name: 'EV - Xe điện hiện đại', isActive: true },
  { categoryId: 5, code: 'HATCHBACK', name: 'Hatchback đô thị', isActive: true },
];

const defaultFormData: ModelFormData = {
  brandId: 1,
  categoryId: 1,
  name: '',
  variant: '',
  seats: 5,
  doors: 5,
  transmission: 'AUTOMATIC',
  fuelType: 'GASOLINE',
  engineCc: '',
  powerHp: '',
  fuelTankLiters: '',
  batteryKwh: '',
  evRangeKm: '',
  trunkLiters: '',
  fuelConsumptionL100km: '',
  launchYear: new Date().getFullYear(),
  isActive: true,
};

export default function AdminModelsPage() {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_FALLBACK_BRANDS);
  const [categories, setCategories] = useState<VehicleCategory[]>(DEFAULT_FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFuelType, setSelectedFuelType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  // Form
  const [formData, setFormData] = useState<ModelFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const fetchMetadata = async () => {
    try {
      const [brandsRes, catRes] = await Promise.allSettled([
        carService.getBrands(),
        carService.getCategories(),
      ]);
      if (brandsRes.status === 'fulfilled' && brandsRes.value?.data?.length) {
        setBrands(brandsRes.value.data);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.data?.length) {
        setCategories(catRes.value.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục/hãng:', err);
    }
  };

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await carService.getModels({
        includeInactive: true,
        search: searchTerm || undefined,
        brandId: selectedBrand !== 'ALL' ? Number(selectedBrand) : undefined,
        categoryId: selectedCategory !== 'ALL' ? Number(selectedCategory) : undefined,
      });
      if (res.data) {
        setModels(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách dòng xe');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBrand, selectedCategory]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleOpenAdd = () => {
    setSelectedModel(null);
    const activeBrands = brands.length > 0 ? brands : DEFAULT_FALLBACK_BRANDS;
    const activeCats = categories.length > 0 ? categories : DEFAULT_FALLBACK_CATEGORIES;
    setFormData({
      ...defaultFormData,
      brandId: activeBrands[0]?.brandId || 1,
      categoryId: activeCats[0]?.categoryId || 1,
    });
    setShowAddModal(true);
    fetchMetadata();
  };

  const handleOpenEdit = (model: VehicleModel) => {
    setSelectedModel(model);
    setFormData({
      brandId: model.brandId,
      categoryId: model.categoryId,
      name: model.name,
      variant: model.variant || '',
      seats: model.seats,
      doors: model.doors || 5,
      transmission: model.transmission,
      fuelType: model.fuelType,
      engineCc: model.engineCc ?? '',
      powerHp: model.powerHp ?? '',
      fuelTankLiters: model.fuelTankLiters ? Number(model.fuelTankLiters) : '',
      batteryKwh: model.batteryKwh ? Number(model.batteryKwh) : '',
      evRangeKm: model.evRangeKm ?? '',
      trunkLiters: model.trunkLiters ?? '',
      fuelConsumptionL100km: model.fuelConsumptionL100km ? Number(model.fuelConsumptionL100km) : '',
      launchYear: model.launchYear ?? new Date().getFullYear(),
      isActive: model.isActive,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (model: VehicleModel) => {
    setSelectedModel(model);
    setShowDeleteModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên dòng xe');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        brandId: Number(formData.brandId),
        categoryId: Number(formData.categoryId),
        name: formData.name.trim(),
        variant: formData.variant.trim(),
        seats: Number(formData.seats),
        doors: formData.doors ? Number(formData.doors) : undefined,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        engineCc: formData.engineCc !== '' ? Number(formData.engineCc) : undefined,
        powerHp: formData.powerHp !== '' ? Number(formData.powerHp) : undefined,
        fuelTankLiters: formData.fuelTankLiters !== '' ? Number(formData.fuelTankLiters) : undefined,
        batteryKwh: formData.batteryKwh !== '' ? Number(formData.batteryKwh) : undefined,
        evRangeKm: formData.evRangeKm !== '' ? Number(formData.evRangeKm) : undefined,
        trunkLiters: formData.trunkLiters !== '' ? Number(formData.trunkLiters) : undefined,
        fuelConsumptionL100km:
          formData.fuelConsumptionL100km !== '' ? Number(formData.fuelConsumptionL100km) : undefined,
        launchYear: formData.launchYear !== '' ? Number(formData.launchYear) : undefined,
        isActive: formData.isActive,
      };

      if (showEditModal && selectedModel) {
        await carService.updateModel(selectedModel.modelId, payload);
        toast.success(`Cập nhật dòng xe "${formData.name}" thành công!`);
        setShowEditModal(false);
      } else {
        await carService.createModel(payload);
        toast.success(`Tạo dòng xe mới thành công!`);
        setShowAddModal(false);
      }
      fetchModels();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedModel) return;
    try {
      setSubmitting(true);
      const res = await carService.deleteModel(selectedModel.modelId);
      toast.success(res.message || 'Đã xử lý dòng xe');
      setShowDeleteModal(false);
      fetchModels();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa dòng xe');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (selectedFuelType !== 'ALL' && m.fuelType !== selectedFuelType) return false;
      if (selectedStatus === 'ACTIVE' && !m.isActive) return false;
      if (selectedStatus === 'INACTIVE' && m.isActive) return false;
      return true;
    });
  }, [models, selectedFuelType, selectedStatus]);

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedBrand !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedFuelType !== 'ALL' ||
    selectedStatus !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('ALL');
    setSelectedCategory('ALL');
    setSelectedFuelType('ALL');
    setSelectedStatus('ALL');
  };

  // Metrics
  const totalModels = models.length;
  const activeModels = models.filter((m) => m.isActive).length;
  const evCount = models.filter((m) => m.fuelType === 'ELECTRIC').length;
  const totalVehiclesAssigned = models.reduce((acc, m) => acc + (m._count?.vehicles || 0), 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Bar: Clean & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/admin/cars" className="hover:text-slate-900 transition-colors">
              Đội xe
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">Dòng xe (Models)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Dòng Xe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Danh mục dòng xe, thông số kỹ thuật tiêu chuẩn và tỷ lệ gán phương tiện
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchModels}
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
            Thêm dòng xe mới
          </Button>
        </div>
      </div>

      {/* 2. Sleek KPI Metrics Row (Unified & Clean, no noisy colored blocks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Tổng dòng xe
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalModels}</span>
            <span className="text-xs text-slate-500 font-medium">model</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            {activeModels} dòng đang áp dụng
          </span>
        </div>

        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Dòng xe điện (EV)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{evCount}</span>
            <span className="text-xs text-slate-500 font-medium">
              ({totalModels > 0 ? Math.round((evCount / totalModels) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Xe thuần điện không phát thải
          </span>
        </div>

        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Xăng & Hybrid
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalModels - evCount}</span>
            <span className="text-xs text-slate-500 font-medium">
              ({totalModels > 0 ? Math.round(((totalModels - evCount) / totalModels) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Động cơ truyền thống & lai
          </span>
        </div>

        <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Xe thực tế trong đội
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalVehiclesAssigned}</span>
            <span className="text-xs text-slate-500 font-medium">xe đang gán</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Đang phân bổ theo các model
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar: Clean White Strip */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên xe (VF 8, Vios...), hãng xe, phiên bản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-9 px-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-700"
          >
            <option value="ALL">Hãng: Tất cả</option>
            {brands.map((b) => (
              <option key={b.brandId} value={b.brandId}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-700"
          >
            <option value="ALL">Phân khúc: Tất cả</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedFuelType}
            onChange={(e) => setSelectedFuelType(e.target.value)}
            className="h-9 px-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-700"
          >
            <option value="ALL">Nhiên liệu: Tất cả</option>
            <option value="ELECTRIC">Điện (EV)</option>
            <option value="GASOLINE">Xăng</option>
            <option value="DIESEL">Dầu Diesel</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-amber-400 font-medium text-slate-700"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
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

      {/* 4. Table: Clean, Minimalist, High Scanability */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Dòng xe & Phiên bản</th>
                <th className="py-3 px-4">Hãng & Phân khúc</th>
                <th className="py-3 px-4">Cấu hình</th>
                <th className="py-3 px-4">Thông số vận hành</th>
                <th className="py-3 px-4 text-center">Xe trong đội</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Đang tải danh sách dòng xe...</span>
                  </td>
                </tr>
              ) : filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Layers className="w-7 h-7 mx-auto mb-1.5 text-slate-300" />
                    <span>Không tìm thấy dòng xe nào phù hợp</span>
                  </td>
                </tr>
              ) : (
                filteredModels.map((m) => (
                  <tr key={m.modelId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Dòng xe & Biến thể */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                          {m.brand?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {m.launchYear && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                • {m.launchYear}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {m.variant || 'Tiêu chuẩn'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Hãng & Phân khúc */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{m.brand?.name}</span>
                      <span className="text-[11px] text-slate-500">{m.category?.name}</span>
                    </td>

                    {/* Cấu hình (Chỗ & Hộp số) */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">
                        {m.seats} chỗ {m.doors ? `• ${m.doors} cửa` : ''}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {m.transmission === 'AUTOMATIC' ? 'Số tự động' : 'Số sàn'}
                      </span>
                    </td>

                    {/* Thông số vận hành (Clean tag) */}
                    <td className="py-3.5 px-4">
                      {m.fuelType === 'ELECTRIC' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            <Zap className="w-2.5 h-2.5" />
                            <span>Pin {m.batteryKwh ? `${m.batteryKwh} kWh` : 'N/A'}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Tầm xa: {m.evRangeKm ? `${m.evRangeKm} km` : 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Fuel className="w-2.5 h-2.5 text-slate-500" />
                            <span>{m.fuelType === 'DIESEL' ? 'Dầu' : m.fuelType === 'HYBRID' ? 'Hybrid' : 'Xăng'}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {m.fuelConsumptionL100km ? `${m.fuelConsumptionL100km}L/100km` : 'Bình tiêu chuẩn'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Số xe trong đội */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                        <span>{m._count?.vehicles ?? 0} xe</span>
                      </span>
                    </td>

                    {/* Trạng thái (Minimal dot badge) */}
                    <td className="py-3.5 px-4 text-center">
                      {m.isActive ? (
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
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(m)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Xóa / Ngưng hoạt động"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Clean Modal: Thêm / Sửa Dòng Xe */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {showEditModal ? 'Cập nhật dòng xe' : 'Thêm dòng xe mới'}
                </h3>
                <p className="text-xs text-slate-500">
                  Cấu hình các thông số tiêu chuẩn áp dụng cho đội xe
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
              {/* Nhóm 1: Cơ bản */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  1. Thông tin hãng & model
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hãng xe <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      required
                    >
                      {(brands.length > 0 ? brands : DEFAULT_FALLBACK_BRANDS).map((b) => (
                        <option key={b.brandId} value={b.brandId}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phân khúc <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      required
                    >
                      {(categories.length > 0 ? categories : DEFAULT_FALLBACK_CATEGORIES).map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên dòng xe <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: VF 8, Vios, CX-5..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phiên bản / Biến thể
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Plus, 1.5G, Premium..."
                      value={formData.variant}
                      onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 2: Cấu hình vận hành */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  2. Cấu hình vận hành
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số chỗ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số cửa</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={formData.doors}
                      onChange={(e) => setFormData({ ...formData, doors: Number(e.target.value) })}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hộp số</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) =>
                        setFormData({ ...formData, transmission: e.target.value as TransmissionType })
                      }
                      className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    >
                      <option value="AUTOMATIC">Tự động</option>
                      <option value="MANUAL">Số sàn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nhiên liệu</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) =>
                        setFormData({ ...formData, fuelType: e.target.value as FuelType })
                      }
                      className="w-full h-9 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    >
                      <option value="ELECTRIC">Điện (EV)</option>
                      <option value="GASOLINE">Xăng</option>
                      <option value="DIESEL">Dầu</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nhóm 3: Thông số kỹ thuật theo nhiên liệu */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  3. Thông số kỹ thuật chi tiết
                </span>

                {formData.fuelType === 'ELECTRIC' ? (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Dung lượng pin (kWh)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="VD: 87.7"
                        value={formData.batteryKwh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            batteryKwh: e.target.value ? Number(e.target.value) : '',
                          })
                        }
                        className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tầm xa km / lần sạc
                      </label>
                      <input
                        type="number"
                        placeholder="VD: 471"
                        value={formData.evRangeKm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            evRangeKm: e.target.value ? Number(e.target.value) : '',
                          })
                        }
                        className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Dung tích (cc)
                      </label>
                      <input
                        type="number"
                        placeholder="VD: 1998"
                        value={formData.engineCc}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            engineCc: e.target.value ? Number(e.target.value) : '',
                          })
                        }
                        className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bình xăng (L)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="VD: 55"
                        value={formData.fuelTankLiters}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fuelTankLiters: e.target.value ? Number(e.target.value) : '',
                          })
                        }
                        className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiêu hao (L/100km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="VD: 6.5"
                        value={formData.fuelConsumptionL100km}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fuelConsumptionL100km: e.target.value ? Number(e.target.value) : '',
                          })
                        }
                        className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Công suất (HP)
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 150"
                      value={formData.powerHp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          powerHp: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Năm phiên bản
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 2024"
                      value={formData.launchYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          launchYear: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 4: Trạng thái */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Kích hoạt dòng xe này cho phép thêm xe và cho thuê</span>
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
                  {showEditModal ? 'Lưu thay đổi' : 'Tạo dòng xe'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Clean Modal: Xác Nhận Xóa */}
      {showDeleteModal && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Xác nhận xóa dòng xe
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn có chắc muốn xóa dòng xe{' '}
              <span className="font-semibold text-slate-900">
                {selectedModel.brand?.name} {selectedModel.name}
              </span>
              ?
            </p>

            {(selectedModel._count?.vehicles || 0) > 0 ? (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Dòng xe đang có <strong>{selectedModel._count?.vehicles} xe</strong> trong hệ thống. Sẽ tự động chuyển sang <strong>Tạm ngưng</strong> để giữ an toàn dữ liệu.
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">
                Dòng xe chưa có xe nào gán và sẽ được xóa hoàn toàn.
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
                {(selectedModel._count?.vehicles || 0) > 0 ? 'Tạm ngưng' : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
