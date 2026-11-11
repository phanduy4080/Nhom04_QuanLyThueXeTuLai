'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Info,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Ban,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  bookingService,
  ExtensionPreviewData,
  RentalExtensionItem,
} from '@/services/booking.service';

interface RentalExtensionModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBooking: any) => void;
}

export const RentalExtensionModal: React.FC<RentalExtensionModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<ExtensionPreviewData | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [extensionHistory, setExtensionHistory] = useState<RentalExtensionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Khởi tạo ngày gia hạn mặc định: ngày hiện tại + 1 ngày
  useEffect(() => {
    if (booking && isOpen) {
      const curEnd = new Date(booking.endDate || Date.now());
      // Thêm 24h mặc định
      const defaultNewEnd = new Date(curEnd.getTime() + 24 * 60 * 60 * 1000);
      const isoStr = defaultNewEnd.toISOString().slice(0, 16);
      setNewEndDate(isoStr);
      setReason('');
      setPreview(null);
      setPreviewError(null);

      // Tự động tính toán preview
      fetchPreview(isoStr);
      fetchHistory();
    }
  }, [booking, isOpen]);

  const fetchHistory = async () => {
    if (!booking) return;
    try {
      setLoadingHistory(true);
      const res = await bookingService.getExtensions(booking.bookingCode || booking.id);
      if (res?.data) {
        setExtensionHistory(res.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPreview = async (dateStr: string) => {
    if (!booking || !dateStr) return;
    try {
      setLoadingPreview(true);
      setPreviewError(null);
      const res = await bookingService.previewExtension(booking.bookingCode || booking.id, {
        newEndDate: new Date(dateStr).toISOString(),
        reason,
      });
      if (res?.data) {
        setPreview(res.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tính toán chi phí gia hạn';
      setPreviewError(msg);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDateChange = (val: string) => {
    setNewEndDate(val);
    fetchPreview(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndDate) {
      toast.error('Vui lòng chọn thời gian trả xe mới');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingService.requestExtension(booking.bookingCode || booking.id, {
        newEndDate: new Date(newEndDate).toISOString(),
        reason: reason.trim() || 'Khách hàng yêu cầu gia hạn thuê xe qua ứng dụng',
      });

      if (res.data?.systemDecision === 'AUTO_APPROVED' || res.statusCode === 200) {
        toast.success(res.message || 'Yêu cầu gia hạn đã được HỆ THỐNG TỰ ĐỘNG DUYỆT THÀNH CÔNG!');
        // Refresh booking details
        const updated = await bookingService.getBookingByIdOrCode(booking.bookingCode || booking.id);
        if (updated?.data) {
          onSuccess(updated.data);
        }
        onClose();
      } else {
        toast.error(res.message || 'Yêu cầu gia hạn bị hệ thống tự động từ chối');
        fetchHistory();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi gửi yêu cầu gia hạn';
      toast.error(msg);
      fetchHistory();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  const currentEndFormatted = booking.endDate
    ? new Date(booking.endDate).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  const minDateIso = booking.endDate
    ? new Date(new Date(booking.endDate).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20 text-white">
                Sprint 6 • US-16 & US-17
              </span>
              <span className="text-xs text-white/80 font-medium">
                Mã đơn: #{booking.bookingCode}
              </span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Gia Hạn Thời Gian Thuê Xe
            </h2>
            <p className="text-xs text-white/90 mt-1">
              Hệ thống tự động kiểm tra lịch trống tiếp theo và xét duyệt ngay tức thì
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
          {/* Thông tin phương tiện & Hạn trả hiện tại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Phương tiện đang thuê
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {booking.carName || 'Xe Ô Tô'}
              </p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Biển số: {booking.licensePlate || 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Hạn trả xe hiện tại
              </p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700 mt-0.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{currentEndFormatted}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Đơn giá: {formatCurrency(booking.dailyPrice || 0)}/ngày
              </p>
            </div>
          </div>

          {/* Chọn thời gian trả mới */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Chọn thời gian trả xe mới (US-16) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="datetime-local"
                min={minDateIso}
                value={newEndDate}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-2 border-slate-200 focus:border-teal-500 rounded-xl text-slate-900 text-sm font-semibold transition-all outline-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              * Thời gian trả mới phải sau thời gian trả hiện tại. Hệ thống sẽ tự động đối chiếu lịch xe.
            </p>
          </div>

          {/* Lý do gia hạn */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Lý do xin gia hạn (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Tôi có việc phát sinh hoặc muốn kéo dài chuyến đi trải nghiệm..."
              className="w-full p-3 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-teal-500 rounded-xl text-slate-900 text-sm transition-all outline-none"
            />
          </div>

          {/* Kết quả kiểm tra lịch & Xem trước chi phí (US-17) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Kiểm tra tự động & Dự toán phát sinh (US-17)
              </h3>
              {loadingPreview && (
                <span className="text-xs font-semibold text-teal-600 animate-pulse flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Đang kiểm tra lịch trống...
                </span>
              )}
            </div>

            {previewError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Không thể gia hạn theo thời gian đã chọn</p>
                  <p>{previewError}</p>
                </div>
              </div>
            )}

            {preview && (
              <div className="space-y-3">
                {/* Trạng thái xét duyệt tự động */}
                {preview.isAvailable ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                        Đủ điều kiện TỰ ĐỘNG DUYỆT (Auto-Approved)
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {preview.decisionNote}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
                    <Ban className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-amber-900 uppercase tracking-wide">
                        Cảnh báo: Sẽ bị TỰ ĐỘNG TỪ CHỐI (Auto-Rejected)
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        {preview.conflictReason || 'Xe đã có khách hàng khác đặt trước hoặc có lịch bảo dưỡng.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bảng chi phí gia hạn */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Số ngày gia hạn thêm:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      +{preview.extendedDays} ngày
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Đơn giá thuê theo ngày:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(preview.dailyPrice)}/ngày
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Tổng ngày thuê sau khi duyệt:</span>
                    <span className="font-bold text-slate-900">
                      {preview.newTotalDays} ngày (hiện tại: {preview.currentTotalDays} ngày)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-teal-800 text-sm">
                      Chi phí phát sinh thêm:
                    </span>
                    <span className="font-black text-teal-700 text-base">
                      +{formatCurrency(preview.extraAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-dashed border-slate-200">
                    <span>Tổng giá trị đơn thuê mới:</span>
                    <span className="font-black text-slate-900">
                      {formatCurrency(preview.newTotalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lịch sử các lần gia hạn trước đó nếu có */}
          {extensionHistory.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Lịch sử gia hạn của đơn này ({extensionHistory.length} lần)
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {extensionHistory.map((ext) => (
                  <div
                    key={ext.extensionId}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-900">{ext.extensionCode}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            ext.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ext.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ext.status === 'APPROVED' ? 'Đã duyệt' : ext.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        +{ext.extendedDays} ngày • Đến: {new Date(ext.newEndDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-teal-700">
                        +{formatCurrency(ext.extraAmount)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(ext.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={submitting || !preview || !preview.isAvailable}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              {submitting
                ? 'Đang xử lý...'
                : preview?.isAvailable
                ? 'Gửi & Tự Động Duyệt Ngay (US-16, US-17)'
                : 'Không Thể Gia Hạn (Trùng Lịch)'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

