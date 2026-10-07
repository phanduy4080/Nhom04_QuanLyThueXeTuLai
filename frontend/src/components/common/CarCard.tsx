'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Gauge, Fuel, Zap, ArrowRight, Camera } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Car } from '@/types';

interface CarCardProps {
  car: Car | any;
}

export default function CarCard({ car }: CarCardProps) {
  const isElectric = car.fuelType === 'ELECTRIC';
  const categoryName = typeof car.category === 'string' ? car.category : car.category?.name || 'Sedan';
  const shortCategory = categoryName.split('/')[0].trim();
  const imageCount = car.images?.length || 0;

  const carHref = `/cars/${car.id || car.slug || '1'}`;

  return (
    <Link
      href={carHref}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer block"
    >
      <div>
        {/* Car Image Container */}
        <div className="relative h-44 sm:h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
          {(car.thumbnail || car.images?.[0]) && (car.thumbnail?.startsWith('http') || car.images?.[0]?.startsWith('http')) ? (
            <img
              src={car.thumbnail?.startsWith('http') ? car.thumbnail : car.images?.[0]}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
              <Gauge className="w-8 h-8" />
            </div>
          )}

          {/* Top-Left: Category Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide shadow-xs">
              {shortCategory}
            </span>
          </div>

          {/* Top-Right: Photo Count Pill */}
          {imageCount > 1 && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-900/60 backdrop-blur-xs text-slate-100 text-[11px] font-medium flex items-center gap-1 shadow-xs">
                <Camera className="w-3 h-3 text-slate-300" />
                <span>{imageCount}</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>{car.brand || 'Chính hãng'}</span>
              <span>Đời {car.modelYear || 2024}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors line-clamp-1 mt-0.5">
              {car.name}
            </h3>
          </div>

          {/* Clean Specs Row */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{car.seats || 5} chỗ</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{car.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn'}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              {isElectric ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-700">Điện</span>
                </>
              ) : (
                <>
                  <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Xăng</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Giá thuê</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-black text-slate-900">
              {formatCurrency(car.pricePerDay || 0)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">/ngày</span>
          </div>
        </div>

        <span
          className="inline-flex items-center gap-1 bg-amber-400 group-hover:bg-amber-500 text-gray-950 text-xs font-bold py-2 px-3.5 rounded-xl shadow-2xs transition-all"
        >
          <span>Chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
