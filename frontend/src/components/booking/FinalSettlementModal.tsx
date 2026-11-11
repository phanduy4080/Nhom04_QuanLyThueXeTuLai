'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  AlertCircle,
  FileCheck,
  Car,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { rentalService, HandoverRecordItem } from '@/services/rental.service';

interface FinalSettlementModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const FinalSettlementModal: React.FC<FinalSettlementModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [checkinHandover, setCheckinHandover] = useState<HandoverRecordItem | null>(null);
  const [damageCompensation, setDamageCompensation] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (booking && isOpen) {
      // Tìm biên bản hoàn trả CHECKIN nếu có
      const fetchHandover = async () => {
        try {
          const res = await rentalService.getHandoverByBooking(booking.bookingCode || booking.bookingId || booking.id);
          if (res?.data && res.data.type === 'CHECKIN') {
            setCheckinHandover(res.data);
          }
        } catch {
          // fallback
        }
      };
      fetchHandover();
      setDamageCompensation(0);
      setPaymentMethod('BANK_TRANSFER');
      setNotes('');
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const totalRentalAmount = Number(booking.totalAmount || 0);
  const totalPenalties = checkinHandover
    ? Number((checkinHandover as any).totalPenaltyFee || (checkinHandover as any).checklist?.totalPenaltyFee || 0)
    : 0;
  const depositAmount = Number(booking.depositAmount || 0);

  const extraCharges = totalPenalties + Number(damageCompensation || 0);
  const netDepositBalance = depositAmount - extraCharges;
  const isRefund = netDepositBalance >= 0;
  const refundAmount = isRefund ? netDepositBalance : 0;
  const additionalCharge = !isRefund ? Math.abs(netDepositBalance) : 0;

  const handleConfirmSettlement = async () => {
    try {
      setLoading(true);
      const res = await rentalService.createSettlement({
        bookingId: booking.bookingCode || booking.bookingId || booking.id,
        handoverId: checkinHandover?.id,
        damageCompensation: Number(damageCompensation) || 0,
        paymentMethod,
        notes: notes || `Quyết toán hợp đồng ${booking.contractNumber || booking.bookingCode}.`,
      });

      toast.success(res.message || 'Quyết toán và kết thúc hợp đồng thành công!');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi quyết toán hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Quyết Toán Hợp Đồng & Cấn Trừ Cọc (Sprint 10)</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                  {booking.bookingCode}
                </span>
              </div>
              <p className="text-xs text-white/90">
                US-24, US-25: Cấn trừ cọc, tính số tiền hoàn trả hoặc thu thêm & kết thúc hợp đồng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thông tin khách hàng & xe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Khách hàng & Hợp đồng</p>
              <p className="font-bold text-slate-900">{booking.customerName}</p>
              <p className="text-xs text-slate-600">SĐT: {booking.phone}</p>
              <p className="text-xs text-indigo-700 font-mono mt-0.5">
                Mã HĐ: {booking.contractNumber || `HD-${booking.bookingCode}`}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Phương tiện thuê</p>
              <p className="font-bold text-slate-900">
                {booking.vehicle?.model?.brand?.name} {booking.vehicle?.model?.name}
              </p>
              <p className="text-xs font-mono text-emerald-700 font-bold">{booking.vehicle?.licensePlate}</p>
              <p className="text-xs text-slate-500">Số ngày thuê: {booking.totalDays || 1} ngày</p>
            </div>
          </div>

          {/* Bảng kê tổng hợp tài chính (US-24) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 flex justify-between">
              <span>HẠNG MỤC TÀI CHÍNH</span>
              <span>SỐ TIỀN (VNĐ)</span>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between items-center px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-800">1. Tiền thuê xe ban đầu</p>
                  <p className="text-xs text-slate-500">Theo hợp đồng đã ký kết</p>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(totalRentalAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3 bg-amber-50/40">
                <div>
                  <p className="font-semibold text-amber-900">2. Tổng phí vi phạm khi trả xe (US-22)</p>
                  <p className="text-xs text-amber-700">Quá km, trễ hạn, hao hụt nhiên liệu, vệ sinh</p>
                </div>
                <span className="font-mono font-bold text-amber-800">
                  +{formatCurrency(totalPenalties)}
                </span>
              </div>

              <div className="flex justify-between items-center px-4 py-3">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-slate-800">3. Bồi thường hư hỏng bổ sung (nếu có)</p>
                  <p className="text-xs text-slate-500">Thoả thuận đền bù thiệt hại ngoài các khoản trên</p>
                </div>
                <div className="w-40">
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={damageCompensation}
                    onChange={(e) => setDamageCompensation(Number(e.target.value))}
                    className="w-full text-right px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center px-4 py-3 bg-emerald-50/60">
                <div>
                  <p className="font-semibold text-emerald-900">4. Tiền cọc xe đã thu (Tạm ứng)</p>
                  <p className="text-xs text-emerald-700">Đã thanh toán trước khi nhận xe</p>
                </div>
                <span className="font-mono font-bold text-emerald-800">
                  -{formatCurrency(depositAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* KẾT QUẢ CẤN TRỪ CỌC (HOÀN TRẢ HOẶC THU THÊM) */}
          <div
            className={`p-5 rounded-2xl border ${
              isRefund
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isRefund ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isRefund ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kết quả cấn trừ cọc (US-24)
                  </span>
                  <h4 className="text-lg font-black mt-0.5">
                    {isRefund ? 'HOÀN TRẢ TIỀN CỌC CHO KHÁCH' : 'KHÁCH THANH TOÁN BỔ SUNG'}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono">
                  {formatCurrency(isRefund ? refundAmount : additionalCharge)}
                </span>
                <p className="text-xs opacity-75 mt-0.5">
                  {isRefund
                    ? `Cọc (${formatCurrency(depositAmount)}) - Phí phát sinh (${formatCurrency(extraCharges)})`
                    : `Phí phát sinh (${formatCurrency(extraCharges)}) vượt quá cọc`}
                </p>
              </div>
            </div>
          </div>

          {/* Phương thức xử lý & Ghi chú */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phương thức {isRefund ? 'hoàn cọc' : 'thu thêm'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng (VietQR)</option>
                <option value="CASH">Tiền mặt tại quầy</option>
                <option value="CREDIT_CARD">Thẻ Tín dụng / Thẻ ghi nợ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ghi chú quyết toán hợp đồng
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Khách đã xác nhận nhận lại tiền cọc..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Đóng
          </Button>

          <Button
            type="button"
            onClick={handleConfirmSettlement}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              'Đang xử lý...'
            ) : (
              <>
                <FileCheck className="w-4 h-4 mr-2" />
                Xác Nhận Quyết Toán & Kết Thúc Hợp Đồng (US-25)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
