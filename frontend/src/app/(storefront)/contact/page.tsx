'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Headphones,
  Car,
  ShieldCheck,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceType: 'Tự Lái Cá Nhân',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = [
    {
      name: 'Chi Nhánh Sân Bay Tân Sơn Nhất (Hub Chính)',
      address: '45 Trường Sơn, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh',
      phone: '028 3848 5555',
      email: 'sgn@quickhatch.vn',
      hours: 'Phục vụ 24/7 (Giao xe tận sảnh ga quốc nội & quốc tế)',
      isHub: true,
    },
    {
      name: 'Chi Nhánh Trung Tâm Quận 1',
      address: '120 Lê Lai, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      phone: '028 3925 8888',
      email: 'q1@quickhatch.vn',
      hours: '07:00 - 22:00 hàng ngày',
      isHub: false,
    },
    {
      name: 'Chi Nhánh Sân Bay Nội Bài (Hà Nội)',
      address: 'Sảnh T1 & T2 Sân bay Quốc tế Nội Bài, Sóc Sơn, Hà Nội',
      phone: '024 3886 6666',
      email: 'han@quickhatch.vn',
      hours: 'Phục vụ 24/7 (Giao nhận xe tận nơi)',
      isHub: false,
    },
    {
      name: 'Chi Nhánh TP. Đà Nẵng',
      address: '88 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng',
      phone: '0236 3828 888',
      email: 'dad@quickhatch.vn',
      hours: '06:00 - 23:00 hàng ngày',
      isHub: false,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      toast.error('Vui lòng nhập họ tên và số điện thoại liên hệ');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Gửi yêu cầu thành công! Tư vấn viên QuickHatch sẽ liên hệ lại trong vòng 15 phút.');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        serviceType: 'Tự Lái Cá Nhân',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-4 text-center sm:text-left relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Liên Hệ Với QuickHatch
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Bạn cần tư vấn chọn dòng xe, đặt lịch giao xe tận nơi hay cần hỗ trợ sự cố khẩn cấp trên hành trình? Đội ngũ chuyên viên QuickHatch luôn sẵn sàng phục vụ 24/7.
          </p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hotline Tư Vấn</span>
            <p className="text-lg font-black text-slate-900 mt-1">1900 8888</p>
            <p className="text-xs text-slate-500">Hỗ trợ khẩn cấp & đặt xe: 028 3848 5555</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hòm Thư Hỗ Trợ</span>
            <p className="text-lg font-black text-slate-900 mt-1">support@quickhatch.vn</p>
            <p className="text-xs text-slate-500">Phản hồi email trong vòng 15 phút</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Giờ Làm Việc</span>
            <p className="text-lg font-black text-slate-900 mt-1">Phục Vụ 24/7</p>
            <p className="text-xs text-slate-500">Tất cả các ngày trong tuần (kể cả Lễ, Tết)</p>
          </div>
        </div>
      </div>

      {/* Main Content: Contact Form & Branches Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-xl font-black text-slate-900">Gửi Yêu Cầu Tư Vấn Nhanh</h2>
              <p className="text-xs text-slate-500">Nhận báo giá chi tiết và ưu đãi đặc biệt qua tin nhắn</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và Tên Quý Khách"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số Điện Thoại"
                placeholder="0901 234 567"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <Input
                label="Email (Không bắt buộc)"
                placeholder="email@vidu.vn"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nhu Cầu Thuê Xe
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="Tự Lái Cá Nhân">Thuê xe tự lái du lịch / công tác</option>
                <option value="Thuê Xe Theo Tháng">Thuê xe dài hạn theo tháng (Doanh nghiệp)</option>
                <option value="Thuê Xe Điện VinFast">Trải nghiệm xe điện VinFast (VF3, VF8)</option>
                <option value="Tư Vấn Hợp Đồng">Hỏi thông tin hợp đồng & chính sách cọc</option>
                <option value="Khác">Nhu cầu khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Lời Nhắn / Yêu Cầu Chi Tiết
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Nhập lộ trình dự kiến, ngày nhận/trả xe hoặc các yêu cầu giao xe tận nơi..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-amber-500/20"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Gửi Thông Tin Ngay
            </Button>
          </form>
        </div>

        {/* Right Column: Branches Network */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-xl font-black text-slate-900">Mạng Lưới Chi Nhánh & Bãi Giao Xe</h2>
                <p className="text-xs text-slate-500">Hệ thống bãi xe hiện đại tại các vị trí đắc địa</p>
              </div>
            </div>

            <div className="space-y-4">
              {branches.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    b.isHub
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                    {b.isHub && (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-gray-950 rounded-full">
                        HUB CHÍNH
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Phone className="w-3 h-3 text-amber-600" /> {b.phone}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" /> {b.hours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
