import React from 'react';
import Link from 'next/link';
import { Car } from '@/types';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-3 transition-transform hover:-translate-y-1 duration-300">
      {/* Studio Car Image on Clean Background */}
      <div className="h-36 sm:h-40 w-full flex items-center justify-center p-2 mb-3">
        <img
          src={car.thumbnail}
          alt={car.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Car Name */}
      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
        {car.name}
      </h3>

      {/* Price */}
      <span className="text-xs text-gray-500 font-semibold mt-0.5 mb-3">
        {car.pricePerDay ? `${car.pricePerDay.toLocaleString()} ₫/day` : '200$/day'}
      </span>

      {/* Yellow 'More Details' CTA Button */}
      <Link
        href={`/cars/${car.slug}`}
        className="w-full max-w-[140px] bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-black py-2 px-4 rounded-xl shadow-xs transition-colors"
      >
        More Details
      </Link>
    </div>
  );
}
