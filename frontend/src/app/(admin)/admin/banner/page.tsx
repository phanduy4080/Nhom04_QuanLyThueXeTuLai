'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Box,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Car,
} from 'lucide-react';
import { toast } from 'sonner';
import { bannerService, BannerConfig, DEFAULT_HERO_BANNER, BANNER_BG_PRESETS } from '@/services/banner.service';
import { formatCurrency } from '@/lib/utils';

export default function AdminBannerConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_HERO_BANNER);
  const [activePreviewTab, setActivePreviewTab] = useState<'3D' | 'IMAGE'>('3D');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getBannerConfig();
      if (res.data) {
        setConfig(res.data);
      }
    } catch (err: any) {
      toast.error('Không thể tải cấu hình banner, sử dụng cấu hình mặc định');
      setConfig(DEFAULT_HERO_BANNER);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSketchfabUrlChange = (value: string) => {
    const trimmed = value.trim();
    // Regex trích xuất 32 ký tự UID từ url Sketchfab
    const match = trimmed.match(/([a-f0-9]{32})/i);
    const id = match ? match[1] : trimmed;
    setConfig((prev) => ({
      ...prev,
      sketchfabUrl: trimmed,
      sketchfabId: id,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await bannerService.updateBannerConfig(config);
      if (res.data) {
        setConfig(res.data);
      }
      toast.success('Đã lưu và cập nhật cấu hình Hero Banner 3D thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu cấu hình banner');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục về cấu hình mô hình 3D Mercedes-Benz mặc định?')) {
      setConfig(DEFAULT_HERO_BANNER);
      toast.info('Đã tải lại cấu hình mặc định. Nhấn "Lưu cấu hình" để áp dụng.');
    }
  };

  const currentSketchfabId = config.sketchfabId || DEFAULT_HERO_BANNER.sketchfabId;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-700">
              <Box className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cấu Hình Hero Banner 3D
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tùy chỉnh mô hình 3D Sketchfab, tiêu đề, thông số xe và hình nền gara xuất hiện trực tiếp trên trang chủ
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc Định</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Xem Trang Chủ</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Thiết Lập Mô Hình 3D & Nội Dung Banner</span>
            </h2>

            {/* 1. Sketchfab URL or ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Liên Kết hoặc ID Mô Hình Sketchfab 3D <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.sketchfabUrl || config.sketchfabId || ''}
                  onChange={(e) => handleSketchfabUrlChange(e.target.value)}
                  placeholder="https://sketchfab.com/3d-models/... hoặc mã 32 ký tự UID"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Mã UID hiện tại: <strong className="font-mono text-slate-800">{currentSketchfabId || 'Chưa nhận diện'}</strong>
                </span>
                <a
                  href="https://sketchfab.com/3d-models/categories/cars-vehicles"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-600 hover:underline flex items-center gap-1"
                >
                  <span>Tìm model trên Sketchfab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 2. Tiêu đề xe & Năm */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tên Dòng Xe / Tiêu Đề Chính <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.title || ''}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Mercedes-Benz W211 E55 AMG"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Năm Sản Xuất</label>
                <input
                  type="number"
                  value={config.year || 2006}
                  onChange={(e) => setConfig({ ...config, year: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>
            </div>

            {/* 3. Phụ đề tóm tắt */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Phụ Đề / Slogan Ngắn Gọn
              </label>
              <input
                type="text"
                value={config.subtitle || ''}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="V8 Kompressor Huyền Thoại • Gói AMG Thể Thao Cao Cấp"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
              />
            </div>

            {/* 4. Thông số xe: Giá thuê, Số chỗ, Nhiên liệu, Hộp số */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Giá Thuê / Ngày (VNĐ)</label>
                <input
                  type="number"
                  value={config.pricePerDay || 0}
                  onChange={(e) => setConfig({ ...config, pricePerDay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-600 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Số Chỗ Ngồi</label>
                <input
                  type="number"
                  value={config.seats || 5}
                  onChange={(e) => setConfig({ ...config, seats: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Động Cơ & Nhiên Liệu</label>
                <input
                  type="text"
                  value={config.fuel || ''}
                  onChange={(e) => setConfig({ ...config, fuel: e.target.value })}
                  placeholder="Xăng 5.4L V8 Supercharged (469 HP)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Hộp Số</label>
                <input
                  type="text"
                  value={config.transmission || ''}
                  onChange={(e) => setConfig({ ...config, transmission: e.target.value })}
                  placeholder="Tự động 5G-TRONIC Speedshift"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>
            </div>

            {/* 5. Nút CTA & Đường dẫn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Chữ Trên Nút CTA</label>
                <input
                  type="text"
                  value={config.ctaText || 'Thuê Xe Ngay'}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Đường Dẫn Đích Khi Bấm Nút</label>
                <input
                  type="text"
                  value={config.ctaLink || '/cars'}
                  onChange={(e) => setConfig({ ...config, ctaLink: e.target.value })}
                  placeholder="/cars?search=Mercedes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>
            </div>

            {/* 6. Chọn ảnh nền Gara & Showroom */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Ảnh Nền Showroom / Gara Có Sẵn
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BANNER_BG_PRESETS.map((preset) => {
                    const isSelected = (config.bgImageUrl || DEFAULT_HERO_BANNER.bgImageUrl) === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setConfig({ ...config, bgImageUrl: preset.url })}
                        className={`group relative flex flex-col text-left rounded-xl overflow-hidden border-2 transition-all p-1 cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-2 ring-amber-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div className="relative w-full h-16 rounded-lg overflow-hidden bg-slate-200">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 mt-1 line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Hoặc Nhập URL Ảnh Nền Tự Chọn</label>
                <input
                  type="text"
                  value={config.bgImageUrl || ''}
                  onChange={(e) => setConfig({ ...config, bgImageUrl: e.target.value })}
                  placeholder="/images/banners/showroom_luxury.jpg hoặc link https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Link Ảnh Render Dự Phòng (Fallback 2D)</label>
                <input
                  type="text"
                  value={config.fallbackImageUrl || ''}
                  onChange={(e) => setConfig({ ...config, fallbackImageUrl: e.target.value })}
                  placeholder="https://media.sketchfab.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/40 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Banner'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive 3D Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Xem Trước Trực Quan (Live Preview)
                </h3>
              </div>

              {/* Toggle Mode */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('3D')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === '3D'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mô Hình 3D
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('IMAGE')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    activePreviewTab === 'IMAGE'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ảnh 2D
                </button>
              </div>
            </div>

            {/* Mini Header Preview */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-black text-white">
                  {config.year} {config.title || 'Mercedes-Benz W211 E55 AMG'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                  3D Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{config.subtitle}</p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300 pt-0.5">
                <span>{config.seats} Chỗ</span>
                <span>•</span>
                <span>{config.fuel}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{formatCurrency(config.pricePerDay || 0)}/ngày</span>
              </div>
            </div>

            {/* 3D Frame or 2D image */}
            <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
              {activePreviewTab === '3D' && currentSketchfabId ? (
                <iframe
                  title={config.title}
                  src={`https://sketchfab.com/models/${currentSketchfabId}/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_watermark_link=0&ui_watermark=0&ui_hint=0&ui_theme=dark&ui_controls=1`}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                />
              ) : (
                <img
                  src={config.fallbackImageUrl || DEFAULT_HERO_BANNER.fallbackImageUrl}
                  alt={config.title}
                  className="w-full h-full object-contain p-4"
                />
              )}
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Bạn có thể dùng chuột bấm giữ và kéo để xoay 360 độ hoặc lăn con trỏ để phóng to/thu nhỏ trực tiếp mô hình trên đây.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

