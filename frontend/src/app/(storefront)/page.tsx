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

export default function StorefrontHomePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsRes, catsRes] = await Promise.all([
          carService.getCars({ status: 'AVAILABLE' }),
          carService.getCategories(),
        ]);

        if (carsRes.data) setCars(carsRes.data);
        if (catsRes.data) setCategories(catsRes.data);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCars = selectedCatId
    ? cars.filter((c) => c.categoryId === selectedCatId || c.model?.categoryId === selectedCatId)
    : cars;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Value Props / Feature Highlights Row */}
      

      {/* 3. Section: "Dòng Xe Nổi Bật Sẵn Sàng Cho Thuê" */}
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
