'use client';

import React from 'react';
import Link from 'next/link';
import { Car as CarIcon, Users, Fuel, ArrowRight, CheckCircle2, Zap, Camera } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Car } from '@/types';

interface CarCardProps {
  car: Car | any;
}

export default function CarCard({ car }: CarCardProps) {
  const isElectric = car.fuelType === 'ELECTRIC';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group justify-between">
      <div>
        {/* Car Image / Studio Badge Container */}
        <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
          {(car.thumbnail || car.images?.[0]) && (car.thumbnail?.startsWith('http') || car.images?.[0]?.startsWith('http')) ? (
            <img
              src={car.thumbnail?.startsWith('http') ? car.thumbnail : car.images?.[0]}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
              <CarIcon className="w-10 h-10" />
            </div>
          )}

          {/* Category Tag */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gray-950/80 backdrop-blur-md text-white text-xs font-bold">
            {typeof car.category === 'string' ? car.category : car.category?.name || 'Xe Tự Lái'}
          </span>

          {/* Available Badge / Photo count */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {car.images && car.images.length > 1 && (
              <span className="px-2 py-0.5 rounded-lg bg-gray-950/70 backdrop-blur-md text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-400" />
                <span>{car.images.length}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Có sẵn</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{car.brand || 'Chính hãng'}</span>
              <span>Đời {car.modelYear || 2024}</span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors line-clamp-1">
              {car.name}
            </h3>
          </div>

          {/* Specs Row with Lucide Icons */}
          <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{car.seats || 5} chỗ</span>
            </div>

            <div className="flex items-center gap-1">
              <CarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{car.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn'}</span>
            </div>

            <div className="flex items-center gap-1">
              {isElectric ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-700 font-semibold">Xe Điện</span>
                </>
              ) : (
                <>
                  <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Xăng</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & CTA */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-50">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Giá chỉ từ</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-black text-slate-900">
              {formatCurrency(car.pricePerDay || 0)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">/ngày</span>
          </div>
        </div>

        <Link
          href={`/cars/${car.id || car.slug || '1'}`}
          className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-black py-2 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
