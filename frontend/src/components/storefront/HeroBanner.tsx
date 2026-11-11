'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { bannerService, BannerConfig, DEFAULT_HERO_BANNER } from '@/services/banner.service';

export default function HeroBanner() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'AVAILABLE' | 'NEW'>('ALL');
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(DEFAULT_HERO_BANNER);

  // Quick Filter Form State
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Tải cấu hình Banner 3D từ hệ thống Admin
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await bannerService.getBannerConfig();
        if (res.data) {
          setBannerConfig(res.data);
        }
      } catch (err) {
        // Fallback mặc định
      }
    };
    fetchConfig();
  }, []);

  const displayTitle = bannerConfig.title || DEFAULT_HERO_BANNER.title;
  const displaySketchfabId = bannerConfig.sketchfabId || DEFAULT_HERO_BANNER.sketchfabId || 'f18053ad7b8347008917423c26391907';

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab === 'NEW') {
      params.set('search', '2024');
    }
    if (filterBrand) params.set('brand', filterBrand);
    if (filterModel) {
      const currentSearch = params.get('search');
      params.set('search', currentSearch ? `${currentSearch} ${filterModel.trim()}` : filterModel.trim());
    }
    if (filterCategory) params.set('category', filterCategory);
    if (filterPrice) {
      if (filterPrice === 'UNDER_1M') {
        params.set('maxPrice', '1000000');
      } else if (filterPrice === '1M_2M') {
        params.set('minPrice', '1000000');
        params.set('maxPrice', '2000000');
      } else if (filterPrice === 'ABOVE_2M') {
        params.set('minPrice', '2000000');
      }
    }
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <section className="relative w-full min-h-screen h-screen flex flex-col justify-between overflow-hidden bg-black text-white select-none">
      {/* 1. TOÀN BỘ KHUNG BANNER LÀ MÔ HÌNH 3D SKETCHFAB TRÊN NỀN ĐEN STUDIO */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#070a10]">
        {/* Nền đen Studio ánh sáng hội tụ nhẹ */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#1e293b_0%,#090d16_55%,#030508_100%)] pointer-events-none" />

        {displaySketchfabId ? (
          <iframe
            title={displayTitle}
            src={`https://sketchfab.com/models/${displaySketchfabId}/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&ui_controls=1&transparent=1`}
            className="w-full h-full border-0 pointer-events-auto relative z-10"
            allow="autoplay; fullscreen; xr-spatial-tracking"
          />
        ) : (
          <img
            src={bannerConfig.fallbackImageUrl || DEFAULT_HERO_BANNER.fallbackImageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover object-center relative z-10"
          />
        )}

        {/* Lớp gradient bảo vệ độ tương phản Thanh tìm kiếm ở đáy */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20" />
      </div>

      {/* 2. NỘI DUNG LỚP TRÊN: THANH TÌM KIẾM XE NHANH NỔI Ở ĐÁY (KHÔNG CÒN CHỮ VƯỚNG MẮT) */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-4 flex flex-col justify-end pointer-events-none">
        {/* THANH TÌM KIẾM XE NHANH THEO TIÊU CHÍ (BOTTOM FLOATING SEARCH BAR - TRONG SUỐT BACKDROP-BLUR) */}
        <div className="w-full max-w-5xl mx-auto pointer-events-auto">
          <div className="bg-black/30 text-white rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md border border-white/15">
            {/* Header Tabs */}
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Tất Cả Xe
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('AVAILABLE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'AVAILABLE'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Xe Đang Sẵn Sàng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('NEW')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'NEW'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Đời Mới 2024
              </button>
            </div>

            {/* Form Fields: Hãng Xe - Dòng Xe - Mức Giá - Kiểu Dáng - Nút Tìm */}
            <form onSubmit={handleQuickSearch} className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 items-center">
              {/* Make */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Hãng Xe
                </label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 focus:border-amber-400 rounded-xl text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-amber-400/40 transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Tất cả hãng</option>
                  <option value="VinFast" className="bg-slate-900 text-white">VinFast</option>
                  <option value="BMW" className="bg-slate-900 text-white">BMW</option>
                  <option value="Mercedes-Benz" className="bg-slate-900 text-white">Mercedes-Benz</option>
                  <option value="Toyota" className="bg-slate-900 text-white">Toyota</option>
                  <option value="Mazda" className="bg-slate-900 text-white">Mazda</option>
                  <option value="Hyundai" className="bg-slate-900 text-white">Hyundai</option>
                  <option value="Ford" className="bg-slate-900 text-white">Ford</option>
                  <option value="Mitsubishi" className="bg-slate-900 text-white">Mitsubishi</option>
                </select>
              </div>

              {/* Model / Keyword */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Dòng Xe
                </label>
                <input
                  type="text"
                  placeholder="VF 8, Camry, C300..."
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-amber-400 rounded-xl text-xs font-semibold text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mức Giá / Ngày
                </label>
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 focus:border-amber-400 rounded-xl text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-amber-400/40 transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Mọi mức giá</option>
                  <option value="UNDER_1M" className="bg-slate-900 text-white">Dưới 1.000.000đ</option>
                  <option value="1M_2M" className="bg-slate-900 text-white">1.000.000đ - 2.000.000đ</option>
                  <option value="ABOVE_2M" className="bg-slate-900 text-white">Trên 2.000.000đ</option>
                </select>
              </div>

              {/* Body / Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phân Khúc
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white/10 hover:bg-white/15 focus:bg-slate-900 border border-white/20 focus:border-amber-400 rounded-xl text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-amber-400/40 transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Tất cả phân khúc</option>
                  <option value="SEDAN" className="bg-slate-900 text-white">Sedan 4-5 chỗ</option>
                  <option value="SUV" className="bg-slate-900 text-white">SUV gầm cao</option>
                  <option value="MPV" className="bg-slate-900 text-white">MPV 7 chỗ gia đình</option>
                  <option value="EV" className="bg-slate-900 text-white">EV Xe điện cao cấp</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="col-span-2 md:col-span-1 pt-1 md:pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/25 hover:scale-102 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm Xe Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
