'use client';

import React, { useState } from 'react';
import { X, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RejectBookingModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
  loading: boolean;
}

const PRESET_REASONS = [
  'GPLX chưa đủ 1 năm kinh nghiệm hoặc đã hết hạn',
  'Ảnh chụp CCCD/GPLX bị mờ, lóa sáng hoặc mất góc',
  'Thông tin giấy tờ không trùng khớp với người đăng ký',
  'Khách hàng chưa đủ độ tuổi thuê xe theo quy định (≥ 21 tuổi)',
  'Xe có lịch bảo dưỡng kỹ thuật đột xuất',
  'Khách hàng chủ động yêu cầu hủy đơn qua điện thoại',
];

export const RejectBookingModal: React.FC<RejectBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedPreset === 'OTHER' ? customReason.trim() : selectedPreset;
    if (!finalReason) return;
    onConfirm(finalReason, notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Từ Chối Yêu Cầu Thuê Xe (US-10)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Đơn thuê: <strong>{booking.bookingCode}</strong> • {booking.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Hệ thống sẽ cập nhật trạng thái đơn sang <strong>REJECTED</strong>, lưu lý do từ chối và tự động giải phóng xe <strong>{booking.carName} ({booking.licensePlate})</strong> về trạng thái sẵn sàng cho khách khác.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Chọn lý do từ chối: <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
            >
              {PRESET_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
              <option value="OTHER">Lý do khác...</option>
            </select>
          </div>

          {selectedPreset === 'OTHER' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nhập chi tiết lý do từ chối: <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do cụ thể..."
                rows={2}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ghi chú nội bộ cho nhân viên / CSKH (không bắt buộc):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm nếu đã trao đổi với khách..."
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Hủy Bỏ
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              isLoading={loading}
              leftIcon={<XCircle className="w-4 h-4 text-white" />}
            >
              Xác Nhận Từ Chối Đơn
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

