'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Car,
  Check,
  UploadCloud,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { carService } from '@/services/car.service';
import { Brand } from '@/types';
import BrandLogo from '@/components/common/BrandLogo';

interface BrandFormData {
  name: string;
  country: string;
  logoUrl: string;
  isActive: boolean;
}

const defaultFormData: BrandFormData = {
  name: '',
  country: '',
  logoUrl: '',
  isActive: true,
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await carService.getBrands(true);
      if (res?.data) {
        setBrands(res.data);
      }
    } catch (err: any) {
      toast.error('Không thể tải danh sách hãng xe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      country: brand.country || '',
      logoUrl: brand.logoUrl || '',
      isActive: brand.isActive,
    });
    setIsModalOpen(true);
  };

  // File to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn đúng định dạng file hình ảnh (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dung lượng ảnh không vượt quá 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: result }));
      toast.success('Đã tải ảnh lên thành công');
    };
    reader.readAsDataURL(file);
  };

  // Submit Create or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên hãng xe');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBrand) {
        await carService.updateBrand(editingBrand.brandId, {
          name: formData.name.trim(),
          country: formData.country.trim() || undefined,
          logoUrl: formData.logoUrl.trim() || '',
          isActive: formData.isActive,
        });
        toast.success(`Cập nhật hãng xe "${formData.name}" thành công`);
      } else {
        await carService.createBrand({
          name: formData.name.trim(),
          country: formData.country.trim() || undefined,
          logoUrl: formData.logoUrl.trim() || undefined,
          isActive: formData.isActive,
        });
        toast.success(`Thêm mới hãng xe "${formData.name}" thành công`);
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu hãng xe';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingBrand) return;

    try {
      setSubmitting(true);
      const res = await carService.deleteBrand(deletingBrand.brandId);
      toast.success(res.message || 'Đã xử lý xóa hãng xe');
      setDeleteConfirmOpen(false);
      setDeletingBrand(null);
      fetchBrands();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa hãng xe');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.country && b.country.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (statusFilter === 'ACTIVE') return b.isActive;
      if (statusFilter === 'INACTIVE') return !b.isActive;

      return true;
    });
  }, [brands, searchTerm, statusFilter]);

  const totalActive = brands.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Danh Mục Hãng Xe (Brands)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tên hãng, hình ảnh logo hiển thị trên trang chủ và danh mục lọc xe cho khách hàng
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hãng Xe Mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng số hãng xe</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{brands.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs">
          <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Đang hoạt động</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1 tracking-tight">{totalActive}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-700 uppercase tracking-wider">Tạm ngưng / Ẩn</p>
          <p className="text-2xl font-bold text-slate-700 mt-1 tracking-tight">{brands.length - totalActive}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên hãng xe, quốc gia xuất xứ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({brands.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Đang hoạt động ({totalActive})
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === 'INACTIVE'
                ? 'bg-slate-700 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ngưng hoạt động ({brands.length - totalActive})
          </button>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Hãng Xe & Logo</th>
                <th className="py-3.5 px-4">Quốc Gia</th>
                <th className="py-3.5 px-4">Dòng Xe (Models)</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách hãng xe...
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy hãng xe nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.brandId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <BrandLogo
                          name={brand.name}
                          logoUrl={brand.logoUrl}
                          size="md"
                        />
                        <div>
                          <strong className="text-slate-900 text-sm block font-bold">
                            {brand.name}
                          </strong>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Mã: #{brand.brandId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        {brand.country || 'Chưa cập nhật'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Car className="w-3 h-3 text-slate-500" />
                        {brand.modelsCount ?? 0} dòng xe
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {brand.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt Động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Ngưng Hoạt Động
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(brand)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition cursor-pointer"
                          title="Chỉnh sửa thông tin hãng xe"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            setDeletingBrand(brand);
                            setDeleteConfirmOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-md text-xs font-medium transition cursor-pointer"
                          title="Xóa hãng xe"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
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

      {/* Modal Thêm / Chỉnh Sửa Hãng Xe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{editingBrand ? 'Cập Nhật Hãng Xe' : 'Thêm Hãng Xe Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Preview Logo */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <BrandLogo
                  name={formData.name || 'BRAND'}
                  logoUrl={formData.logoUrl}
                  size="xl"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase">
                    {formData.name || 'Tên hãng xe'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formData.country || 'Quốc gia xuất xứ'}
                  </p>
                  <p className="text-[10px] text-amber-800 mt-1">
                    {formData.logoUrl ? '✓ Đang dùng ảnh logo tùy chỉnh' : '• Đang dùng biểu tượng Monogram mặc định'}
                  </p>
                </div>
              </div>

              {/* Tên hãng xe */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Hãng Xe <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: VinFast, Toyota, BMW, Mazda..."
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Quốc gia */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quốc Gia Xuất Xứ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Việt Nam, Nhật Bản, Đức, Mỹ..."
                  value={formData.country}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Logo Image URL & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Hình Ảnh Logo Hãng Xe
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dán link ảnh logo (https://...) hoặc tải file bên phải"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition"
                      title="Xóa ảnh"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition">
                    <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                    <span>Chọn ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Hỗ trợ PNG, SVG, JPG, WebP (&le; 2MB)
                  </span>
                </div>
              </div>

              {/* Trạng thái hoạt động */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Kích hoạt hiển thị hãng xe này trên hệ thống & trang chủ
                  </span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  {submitting ? 'Đang lưu...' : editingBrand ? 'Lưu Thay Đổi' : 'Thêm Hãng Xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Xóa Hãng Xe */}
      {deleteConfirmOpen && deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Xác nhận xóa hãng xe &quot;{deletingBrand.name}&quot;?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nếu hãng xe đang có dòng xe liên kết, hệ thống sẽ tự động chuyển sang trạng thái ngưng hoạt động để đảm bảo an toàn dữ liệu.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={submitting}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
              >
                {submitting ? 'Đang xử lý...' : 'Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
