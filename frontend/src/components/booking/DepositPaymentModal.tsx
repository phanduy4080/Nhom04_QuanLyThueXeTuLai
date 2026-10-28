'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Copy,
  Clock,
  Building,
  ShieldCheck,
  X,
  AlertCircle,
  ExternalLink,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { bookingService } from '@/services/booking.service';

interface DepositPaymentModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBooking: any) => void;
}

export const DepositPaymentModal: React.FC<DepositPaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'VIETQR' | 'MOMO' | 'VNPAY' | 'COUNTER'>('VIETQR');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const depositAmount = Number(booking.depositAmount || 0);
  const transferSyntax = `COC ${booking.bookingCode}`;
  const accountNumber = '1028889999';
  const bankName = 'Vietcombank (Ngân hàng Ngoại thương VN)';
  const accountHolder = 'CTY CP QUICKHATCH VN';
  const qrUrl = `https://img.vietqr.io/image/970436-${accountNumber}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent(accountHolder)}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      const res = await bookingService.payDeposit(booking.bookingCode || booking.id, {
        paymentMethod: selectedMethod,
        amount: depositAmount,
        notes: `Khách hàng xác nhận thanh toán cọc qua ${selectedMethod}`,
      });

      toast.success('Xác nhận thanh toán tiền cọc thành công! Hệ thống đã giữ xe và tạo Hợp đồng điện tử.');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận cọc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Thanh Toán Tiền Cọc Giữ Xe (US-11)
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

        {/* Deposit Summary Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-bold block uppercase tracking-wider">
              Số tiền cọc cần thanh toán
            </span>
            <span className="text-2xl font-black text-amber-950 font-mono">
              {formatCurrency(depositAmount)}
            </span>
          </div>
          <div className="text-right text-[11px] text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            Hoàn lại 100% khi trả xe
          </div>
        </div>

        {/* Payment Methods Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Chọn phương thức thanh toán tiền cọc:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMethod('VIETQR')}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedMethod === 'VIETQR'
                  ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
              }`}
            >
              <QrCode className="w-4 h-4 mx-auto mb-1 text-amber-600" />
              <span>Chuyển Khoản VietQR</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('MOMO')}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedMethod === 'MOMO'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-950 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Wallet className="w-4 h-4 mx-auto mb-1 text-rose-600" />
              <span>Ví MoMo</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('VNPAY')}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedMethod === 'VNPAY'
                  ? 'border-blue-500 bg-blue-50/80 text-blue-950 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <span>VNPAY / Thẻ</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('COUNTER')}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                selectedMethod === 'COUNTER'
                  ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Building className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
              <span>Tại Trạm Xe</span>
            </button>
          </div>
        </div>

        {/* Content based on method */}
        {selectedMethod === 'VIETQR' && (
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shrink-0 shadow-xs">
                <img
                  src={qrUrl}
                  alt="VietQR Chuyển khoản cọc"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div>
                  <span className="text-[11px] text-slate-500 block">Ngân hàng thụ hưởng:</span>
                  <strong className="text-slate-900 block font-semibold">{bankName}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Số tài khoản:</span>
                    <strong className="text-slate-900 font-mono text-sm font-black">{accountNumber}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(accountNumber, 'Số tài khoản')}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'Số tài khoản' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Chủ tài khoản:</span>
                    <strong className="text-slate-900 text-xs font-semibold">{accountHolder}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold block">Nội dung chuyển khoản (bắt buộc):</span>
                    <strong className="text-amber-950 font-mono text-xs font-black">{transferSyntax}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferSyntax, 'Cú pháp')}
                    className="px-2 py-1 bg-amber-500 text-white rounded-md text-[11px] hover:bg-amber-600 flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'Cú pháp' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Mở app ngân hàng quét mã QR, số tiền và nội dung chuyển khoản sẽ được tự động điền chính xác.
            </p>
          </div>
        )}

        {selectedMethod === 'MOMO' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2 text-center">
            <Wallet className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="font-bold text-rose-950 text-sm">Thanh toán qua Ví MoMo</h4>
            <p className="text-slate-600 text-xs">
              Mã giao dịch MoMo QuickPay sẽ tự động liên kết tài khoản và trích tiền cọc <strong>{formatCurrency(depositAmount)}</strong>.
            </p>
          </div>
        )}

        {selectedMethod === 'VNPAY' && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-2 text-center">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="font-bold text-blue-950 text-sm">Cổng thanh toán VNPAY / Thẻ Tín Dụng</h4>
            <p className="text-slate-600 text-xs">
              Hỗ trợ thẻ ATM nội địa (Napas), thẻ Quốc tế Visa, MasterCard, JCB và Apple Pay.
            </p>
          </div>
        )}

        {selectedMethod === 'COUNTER' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-700" />
              Đặt Cọc Trực Tiếp Tại Trạm Xe
            </h4>
            <p className="text-slate-700 text-xs">
              Quý khách có thể đến trực tiếp trạm xe <strong>{booking.pickupBranch || 'Chi nhánh nhận xe'}</strong> trước giờ nhận xe để đặt cọc bằng tiền mặt hoặc quẹt thẻ POS.
            </p>
          </div>
        )}

        {/* Security & Action */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thanh toán được bảo mật theo tiêu chuẩn PCI-DSS và quy định ngân hàng Nhà nước.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Để Sau
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmPayment}
              isLoading={loading}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-gray-950" />}
            >
              Tôi Đã Thanh Toán Tiền Cọc
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
