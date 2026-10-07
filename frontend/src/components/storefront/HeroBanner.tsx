'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroBanner() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/cars');
    }
  };

  return (
    <section className="bg-white pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Introduction Text */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            Welcome to QuickHatch – Your Ticket to Thrilling Rides!
          </h1>
          
        </div>

        {/* Hero Panorama Car Image with Overlaid Search Bar */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl max-w-6xl mx-auto h-72 sm:h-96 lg:h-[420px] bg-gray-900">
          <img
            src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85"
            alt="QuickHatch Fleet on Track"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Dark Overlay for contrast */}
          <div className="absolute inset-0 bg-black/25" />

          {/* Overlaid Search Bar */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <form
              onSubmit={handleSearch}
              className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex items-center border border-white/40"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your favourite Hot-hatch by Brand or Name"
                className="w-full px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none font-medium"
              />
              <button
                type="submit"
                className="p-3 text-gray-700 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
                aria-label="Submit search"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>

        {/* Brand Logos Row */}
        <div className="mt-14 max-w-5xl mx-auto flex flex-wrap items-center justify-around gap-8 py-6 opacity-60 hover:opacity-100 transition-opacity">
          {/* VinFast */}
          <div className="text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-black mb-1.5 shadow-xs">
              VF
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">VinFast</span>
          </div>

          {/* Toyota */}
          <div className="text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black mb-1.5 shadow-xs">
              TOY
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Toyota</span>
          </div>

          {/* Mazda */}
          <div className="text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black mb-1.5 shadow-xs">
              MZD
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Mazda</span>
          </div>

          {/* Hyundai */}
          <div className="text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black mb-1.5 shadow-xs">
              HYU
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Hyundai</span>
          </div>

          {/* Mercedes */}
          <div className="text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-black mb-1.5 shadow-xs">
              MB
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Mercedes</span>
          </div>

          {/* BMW */}
          <div className="text-center flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black mb-1.5 shadow-xs">
              BMW
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">BMW</span>
          </div>
        </div>
      </div>
    </section>
  );
}
