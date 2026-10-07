'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Car as CarIcon,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Activity,
  DollarSign,
  AlertCircle,
  X,
  Camera,
  Trash2,
  Image as ImageIcon,
  Fuel,
  Zap,
  UploadCloud,
  Star,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { carService } from '@/services/car.service';
import { pricingService } from '@/services/pricing.service';
import { uploadService } from '@/services/upload.service';
import { formatCurrency } from '@/lib/utils';
import { Car } from '@/types';

export default function AdminCarsPage() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'pricing'>('fleet');
  const [cars, setCars] = useState<Car[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pricePlans, setPricePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // Status Change Form
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Add/Edit Car Form
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: '',
    assetCode: '',
    modelId: 1,
    manufactureYear: 2024,
    color: 'Trắng',
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    listPricePerDay: 800000,
    depositAmount: 8000000,
    dailyKmLimit: 350,
    extraKmFee: 5000,
    currentBranchId: 1,
    notes: '',
    images: [] as string[],
  });

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedBranch !== 'ALL') params.branchId = Number(selectedBranch);
      if (searchTerm) params.search = searchTerm;

      const res = await carService.getCars(params);
      if (res.data) setCars(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedBranch, searchTerm]);

  const fetchMetadata = async () => {
    try {
      const [branchesRes, modelsRes, categoriesRes, plansRes] = await Promise.all([
        carService.getBranches(),
        carService.getModels(),
        carService.getCategories(),
        pricingService.getPricePlans(),
      ]);
      if (branchesRes.data) setBranches(branchesRes.data);
      if (modelsRes.data) setModels(modelsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (plansRes.data) setPricePlans(plansRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchMetadata();
  }, [fetchCars]);

  const handleOpenStatusModal = (car: any) => {
    setSelectedCar(car);
    setNewStatus(car.status);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;

    try {
      setStatusSubmitting(true);
      await carService.updateCarStatus(selectedCar.id, {
        status: newStatus,
        reason: statusReason,
      });
      toast.success(`Cập nhật trạng thái xe ${selectedCar.licensePlate} thành ${newStatus}!`);
      setShowStatusModal(false);
      fetchCars();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái xe');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedCar(null);
    setNewImageUrl('');
    setFormData({
      licensePlate: '',
      assetCode: '',
      modelId: models[0]?.modelId || 1,
      manufactureYear: 2024,
      color: 'Trắng',
      seats: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      listPricePerDay: 800000,
      depositAmount: 8000000,
      dailyKmLimit: 350,
      extraKmFee: 5000,
      currentBranchId: branches[0]?.branchId || 1,
      notes: '',
      images: [],
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (car: any) => {
    setSelectedCar(car);
    setNewImageUrl('');
    setFormData({
      licensePlate: car.licensePlate,
      assetCode: car.assetCode || '',
      modelId: car.modelId || models[0]?.modelId || 1,
      manufactureYear: car.modelYear || 2024,
      color: car.color || 'Trắng',
      seats: car.seats || 5,
      transmission: car.transmission || 'AUTOMATIC',
      fuelType: car.fuelType || 'GASOLINE',
      listPricePerDay: car.pricePerDay || 800000,
      depositAmount: car.depositAmount || 8000000,
      dailyKmLimit: car.dailyKmLimit || 350,
      extraKmFee: car.extraKmFee || 5000,
      currentBranchId: car.currentBranchId || branches[0]?.branchId || 1,
      notes: car.notes || '',
      images: car.images && car.images.length > 0 ? car.images : car.thumbnail ? [car.thumbnail] : [],
    });
    setShowEditModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const fileList = Array.from(files);
      const res = await uploadService.uploadMultiple(fileList);
      
      if (res.data && res.data.length > 0) {
        const newUrls = res.data.map((item) => item.url);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newUrls],
        }));
        toast.success(`Đã tải lên thành công ${newUrls.length} ảnh từ máy tính!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi tải ảnh từ máy tính');
    } finally {
      setUploadingImages(false);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => {
      const targetImage = prev.images[index];
      const remainingImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: [targetImage, ...remainingImages],
      };
    });
    toast.success('Đã đặt làm ảnh đại diện chính!');
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (showEditModal && selectedCar) {
        await carService.updateCar(selectedCar.id, formData);
        toast.success('Cập nhật thông tin xe thành công!');
        setShowEditModal(false);
      } else {
        await carService.createCar(formData);
        toast.success('Thêm xe mới vào đội xe thành công!');
        setShowAddModal(false);
      }
      fetchCars();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Sẵn Sàng</span>
          </span>
        );
      case 'RENTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>Đang Cho Thuê</span>
          </span>
        );
      case 'BOOKED':
      case 'HELD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Đã Giữ Chỗ</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>Bảo Dưỡng</span>
          </span>
        );
      case 'REPAIRING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>Đang Sửa Chữa</span>
          </span>
        );
      case 'INSPECTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
            <span>Đang Kiểm Tra</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quản Lý Đội Xe & Bảng Giá
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin chi tiết xe, cập nhật trạng thái vận hành và chính sách giá thuê theo ngày.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={fetchCars}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm Xe Mới
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'fleet'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CarIcon className="w-4 h-4" />
          <span>Danh Sách Xe</span>
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full font-bold">
            {cars.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'pricing'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Bảng Giá & Chính Sách</span>
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full font-bold">
            {pricePlans.length}
          </span>
        </button>
      </div>

      {activeTab === 'fleet' ? (
        <>
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo biển số, tên xe, mã tài sản..."
                className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="AVAILABLE">Sẵn Sàng (AVAILABLE)</option>
                <option value="RENTED">Đang Cho Thuê (RENTED)</option>
                <option value="MAINTENANCE">Đang Bảo Dưỡng (MAINTENANCE)</option>
                <option value="REPAIRING">Đang Sửa Chữa (REPAIRING)</option>
                <option value="INSPECTING">Đang Kiểm Tra (INSPECTING)</option>
                <option value="SUSPENDED">Tạm Ngừng Khai Thác (SUSPENDED)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Biển Số & Xe</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Phân Khúc</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Hộp Số / Nhiên Liệu</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Giá Thuê / Cọc</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Chi Nhánh</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading && cars.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Đang tải danh sách xe...
                      </td>
                    </tr>
                  ) : cars.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không tìm thấy xe nào phù hợp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    cars.map((car: any) => (
                      <tr key={car.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                              {(car.thumbnail || car.images?.[0]) && (car.thumbnail?.startsWith('http') || car.images?.[0]?.startsWith('http')) ? (
                                <img
                                  src={car.thumbnail?.startsWith('http') ? car.thumbnail : car.images?.[0]}
                                  alt={car.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-amber-100/80 flex items-center justify-center text-amber-700 font-bold">
                                  <CarIcon className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-900 text-sm">
                                  {car.licensePlate}
                                </span>
                                {car.images && car.images.length > 1 && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                                    {car.images.length} ảnh
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{car.name}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                            {car.category || 'Sedan'} ({car.seats || 5} chỗ)
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs whitespace-nowrap">
                          <p className="font-semibold text-slate-800">
                            {car.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn'}
                          </p>
                          <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                            {car.fuelType === 'ELECTRIC' ? (
                              <>
                                <Zap className="w-3 h-3 text-emerald-600" />
                                <span>Xe Điện (EV)</span>
                              </>
                            ) : (
                              <>
                                <Fuel className="w-3 h-3 text-amber-600" />
                                <span>Xăng / Dầu</span>
                              </>
                            )}
                          </p>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900 text-sm">
                            {formatCurrency(car.pricePerDay || 0)}/ngày
                          </p>
                          <p className="text-xs text-slate-400">
                            Cọc: {formatCurrency(car.depositAmount || 0)}
                          </p>
                        </td>

                        <td className="py-4 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {car.branch || 'Sân bay Tân Sơn Nhất'}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(car.status)}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenStatusModal(car)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                              title="Đổi trạng thái xe"
                            >
                              <Activity className="w-3.5 h-3.5 shrink-0" />
                              <span>Đổi TT</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(car)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                              title="Chỉnh sửa thông tin xe"
                            >
                              <Edit3 className="w-4 h-4" />
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
        </>
      ) : (
        /* Pricing Plans Tab (US-03) */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bảng Giá Thuê Xe Theo Ngày & Bậc Giá</h3>
            <p className="text-xs text-slate-500 mb-6">
              Thiết lập giá linh hoạt theo số ngày thuê (thuê càng dài ngày giá càng giảm).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900">Bảng Giá Chuẩn (Sedan 4-5 Chỗ)</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">Đang áp dụng</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>1 - 3 ngày:</span>
                    <span className="font-bold text-slate-900">700.000 VNĐ / ngày</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>4 - 7 ngày:</span>
                    <span className="font-bold text-emerald-600">650.000 VNĐ / ngày (-7%)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Trên 7 ngày:</span>
                    <span className="font-bold text-emerald-600">600.000 VNĐ / ngày (-14%)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900">Bảng Giá Xe Điện VinFast VF8</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">Đang áp dụng</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>1 - 3 ngày:</span>
                    <span className="font-bold text-slate-900">1.200.000 VNĐ / ngày</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>4 - 7 ngày:</span>
                    <span className="font-bold text-emerald-600">1.100.000 VNĐ / ngày</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Trên 7 ngày:</span>
                    <span className="font-bold text-emerald-600">1.000.000 VNĐ / ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal US-02: Cập Nhật Trạng Thái Xe & Lịch Sử */}
      {showStatusModal && selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Cập Nhật Trạng Thái Xe</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Xe: <strong className="text-slate-900">{selectedCar.licensePlate}</strong> ({selectedCar.name})
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Trạng Thái Mới
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="AVAILABLE">Sẵn Sàng Cho Thuê (AVAILABLE)</option>
                  <option value="MAINTENANCE">Đang Bảo Dưỡng Định Kỳ (MAINTENANCE)</option>
                  <option value="REPAIRING">Đang Sửa Chữa Hư Hỏng (REPAIRING)</option>
                  <option value="INSPECTING">Đang Kiểm Tra / Khử Khuẩn (INSPECTING)</option>
                  <option value="HELD">Đang Giữ Chỗ (HELD)</option>
                  <option value="SUSPENDED">Tạm Ngừng Khai Thác (SUSPENDED)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Lý Do / Ghi Chú Thay Đổi
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Vd: Xe tới kỳ thay dầu mốc 20,000 km, đưa vào xưởng bảo dưỡng..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" isLoading={statusSubmitting}>
                  Cập Nhật Trạng Thái
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm / Sửa Xe */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-xl sm:max-w-2xl w-full rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header (Sticky) */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <CarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                    {showEditModal ? 'Cập Nhật Thông Tin Xe' : 'Thêm Xe Mới Vào Đội Xe'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {showEditModal ? `Biển số: ${formData.licensePlate || '---'}` : 'Nhập thông tin kỹ thuật & định giá xe'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <form id="car-form" onSubmit={handleSaveCar} className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {/* Section 1: Thông tin cơ bản */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider block">
                  1. Thông tin phương tiện & Chi nhánh
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dòng Xe (Model) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.modelId}
                      onChange={(e) => setFormData({ ...formData, modelId: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {models.map((m) => (
                        <option key={m.modelId} value={m.modelId}>
                          {m.brand?.name} {m.name} ({m.variant})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chi Nhánh Trạm Xe <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.currentBranchId}
                      onChange={(e) => setFormData({ ...formData, currentBranchId: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {branches.map((b) => (
                        <option key={b.branchId} value={b.branchId}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Biển Số Xe <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="51K-999.99"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      required
                      className="w-full h-10 px-3 text-xs sm:text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mã Tài Sản Nội Bộ
                    </label>
                    <input
                      type="text"
                      placeholder="XE-VF8-002"
                      value={formData.assetCode}
                      onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                      className="w-full h-10 px-3 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Giá & Phụ Phí */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider block">
                  2. Định giá thuê & Tiền cọc
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Giá Thuê / Ngày <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.listPricePerDay}
                      onChange={(e) => setFormData({ ...formData, listPricePerDay: Number(e.target.value) })}
                      required
                      className="w-full h-10 px-2.5 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tiền Cọc (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                      required
                      className="w-full h-10 px-2.5 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Hạn mức Km/ngày
                    </label>
                    <input
                      type="number"
                      value={formData.dailyKmLimit}
                      onChange={(e) => setFormData({ ...formData, dailyKmLimit: Number(e.target.value) })}
                      className="w-full h-10 px-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phí Vượt Km (đ/km)
                    </label>
                    <input
                      type="number"
                      value={formData.extraKmFee}
                      onChange={(e) => setFormData({ ...formData, extraKmFee: Number(e.target.value) })}
                      className="w-full h-10 px-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Quản lý ảnh xe từ máy */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                    3. Thư viện ảnh xe ({formData.images.length} ảnh)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ảnh đầu tiên là ảnh bìa đại diện
                  </span>
                </div>

                {/* Compact Dropzone */}
                <div className="border border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50/70 rounded-xl p-3 transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="admin-car-file-upload"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="admin-car-file-upload"
                    className="cursor-pointer flex items-center justify-between gap-3"
                  >
                    {uploadingImages ? (
                      <div className="flex items-center gap-2 py-1 mx-auto text-amber-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-bold">
                          Đang tải ảnh từ máy tính lên hệ thống...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              Tải ảnh từ máy tính
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Hỗ trợ chọn nhiều file JPG, PNG, WEBP cùng lúc
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-bold shadow-2xs transition-colors shrink-0">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Chọn Tệp</span>
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Compact Images Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {formData.images.map((imgUrl, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border transition-all group bg-slate-100 ${
                            isPrimary
                              ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-xs'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="h-20 w-full overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={`Car ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Top Badges & Delete Button */}
                          <div className="absolute top-1 left-1 right-1 flex items-center justify-between">
                            {isPrimary ? (
                              <span className="px-1.5 py-0.5 bg-amber-500 text-gray-950 text-[9px] font-black rounded-md flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-gray-950" />
                                <span>Bìa</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="px-1.5 py-0.5 bg-black/60 hover:bg-amber-500 hover:text-gray-950 text-white text-[9px] font-bold rounded-md transition-colors"
                                title="Đặt làm ảnh bìa"
                              >
                                Đặt bìa
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="w-5 h-5 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              title="Xóa ảnh này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 4: Ghi chú */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-black uppercase text-amber-700 tracking-wider">
                  4. Ghi Chú Kỹ Thuật
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Mô tả tình trạng phụ tùng, trang bị kèm theo xe..."
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </form>

            {/* Footer (Sticky) */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                form="car-form"
                variant="primary"
                size="sm"
                isLoading={loading}
              >
                {showEditModal ? 'Lưu Thay Đổi' : 'Tạo Xe Mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
