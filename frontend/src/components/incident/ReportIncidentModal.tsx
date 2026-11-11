'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Camera,
  X,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  Upload,
  Trash2,
  ShieldAlert,
  Info,
  Car,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { incidentService, IncidentType } from '@/services/incident.service';

interface ReportIncidentModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newIncident: any) => void;
}

const INCIDENT_TYPES: { type: IncidentType; label: string; desc: string; color: string }[] = [
  {
    type: 'ACCIDENT',
    label: 'Tai Nạn / Va Chạm',
    desc: 'Va quẹt, đâm đụng, trầy xước hoặc móp méo thân vỏ xe',
    color: 'border-red-300 bg-red-50 text-red-900',
  },
  {
    type: 'BREAKDOWN',
    label: 'Hỏng Hóc Kỹ Thuật',
    desc: 'Chết máy, hỏng động cơ/pin, xịt lốp, sự cố hệ thống điện',
    color: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  {
    type: 'LOST_ACCESSORY',
    label: 'Mất Phụ Kiện',
    desc: 'Thất lạc chìa khóa, mất bánh dự phòng, kích nâng, tẩu sạc...',
    color: 'border-orange-300 bg-orange-50 text-orange-900',
  },
  {
    type: 'THEFT',
    label: 'Mất Cắp / Đột Nhập',
    desc: 'Xe hoặc tài sản gắn liền với xe bị trộm cắp, phá hoại',
    color: 'border-purple-300 bg-purple-50 text-purple-900',
  },
  {
    type: 'TRAFFIC_VIOLATION',
    label: 'Vi Phạm Giao Thông',
    desc: 'Bị CSGT lập biên bản, tạm giữ giấy tờ xe hoặc phạt nguội',
    color: 'border-blue-300 bg-blue-50 text-blue-900',
  },
  {
    type: 'OTHER',
    label: 'Sự Cố Khác',
    desc: 'Ngập nước, thiên tai hoặc các phát sinh ngoài dự kiến',
    color: 'border-slate-300 bg-slate-50 text-slate-900',
  },
];

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [incidentType, setIncidentType] = useState<IncidentType>('ACCIDENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking && isOpen) {
      setIncidentType('ACCIDENT');
      setTitle('');
      setDescription('');
      setLocation('');
      setOccurredAt(new Date().toISOString().slice(0, 16));
      setContactPhone(booking.phone || '');
      setEvidencePhotos([]);
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidencePhotos.length + files.length > 8) {
      toast.error('Tối đa tải lên 8 hình ảnh minh chứng sự cố');
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setEvidencePhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success(`Đã thêm ${files.length} ảnh minh chứng`);
  };

  const handleRemovePhoto = (idx: number) => {
    setEvidencePhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tóm tắt tiêu đề sự cố');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng mô tả chi tiết diễn biến sự cố');
      return;
    }

    try {
      setSubmitting(true);
      const res = await incidentService.createIncident({
        bookingIdOrCode: booking.bookingCode || booking.id,
        incidentType,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || 'Chưa rõ tọa độ cụ thể',
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
        contactPhone: contactPhone.trim() || booking.phone,
        evidencePhotos,
      });

      toast.success(res.message || 'Đã ghi nhận thông báo sự cố thành công!');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo sự cố');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20 text-white">
                Sprint 7 • US-18
              </span>
              <span className="text-xs text-white/80 font-medium">
                Mã đơn: #{booking.bookingCode}
              </span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
              Thông Báo Sự Cố Xe Trong Quá Trình Thuê
            </h2>
            <p className="text-xs text-white/90 mt-1">
              Gửi hình ảnh và mô tả để đội cứu hộ & giám định viên bảo hiểm hỗ trợ ngay
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Emergency Alert Box */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs">
            <PhoneCall className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-950">
                Cần cứu hộ khẩn cấp hoặc hỗ trợ y tế ngay lập tức?
              </p>
              <p className="text-rose-800">
                Hãy gọi ngay Hotline Cứu hộ 24/7 của chúng tôi: <strong className="text-rose-950 text-sm">1900 8888</strong> hoặc cấp cứu <strong className="text-rose-950">115</strong>. Giữ nguyên hiện trường và chụp ảnh trước khi di chuyển xe.
              </p>
            </div>
          </div>

          {/* Chọn loại sự cố (US-18) */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              1. Chọn phân loại sự cố <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {INCIDENT_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setIncidentType(t.type)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    incidentType === t.type
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-black text-slate-900">{t.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tiêu đề & Địa điểm & Thời điểm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-800">
                Tiêu đề tóm tắt sự cố <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Va quẹt nứt kính chắn gió trước / Xe chết máy trên đường cao tốc..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Địa điểm xảy ra sự cố
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Km 25 Cao tốc Long Thành - Dầu Giây..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl text-slate-900 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Thời điểm xảy ra sự cố
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl text-slate-900 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-800">
                Số điện thoại liên hệ hiện trường <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Nhập số điện thoại có thể liên lạc ngay tại hiện trường..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl text-slate-900 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Mô tả chi tiết sự việc & hiện trạng xe <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nguyên nhân, diễn biến va chạm, tình trạng xe hiện tại (có lăn bánh được không, đèn cảnh báo nào nổi lên, có bên thứ ba liên quan không)..."
              required
              className="w-full p-3 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-rose-500 rounded-xl text-slate-900 text-sm outline-none transition-all"
            />
          </div>

          {/* Upload hình ảnh minh chứng (US-18) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Hình ảnh minh chứng tại hiện trường (US-18)
              </label>
              <span className="text-xs text-slate-400">
                Đã tải {evidencePhotos.length}/8 ảnh
              </span>
            </div>

            {/* Grid ảnh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {evidencePhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
                >
                  <img
                    src={photo}
                    alt={`Minh chứng ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {evidencePhotos.length < 8 && (
                <label className="aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/30 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-slate-500 hover:text-rose-600">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <span className="text-[11px] font-bold">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              * Khuyến nghị chụp rõ 4 góc xe, vết va chạm cận cảnh, biển số xe và bối cảnh xung quanh để hồ sơ bảo hiểm được duyệt nhanh chóng.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              leftIcon={<ShieldAlert className="w-4 h-4 text-white" />}
            >
              {submitting ? 'Đang gửi thông báo...' : 'Gửi Thông Báo Sự Cố (US-18)'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
