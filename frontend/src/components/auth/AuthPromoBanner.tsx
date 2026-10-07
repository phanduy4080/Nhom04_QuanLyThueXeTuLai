'use client';

import React from 'react';
import { Car, CheckCircle2, Shield, Star, Award, Zap } from 'lucide-react';

export default function AuthPromoBanner() {
  const highlights = [
    {
      icon: <Car className="w-5 h-5 text-amber-400" />,
      title: 'Hơn 50+ dòng xe đời mới',
      desc: 'Từ sedan 4 chỗ thanh lịch đến SUV 7 chỗ đa dụng và xe điện VinFast hiện đại.',
    },
    {
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      title: 'Bảo hiểm 2 chiều trọn gói',
      desc: 'Yên tâm tuyệt đối trên mọi nẻo đường với gói bảo hiểm vật chất xe toàn diện.',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: 'Giao xe tận nơi trong 30 phút',
      desc: 'Nhận xe tại sân bay, khách sạn hoặc nhà riêng với thủ tục minh bạch, nhanh gọn.',
    },
  ];

  return (
    <div className="relative hidden lg:flex flex-col justify-between w-full h-full p-12 bg-linear-to-br from-gray-950 via-slate-900 to-gray-900 text-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Branding & Badges */}
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Dịch Vụ Thuê Xe Tự Lái Chuẩn 5 Sao</span>
        </div>

        <div>
          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Tự Do Khám Phá Mọi Cung Đường Cùng{' '}
            <span className="text-amber-400">QuickHatch</span>
          </h2>
          <p className="text-slate-300 text-base mt-3 leading-relaxed max-w-md">
            Trải nghiệm dịch vụ thuê xe tự lái chuẩn mực: xe sạch sẽ, khử khuẩn, hợp đồng điện tử tiện lợi và hỗ trợ cứu hộ 24/7.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4 pt-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs transition-all hover:bg-white/10"
            >
              <div className="p-2.5 rounded-xl bg-gray-900/90 border border-amber-400/20 shadow-xs">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Customer Testimonial & Rating */}
      <div className="relative z-10 pt-8 mt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center">
                TH
              </div>
              <div className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                VD
              </div>
              <div className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                HB
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-300">
                4.9/5 từ hơn 3,200+ khách hàng
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã xác minh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
