'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Gauge,
  Fuel,
  AlertTriangle,
  Sparkles,
  Camera,
  CheckCircle2,
  DollarSign,
  Clock,
  Car,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { rentalService, ReturnInspectionPreview } from '@/services/rental.service';

interface VehicleReturnModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const VehicleReturnModal: React.FC<VehicleReturnModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [returnOdo, setReturnOdo] = useState<number>(0);
  const [returnFuel, setReturnFuel] = useState<number>(100);
  const [isInteriorDirty, setIsInteriorDirty] = useState<boolean>(false);
  const [newDamages, setNewDamages] = useState<string>('');
  const [newDamagesFee, setNewDamagesFee] = useState<number>(0);
  const [isDisputed, setIsDisputed] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('Nhân viên trạm nhận xe');
  const [notes, setNotes] = useState<string>('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600',
  ]);
  const [newPhotoInput, setNewPhotoInput] = useState<string>('');

  const [preview, setPreview] = useState<ReturnInspectionPreview | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (booking && isOpen) {
      const initialOdo = Number(booking.vehicle?.odometerKm || 15000);
      setReturnOdo(initialOdo + 120);
      setReturnFuel(90);
      setIsInteriorDirty(false);
      setNewDamages('');
      setNewDamagesFee(0);
      setIsDisputed(false);
      setDisputeReason('');
    }
  }, [booking, isOpen]);

  // Tự động tính toán preview phí vi phạm mỗi khi các thông số thay đổi
  useEffect(() => {
    if (!booking || !isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setIsCalculating(true);
        const res = await rentalService.calculateReturnInspection({
          bookingId: booking.bookingCode || booking.bookingId || booking.id,
          returnOdo: Number(returnOdo) || 0,
          returnFuelPercent: Number(returnFuel) || 0,
          isInteriorDirty,
          newDamages,
          newDamagesFee: Number(newDamagesFee) || 0,
          isDisputed,
          disputeReason,
        });
        if (res?.data) {
          setPreview(res.data);
        }
      } catch (err: any) {
        console.error('Lỗi tính phí vi phạm:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [booking, isOpen, returnOdo, returnFuel, isInteriorDirty, newDamages, newDamagesFee, isDisputed, disputeReason]);

  if (!isOpen || !booking) return null;

  const handleAddPhoto = () => {
    if (!newPhotoInput.trim()) return;
    setPhotoUrls([...photoUrls, newPhotoInput.trim()]);
    setNewPhotoInput('');
    toast.success('Đã thêm ảnh bằng chứng kiểm tra xe');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== idx));
  };

  const handleSubmitReturn = async () => {
    try {
      setIsSubmitting(true);
      const res = await rentalService.createReturnHandover({
        bookingId: booking.bookingCode || booking.bookingId || booking.id,
        returnOdo: Number(returnOdo),
        returnFuelPercent: Number(returnFuel),
        isInteriorDirty,
        newDamages,
        newDamagesFee: Number(newDamagesFee) || 0,
        isDisputed,
        disputeReason,
        inspectionPhotos: photoUrls,
        staffName,
        carCondition: notes || 'Hoàn tất bàn giao nhận lại xe và đối chiếu chỉ số.',
      });

      toast.success(
        isDisputed || (Number(newDamagesFee) >= 2000000)
          ? 'Đã lập biên bản hoàn trả xe & tự động mở hồ sơ sự cố/tranh chấp để thẩm định!'
          : 'Lập Biên bản hoàn trả xe (CHECKIN) thành công! Xe chuyển sang chờ vệ sinh & kỹ thuật.',
      );
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lập biên bản trả xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Lập Biên Bản Hoàn Trả Xe (Sprint 8 & 9)</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                  {booking.bookingCode}
                </span>
              </div>
              <p className="text-xs text-white/90">
                US-20, US-21, US-22, US-23: Đối chiếu ODO, nhiên liệu, tính phạt vi phạm & xử lý hư hỏng
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
          {/* Thông tin tóm tắt xe & khách */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Phương tiện</p>
                <p className="font-semibold text-slate-800">
                  {booking.vehicle?.model?.brand?.name} {booking.vehicle?.model?.name}
                </p>
                <p className="text-xs font-mono text-emerald-700">{booking.vehicle?.licensePlate}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Khách hàng</p>
              <p className="font-semibold text-slate-800">{booking.customerName}</p>
              <p className="text-xs text-slate-600 font-mono">{booking.phone}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium">Tiền cọc đã thu</p>
              <p className="font-bold text-base text-emerald-700">
                {formatCurrency(Number(booking.depositAmount || 0))}
              </p>
              <p className="text-xs text-slate-500">Giới hạn: {booking.vehicle?.dailyKmLimit || 350} km/ngày</p>
            </div>
          </div>

          {/* Form nhập dữ liệu kiểm tra trả xe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái: ODO & Nhiên liệu */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span>Đối chiếu ODO & Nhiên liệu (US-20)</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số ODO khi trả xe (km) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={returnOdo}
                    onChange={(e) => setReturnOdo(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="VD: 15450"
                  />
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ODO lúc giao: <span className="font-mono font-medium">{preview?.checkoutOdo || booking.vehicle?.odometerKm || 0} km</span>
                  {preview && ` | Đã chạy: ${preview.kmDriven} km | Định mức: ${preview.allowedKm} km`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mức nhiên liệu / Pin khi trả (%) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={returnFuel}
                    onChange={(e) => setReturnFuel(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <span className="w-14 text-center font-bold text-sm bg-emerald-50 text-emerald-800 py-1 rounded border border-emerald-200">
                    {returnFuel}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mức khi giao: {preview?.checkoutFuel || 100}%. Nếu hụt &gt; 5% hệ thống sẽ tự động tính phí bù nhiên liệu.
                </p>
              </div>

              {/* Vệ sinh */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isInteriorDirty}
                    onChange={(e) => setIsInteriorDirty(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Xe bẩn, nội thất cần vệ sinh chuyên sâu</span>
                    <p className="text-[11px] text-amber-800">Phụ thu phí dọn dẹp vệ sinh: +300.000 VNĐ</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Cột phải: Hư hỏng mới & Tranh chấp (US-23) */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Hư hỏng mới & Tranh chấp bồi thường (US-23)</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả hư hỏng, trầy xước mới phát sinh
                </label>
                <textarea
                  rows={2}
                  value={newDamages}
                  onChange={(e) => setNewDamages(e.target.value)}
                  placeholder="Ghi nhận trầy cản trước, nứt gương chiếu hậu, móp cửa..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chi phí ước tính bồi thường hư hỏng (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={newDamagesFee}
                    onChange={(e) => setNewDamagesFee(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="VD: 500000"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Tranh chấp */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDisputed}
                    onChange={(e) => setIsDisputed(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-900">
                    Phát sinh tranh chấp / Chuyển sang quy trình thẩm định (US-23)
                  </span>
                </label>

                {isDisputed && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-semibold text-red-800 mb-1">
                      Lý do tranh chấp / Ý kiến khách hàng:
                    </label>
                    <textarea
                      rows={2}
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Khách không đồng ý mức bồi thường, yêu cầu garage bên thứ 3 thẩm định..."
                      className="w-full p-2 border border-red-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bằng chứng hình ảnh kiểm tra xe */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <span>Ảnh chụp hiện trạng xe lúc trả ({photoUrls.length} ảnh)</span>
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newPhotoInput}
                onChange={(e) => setNewPhotoInput(e.target.value)}
                placeholder="Dán link ảnh chụp hiện trạng xe..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <Button size="sm" variant="outline" type="button" onClick={handleAddPhoto}>
                Thêm ảnh
              </Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                  <img src={url} alt={`evidence-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BẢNG TÍNH TOÁN PHÍ PHẠT VI PHẠM TỰ ĐỘNG (US-22) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Bảng Tính Phí Vi Phạm Tự Động (US-22)</h4>
              </div>
              {isCalculating ? (
                <span className="text-xs text-amber-300 animate-pulse">Đang tính toán lại...</span>
              ) : (
                <span className="text-xs text-emerald-400 font-mono">Đã đồng bộ chính sách</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <p className="text-slate-400">Vượt số km quy định</p>
                <p className="font-bold text-white mt-1">
                  +{preview?.excessKm || 0} km
                </p>
                <p className="text-amber-400 font-mono font-semibold">
                  {formatCurrency(preview?.excessKmFee || 0)}
                </p>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <p className="text-slate-400">Trả trễ hạn</p>
                <p className="font-bold text-white mt-1">
                  +{preview?.lateHours || 0} giờ
                </p>
                <p className="text-amber-400 font-mono font-semibold">
                  {formatCurrency(preview?.lateFee || 0)}
                </p>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <p className="text-slate-400">Thiếu nhiên liệu/pin</p>
                <p className="font-bold text-white mt-1">
                  Hụt {preview?.fuelShortagePercent || 0}%
                </p>
                <p className="text-amber-400 font-mono font-semibold">
                  {formatCurrency(preview?.fuelShortageFee || 0)}
                </p>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <p className="text-slate-400">Vệ sinh + Hư hỏng</p>
                <p className="font-bold text-white mt-1">
                  {isInteriorDirty ? 'Vệ sinh' : 'Không'} {newDamagesFee > 0 ? '+ Hỏng' : ''}
                </p>
                <p className="text-amber-400 font-mono font-semibold">
                  {formatCurrency((preview?.cleaningFee || 0) + (preview?.newDamagesFee || 0))}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs text-slate-300">
                <span>Tiền cọc sẵn sàng cấn trừ: </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(Number(booking.depositAmount || 0))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 mr-2">TỔNG PHÍ PHẠT VI PHẠM:</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {formatCurrency(preview?.totalPenaltyFee || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy Bỏ
          </Button>

          <Button
            type="button"
            onClick={handleSubmitReturn}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? (
              'Đang xử lý...'
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Lập Biên Bản Hoàn Trả Xe (CHECKIN)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
