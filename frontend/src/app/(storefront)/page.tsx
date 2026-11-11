'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroBanner from '@/components/storefront/HeroBanner';
import CarCard from '@/components/common/CarCard';
import NearYourPlaceMap from '@/components/storefront/NearYourPlaceMap';
import {
  Car as CarIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
} from 'lucide-react';
import { carService } from '@/services/car.service';
import { Button } from '@/components/ui/Button';
import BrandLogo from '@/components/common/BrandLogo';
import { Brand } from '@/types';

export default function StorefrontHomePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsRes, catsRes, brandsRes] = await Promise.all([
          carService.getCars({ status: 'AVAILABLE' }),
          carService.getCategories(),
          carService.getBrands(),
        ]);

        if (carsRes.data) setCars(carsRes.data);
        if (catsRes.data) setCategories(catsRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCars = cars.filter((c) => {
    if (selectedCatId && c.categoryId !== selectedCatId && c.model?.categoryId !== selectedCatId) {
      return false;
    }
    if (selectedBrandId && c.brandId !== selectedBrandId && c.model?.brandId !== selectedBrandId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Brands Bar Section (Khám Phá Theo Hãng Xe) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Thương Hiệu Hàng Đầu</span>
                {selectedBrandId && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Đang lọc: {brands.find((b) => b.brandId === selectedBrandId)?.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Lựa chọn hãng xe yêu thích để khám phá các dòng xe sẵn sàng lăn bánh
              </p>
            </div>

            {selectedBrandId && (
              <button
                type="button"
                onClick={() => setSelectedBrandId(null)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline self-start sm:self-auto cursor-pointer"
              >
                Xóa lọc hãng (Xem tất cả)
              </button>
            )}
          </div>

          {/* Brands list */}
          <div className="flex items-center justify-start md:justify-center gap-6 sm:gap-10 overflow-x-auto pb-2 pt">
            {brands.map((brand) => {
              const isSelected = selectedBrandId === brand.brandId;
              return (
                <button
                  key={brand.brandId}
                  type="button"
                  onClick={() => setSelectedBrandId(isSelected ? null : brand.brandId)}
                  className={`group flex flex-col items-center gap-2 cursor-pointer shrink-0 transition-transform ${
                    isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                  title={`Xem xe hãng ${brand.name}`}
                >
                  <div
                    className={`p-1 rounded-2xl transition-all ${
                      isSelected
                        ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-white shadow-md'
                        : 'group-hover:ring-2 group-hover:ring-slate-300'
                    }`}
                  >
                    <BrandLogo
                      name={brand.name}
                      logoUrl={brand.logoUrl}
                      size="lg"
                    />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs uppercase tracking-wider font-extrabold transition-colors ${
                      isSelected
                        ? 'text-amber-600 font-black'
                        : 'text-slate-700 group-hover:text-slate-950'
                    }`}
                  >
                    {brand.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section id="offer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dòng Xe Cho Thuê Nổi Bật
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Lựa chọn phương tiện phù hợp nhất cho chuyến công tác hoặc du lịch gia đình của bạn.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCatId(null)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedCatId === null
                  ? 'bg-amber-400 text-gray-950 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất Cả
            </button>

            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() => setSelectedCatId(cat.categoryId)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCatId === cat.categoryId
                    ? 'bg-amber-400 text-gray-950 shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <Link href="/cars">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="hidden sm:inline-flex"
              >
                Xem Tất Cả Xe
              </Button>
            </Link>
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-400">Đang tải danh sách xe...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <CarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Chưa có xe trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/cars">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Xem Toàn Bộ {cars.length} Xe
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. "Near your place" Map Section */}
      <NearYourPlaceMap />
    </div>
  );
}
