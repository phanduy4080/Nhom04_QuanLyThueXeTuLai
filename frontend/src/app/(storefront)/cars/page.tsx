'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  Car as CarIcon,
  X,
  RotateCcw,
} from 'lucide-react';
import { carService } from '@/services/car.service';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import CarCard from '@/components/common/CarCard';

function CarsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get('search') || '';

  const [cars, setCars] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-10-15T08:00');
  const [endDate, setEndDate] = useState<string>('2026-10-18T20:00');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(3000000);

  // Synchronize when URL search param changes from Header
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { status: 'AVAILABLE' };
      if (searchTerm) params.search = searchTerm.trim();
      if (selectedBranch) params.branchId = Number(selectedBranch);
      if (selectedCategory) params.categoryId = Number(selectedCategory);
      if (selectedBrand) params.brandId = Number(selectedBrand);
      if (selectedSeats) params.seats = Number(selectedSeats);
      if (selectedTransmission) params.transmission = selectedTransmission;
      if (selectedFuel) params.fuelType = selectedFuel;
      if (maxPrice < 3000000) params.maxPrice = maxPrice;

      // Anti-conflict date filtering
      if (startDate && endDate) {
        params.startDate = new Date(startDate).toISOString();
        params.endDate = new Date(endDate).toISOString();
      }

      const res = await carService.getCars(params);
      if (res.data) setCars(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedBranch,
    startDate,
    endDate,
    selectedCategory,
    selectedBrand,
    selectedSeats,
    selectedTransmission,
    selectedFuel,
    maxPrice,
  ]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [bRes, cRes, brRes] = await Promise.all([
          carService.getBranches(),
          carService.getCategories(),
          carService.getBrands(),
        ]);
        if (bRes.data) setBranches(bRes.data);
        if (cRes.data) setCategories(cRes.data);
        if (brRes.data) setBrands(brRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMeta();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedSeats('');
    setSelectedTransmission('');
    setSelectedFuel('');
    setMaxPrice(3000000);
    router.push('/cars');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Danh Sách Xe Tự Lái Sẵn Sàng Phục Vụ
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Chọn thời gian và tiêu chí để xem các dòng xe đời mới, giao xe tận nơi với giá minh bạch.
        </p>
      </div>

      {/* Hero Search Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Tìm kiếm từ khóa */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-amber-500" />
              <span>Tìm Kiếm Xe</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên xe, VinFast, Toyota..."
                className="w-full h-12 pl-4 pr-9 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Địa điểm nhận xe */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Địa Điểm / Chi Nhánh</span>
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-12 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
            >
              <option value="">Tất cả các chi nhánh (Toàn hệ thống)</option>
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.name} - {b.province}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày bắt đầu */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Nhận Xe</span>
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Ngày kết thúc */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Trả Xe</span>
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-12 px-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Nút Tìm kiếm */}
          <div className="md:col-span-2">
            <Button
              variant="primary"
              size="lg"
              onClick={fetchCars}
              isLoading={loading}
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full h-12 shadow-md shadow-amber-500/20"
            >
              Tìm Xe
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Car Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-amber-500" />
              <span>Bộ Lọc Tiêu Chí</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-amber-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Phân khúc xe */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-700">Phân Khúc Xe</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-400"
            >
              <option value="">Tất cả phân khúc</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hãng xe */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-700">Hãng Sản Xuất</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-400"
            >
              <option value="">Tất cả hãng xe</option>
              {brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>
          </div>

          {/* Số chỗ ngồi */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-700">Số Chỗ Ngồi</label>
            <div className="grid grid-cols-3 gap-2">
              {['', '4', '5', '7'].map((seat) => (
                <button
                  key={seat}
                  onClick={() => setSelectedSeats(seat)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedSeats === seat
                      ? 'bg-amber-400 text-gray-950 border-amber-400 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {seat === '' ? 'Tất cả' : `${seat} chỗ`}
                </button>
              ))}
            </div>
          </div>

          {/* Loại Hộp số */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-700">Hộp Số</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tất cả', val: '' },
                { label: 'Tự động', val: 'AUTOMATIC' },
                { label: 'Số sàn', val: 'MANUAL' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setSelectedTransmission(item.val)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedTransmission === item.val
                      ? 'bg-amber-400 text-gray-950 border-amber-400 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loại Nhiên liệu */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-700">Nhiên Liệu</label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-400"
            >
              <option value="">Tất cả nhiên liệu</option>
              <option value="ELECTRIC">Xe Điện (EV)</option>
              <option value="GASOLINE">Xăng</option>
              <option value="DIESEL">Dầu (Diesel)</option>
            </select>
          </div>

          {/* Mức giá trần */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Giá tối đa / ngày:</span>
              <span className="text-amber-600">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={400000}
              max={3000000}
              step={100000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </aside>

        {/* Car Results Grid */}
        <section className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Tìm thấy <strong className="text-slate-900">{cars.length}</strong> xe có sẵn trong lịch trình đã chọn
              {searchTerm && (
                <span> cho từ khóa &quot;<strong className="text-amber-600">{searchTerm}</strong>&quot;</span>
              )}
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Đang kiểm tra lịch xe trống...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <CarIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy xe phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vui lòng thử chọn khoảng ngày khác hoặc điều chỉnh lại bộ lọc giá, từ khóa tìm kiếm và phân khúc xe.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                Xóa Bộ Lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {cars.map((car: any) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function CarsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Đang tải danh mục xe...</p>
        </div>
      }
    >
      <CarsCatalogContent />
    </Suspense>
  );
}
