'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  X,
  Gauge,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  Camera,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Plus,
  Trash2,
  FileText,
  User,
  Car as CarIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { rentalService, HandoverRecordItem } from '@/services/rental.service';
import { uploadService } from '@/services/upload.service';

interface HandoverInspectionModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: HandoverRecordItem) => void;
}

export function HandoverInspectionModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: HandoverInspectionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Technical inputs (US-13)
  const [odoMeter, setOdoMeter] = useState<number>(
    booking?.carOdometer || 12500,
  );
  const [fuelLevel, setFuelLevel] = useState<string>(
    booking?.fuelType === 'ELECTRIC' ? 'Pin 95%' : 'Xăng 100% (8/8 vạch)',
  );
  const [carCondition, setCarCondition] = useState<string>(
    'Xe sạch sẽ, hoạt động hoàn hảo, đã được kiểm tra kỹ thuật an toàn trước khi bàn giao.',
  );

  // Checklist: Exterior, Interior, Accessories
  const [checklist, setChecklist] = useState({
    exterior: {
      bodyClean: true,
      lightsOk: true,
      mirrorsOk: true,
      tiresOk: true,
      windshieldOk: true,
    },
    interior: {
      seatsClean: true,
      steeringWheelOk: true,
      acOk: true,
      odorFree: true,
      matsOk: true,
    },
    accessories: {
      registrationDoc: true,
      insuranceCert: true,
      spareTire: true,
      toolKit: true,
      dashcam: true,
    },
  });

  // Existing Damages list (Ghi nhận hư hỏng cũ)
  const [damages, setDamages] = useState<
    Array<{ position: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>
  >([]);

  // Photos (Ảnh chụp kiểm tra thực tế)
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Signatures & Staff info
  const [staffName, setStaffName] = useState('Trần Văn Quản Trị');
  const [notes, setNotes] = useState('');

  if (!isOpen || !booking) return null;

  const handleToggleChecklist = (
    category: 'exterior' | 'interior' | 'accessories',
    itemKey: string,
  ) => {
    setChecklist((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemKey]: !(prev[category] as any)[itemKey],
      },
    }));
  };

  const handleAddDamage = () => {
    setDamages((prev) => [
      ...prev,
      {
        position: 'Cản trước bên phụ',
        description: 'Vết xước nhẹ bề mặt khoảng 3cm, không móp méo',
        severity: 'LOW',
      },
    ]);
  };

  const handleRemoveDamage = (index: number) => {
    setDamages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDamage = (index: number, field: string, val: string) => {
    setDamages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingPhotos(true);
      const fileList = Array.from(files);
      const res = await uploadService.uploadMultiple(fileList);
      if (res.data && res.data.length > 0) {
        const newUrls = res.data.map((item) => item.url);
        setPhotos((prev) => [...prev, ...newUrls]);
        toast.success(`Đã tải lên ${newUrls.length} ảnh kiểm tra xe thành công!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi tải ảnh hiện trạng xe');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    setPhotos((prev) => [...prev, customPhotoUrl.trim()]);
    setCustomPhotoUrl('');
    toast.success('Đã thêm ảnh vào danh sách kiểm tra');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (odoMeter < 0) {
      toast.error('Số km ODO không hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        bookingId: booking.id || booking.bookingId,
        vehicleId: booking.carId || booking.vehicleId,
        type: 'CHECKOUT',
        odoMeter: Number(odoMeter),
        fuelLevel: fuelLevel.trim(),
        carCondition: carCondition.trim(),
        checklist,
        damages,
        photos,
        signatures: {
          staffSignature: staffName.trim(),
          customerSignature: booking.customerName,
        },
        staffName: staffName.trim(),
        notes: notes.trim(),
      };

      const res = await rentalService.createHandover(payload);
      toast.success(
        `Đã lập Biên bản bàn giao ${res.data?.handoverCode} thành công! Xe đã tự động chuyển sang trạng thái "Đang Cho Thuê".`,
      );
      if (res.data) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lập biên bản bàn giao xe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-4">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Kiểm Tra & Lập Biên Bản Bàn Giao Xe (Sprint 5)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đơn hàng: <strong className="font-mono text-slate-900">{booking.bookingCode}</strong> • Khách hàng: <strong className="text-slate-900">{booking.customerName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitHandover} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Banner tóm tắt xe & Hợp đồng tương ứng (US-14) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                <CarIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phương tiện bàn giao</p>
                <h4 className="text-sm font-black text-slate-900">
                  {booking.carName} • <span className="font-mono text-amber-700">{booking.licensePlate}</span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium">
                <span className="text-slate-400">Hợp đồng liên kết: </span>
                <strong className="text-indigo-700 font-mono">
                  {booking.contractNumber || `HD-${booking.bookingCode}`}
                </strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Đã đặt cọc
              </div>
            </div>
          </div>

          {/* Phần 1: US-13 - Kiểm tra thông số ODO & Mức nhiên liệu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">1</span>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Kiểm Tra Số Km (ODO) & Mức Nhiên Liệu Lúc Giao Xe
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-600" />
                  <span>Số Km Hiện Tại Trên Đồng Hồ (ODO) *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={odoMeter}
                    onChange={(e) => setOdoMeter(Number(e.target.value))}
                    min={0}
                    required
                    placeholder="VD: 12500"
                    className="w-full h-11 px-3.5 pr-14 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 pointer-events-none">
                    KM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ghi đúng số hiển thị trên mặt taplo xe để đối chiếu khi khách trả xe.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-emerald-600" />
                  <span>Mức Nhiên Liệu / Vạch Pin Lúc Giao *</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                    required
                    placeholder="VD: Pin 95% hoặc Xăng 8/8 vạch"
                    className="w-full h-11 px-3.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFuelLevel('100% (8/8)')}
                      className="px-2.5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
                      title="Đặt nhanh 100%"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setFuelLevel('95% (Pin)')}
                      className="px-2.5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
                      title="Đặt nhanh 95%"
                    >
                      95%
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Khách hàng cam kết hoàn trả xe với cùng mức nhiên liệu hoặc thanh toán phụ phí thiếu hụt.
                </p>
              </div>
            </div>
          </div>

          {/* Phần 2: US-13 - Danh mục kiểm tra (Checklist) Nội Ngoại Thất & Phụ kiện */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">2</span>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Kiểm Tra Tình Trạng Nội / Ngoại Thất & Giấy Tờ Bàn Giao
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Ngoại thất */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Ngoại Thất Xe
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.exterior.bodyClean}
                    onChange={() => handleToggleChecklist('exterior', 'bodyClean')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Thân vỏ xe đã rửa sạch sẽ</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.exterior.lightsOk}
                    onChange={() => handleToggleChecklist('exterior', 'lightsOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Hệ thống đèn pha/cốt/xi-nhan tốt</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.exterior.mirrorsOk}
                    onChange={() => handleToggleChecklist('exterior', 'mirrorsOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Gương chiếu hậu 2 bên nguyên vẹn</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.exterior.tiresOk}
                    onChange={() => handleToggleChecklist('exterior', 'tiresOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>4 lốp xe đủ áp suất, hoa lốp dày</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.exterior.windshieldOk}
                    onChange={() => handleToggleChecklist('exterior', 'windshieldOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Kính lái & kính hông không rạn nứt</span>
                </label>
              </div>

              {/* Nội thất */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Nội Thất & Tiện Nghi
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.interior.seatsClean}
                    onChange={() => handleToggleChecklist('interior', 'seatsClean')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Ghế ngồi da sạch sẽ, không rách</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.interior.steeringWheelOk}
                    onChange={() => handleToggleChecklist('interior', 'steeringWheelOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Vô lăng & còi xe hoạt động tốt</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.interior.acOk}
                    onChange={() => handleToggleChecklist('interior', 'acOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Điều hòa làm mát nhanh & sâu</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.interior.odorFree}
                    onChange={() => handleToggleChecklist('interior', 'odorFree')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Xe khử mùi thơm mát, không khói thuốc</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.interior.matsOk}
                    onChange={() => handleToggleChecklist('interior', 'matsOk')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Thảm trải sàn đầy đủ các hàng ghế</span>
                </label>
              </div>

              {/* Giấy tờ & Phụ kiện kèm theo */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Giấy Tờ & Phụ Kiện Kèm Xe
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.accessories.registrationDoc}
                    onChange={() => handleToggleChecklist('accessories', 'registrationDoc')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Bản sao công chứng Đăng ký xe</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.accessories.insuranceCert}
                    onChange={() => handleToggleChecklist('accessories', 'insuranceCert')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Giấy chứng nhận Bảo hiểm TNDS</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.accessories.spareTire}
                    onChange={() => handleToggleChecklist('accessories', 'spareTire')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Lốp dự phòng & bộ bơm điện</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.accessories.toolKit}
                    onChange={() => handleToggleChecklist('accessories', 'toolKit')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Kích nâng + tay vặn ốc cứu hộ</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.accessories.dashcam}
                    onChange={() => handleToggleChecklist('accessories', 'dashcam')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <span>Camera hành trình 4K + thẻ nhớ</span>
                </label>
              </div>
            </div>
          </div>

          {/* Phần 3: US-13 - Ghi nhận hư hỏng cũ & vết xước có sẵn */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">3</span>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Ghi Nhận Hư Hỏng Cũ & Vết Xước Có Sẵn (Bảo vệ khách & công ty)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddDamage}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm vết xước/hư hỏng cũ</span>
              </button>
            </div>

            {damages.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <p className="text-xs text-slate-500">
                  Chưa ghi nhận hư hỏng cũ nào. Nếu xe có vết xước hoặc móp méo từ trước, bấm nút <strong>"+ Thêm vết xước/hư hỏng cũ"</strong> để ghi nhận minh bạch vào biên bản.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {damages.map((dmg, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/40 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-full sm:w-44 shrink-0">
                      <input
                        type="text"
                        value={dmg.position}
                        onChange={(e) => handleUpdateDamage(idx, 'position', e.target.value)}
                        placeholder="Vị trí (VD: Cản trước lái)"
                        className="w-full h-9 px-2.5 font-bold bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={dmg.description}
                        onChange={(e) => handleUpdateDamage(idx, 'description', e.target.value)}
                        placeholder="Mô tả vết xước (VD: Trầy sơn 4cm, không móp vỏ...)"
                        className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="w-full sm:w-32 shrink-0">
                      <select
                        value={dmg.severity}
                        onChange={(e) => handleUpdateDamage(idx, 'severity', e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="LOW">Nhẹ (Trầy sơ)</option>
                        <option value="MEDIUM">Vừa (Xước sâu)</option>
                        <option value="HIGH">Nặng (Móp vỏ)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDamage(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần 4: US-13 - Ảnh chụp kiểm tra thực tế hiện trạng xe */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">4</span>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Ảnh Chụp Hiện Trạng Lúc Bàn Giao (4 góc xe, ODO, nội thất)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors cursor-pointer">
                  {uploadingPhotos ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingPhotos ? 'Đang tải...' : 'Tải ảnh từ máy'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingPhotos}
                  />
                </label>
              </div>
            </div>

            {/* Photo Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 shadow-2xs"
                >
                  <img
                    src={url}
                    alt={`Ảnh hiện trạng ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Ảnh {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick URL Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Hoặc dán URL hình ảnh hiện trạng xe..."
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCustomPhoto}
                disabled={!customPhotoUrl.trim()}
              >
                Thêm URL
              </Button>
            </div>
          </div>

          {/* Phần 5: Xác nhận bàn giao & Ký biên bản */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">5</span>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Xác Nhận Bàn Giao & Đại Diện Ký Biên Bản
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đại diện Bên Giao (Nhân viên phụ trách trạm) *
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                  placeholder="Họ tên nhân viên bàn giao"
                  className="w-full h-10 px-3 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đại diện Bên Nhận (Khách hàng thuê xe)
                </label>
                <input
                  type="text"
                  value={booking.customerName}
                  disabled
                  className="w-full h-10 px-3 text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú bổ sung (nếu có)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thời gian nhận xe thực tế, dặn dò khách hàng..."
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Sticky Submit Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              Bấm nút hoàn tất sẽ lưu <strong>Biên bản bàn giao</strong>, chuyển xe sang <strong>"Đang Cho Thuê"</strong> (US-15) và cập nhật số ODO.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Hoàn Tất & Giao Xe Thực Tế
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
