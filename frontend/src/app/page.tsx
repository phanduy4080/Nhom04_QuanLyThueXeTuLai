'use client';

import React, { useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import HeroBanner from '@/components/storefront/HeroBanner';
import CarCard from '@/components/common/CarCard';
import NearYourPlaceMap from '@/components/storefront/NearYourPlaceMap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Car } from '@/types';

// Danh sách xe chính xác theo ảnh mẫu
const offerCars: Car[] = [
  {
    id: '1',
    name: 'Ford Focus RS',
    slug: 'ford-focus-rs',
    brand: 'Ford',
    modelYear: 2024,
    licensePlate: '51K-123.45',
    categoryId: 'hatchback',
    category: { id: 'hatchback', name: 'Hot Hatch', slug: 'hot-hatch' },
    seats: 5,
    transmission: 'MANUAL',
    fuelType: 'GASOLINE',
    pricePerDay: 200, // Hoặc định dạng theo USD / VND
    depositAmount: 1000,
    thumbnail: 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=600&q=80',
    images: [],
    features: ['AWD', 'Drift Mode', 'Recaro Seats'],
    status: 'AVAILABLE',
    currentOdo: 12000,
  },
  {
    id: '2',
    name: 'Toyota Corolla GR',
    slug: 'toyota-corolla-gr',
    brand: 'Toyota',
    modelYear: 2024,
    licensePlate: '51H-987.65',
    categoryId: 'hatchback',
    category: { id: 'hatchback', name: 'Hot Hatch', slug: 'hot-hatch' },
    seats: 5,
    transmission: 'MANUAL',
    fuelType: 'GASOLINE',
    pricePerDay: 200,
    depositAmount: 1000,
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    images: [],
    features: ['GR-FOUR AWD', 'Turbocharged', 'Sport Suspension'],
    status: 'AVAILABLE',
    currentOdo: 8500,
  },
  {
    id: '3',
    name: 'Mercedes A45S Amg',
    slug: 'mercedes-a45s-amg',
    brand: 'Mercedes-Benz',
    modelYear: 2024,
    licensePlate: '51K-888.66',
    categoryId: 'hatchback',
    category: { id: 'hatchback', name: 'Hot Hatch AMG', slug: 'hot-hatch-amg' },
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    pricePerDay: 200,
    depositAmount: 1500,
    thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    images: [],
    features: ['421 HP', 'AMG Performance', 'Panamericana Grille'],
    status: 'AVAILABLE',
    currentOdo: 14000,
  },
  {
    id: '4',
    name: 'Toyota Yaris GR',
    slug: 'toyota-yaris-gr',
    brand: 'Toyota',
    modelYear: 2024,
    licensePlate: '51F-333.22',
    categoryId: 'hatchback',
    category: { id: 'hatchback', name: 'Hot Hatch', slug: 'hot-hatch' },
    seats: 4,
    transmission: 'MANUAL',
    fuelType: 'GASOLINE',
    pricePerDay: 200,
    depositAmount: 1000,
    thumbnail: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
    images: [],
    features: ['WRC DNA', 'Carbon Roof', 'Torsen LSD'],
    status: 'AVAILABLE',
    currentOdo: 9200,
  },
];

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Header */}
      <Header />

      <main className="flex-1">
        {/* 2. Hero Section: Welcome Title + Track Banner with Overlaid Search + Brands Row */}
        <HeroBanner />

        {/* 3. "Our offer" Section */}
        <section id="offer" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-8">
              Our offer
            </h2>

            {/* 4 Car items in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offerCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Carousel Navigation Arrows < > */}
            <div className="flex items-center justify-center gap-3 mt-8 text-gray-600">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Previous cars"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Next cars"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. "Near your place" Map Section */}
        <NearYourPlaceMap />
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
