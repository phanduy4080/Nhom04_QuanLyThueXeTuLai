import React from 'react';
import Link from 'next/link';
import { Car, ChevronLeft } from 'lucide-react';
import AuthPromoBanner from '@/components/auth/AuthPromoBanner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 antialiased selection:bg-amber-400 selection:text-gray-950">
      {/* Top Simple Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-baseline">
            <span className="text-2xl font-black text-amber-500 tracking-tight">Quick</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">Hatch</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-gray-900 shadow-xs">
            <Car className="w-4 h-4 fill-gray-900" />
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Form Card (Center / Right) */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
            <div className="w-full max-w-lg bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80">
              {children}
            </div>
          </div>

          {/* Marketing Showcase Side (Left / Right on Large screens) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-full min-h-[580px]">
            <AuthPromoBanner />
          </div>
        </div>
      </main>
    </div>
  );
}
