'use client';

import React from 'react';
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  Car,
  Calendar,
  CreditCard,
  AlertTriangle,
  QrCode,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface RentalContractModalProps {
  contract: any;
  isOpen: boolean;
  onClose: () => void;
}

export const RentalContractModal: React.FC<RentalContractModalProps> = ({
  contract,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !contract) return null;

  const c = contract.contract || contract;
  const partyA = c.partyA || {};
  const partyB = c.partyB || {};
  const additional = c.additionalDriver;
  const vehicle = c.vehicle || {};
  const schedule = c.schedule || {};
  const financials = c.financials || {};
  const operating = c.operatingRules || {};
  const liability = c.insuranceAndLiability || {};
  const signatures = c.signatures || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Hợp Đồng Thuê Xe Ô Tô Tự Lái Điện Tử (US-12)
              </h2>
              <span className="text-xs text-amber-300 font-mono">
                Số HĐ: {c.contractNumber || 'HD-QUICKHATCH-2026'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4 text-amber-400" />}
              className="text-white border-slate-700 hover:bg-slate-800"
            >
              In Hợp Đồng
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Content (Printable) */}
        <div id="printable-contract" className="p-6 sm:p-10 space-y-8 overflow-y-auto text-slate-800 text-xs sm:text-sm font-sans leading-relaxed">
          {/* Quốc hiệu & Tiêu ngữ */}
          <div className="text-center space-y-1.5 border-b border-slate-200 pb-6">
            <h3 className="font-extrabold text-sm sm:text-base tracking-widest text-slate-900 uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h3>
            <p className="font-semibold text-xs text-slate-700 underline decoration-slate-400 underline-offset-4">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="pt-4">
              <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                {c.title || 'HỢP ĐỒNG CHO THUÊ XE Ô TÔ TỰ LÁI'}
              </h1>
              <p className="text-xs text-slate-500 italic mt-0.5">
                {c.subtitle || 'Căn cứ Bộ Luật Dân Sự số 91/2015/QH13 và Luật Giao Thông Đường Bộ số 23/2008/QH12'}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-mono text-amber-900 font-bold">
                <span>Số HĐ: {c.contractNumber}</span>
                <span>•</span>
                <span>Mã Đơn: {c.bookingCode}</span>
                <span>•</span>
                <span>Ngày lập: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : ''}</span>
              </div>
            </div>
          </div>

          {/* ĐIỀU 1: CÁC BÊN THAM GIA */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black uppercase text-indigo-900 tracking-wide bg-indigo-50/70 p-2.5 rounded-lg border-l-4 border-indigo-600">
              ĐIỀU 1: CÁC BÊN THAM GIA KÝ KẾT HỢP ĐỒNG
            </h4>

            {/* Bên A */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-xs uppercase">
                <Building className="w-4 h-4 text-indigo-600" />
                {partyA.title || 'BÊN CHO THUÊ (BÊN A)'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Đơn vị: </span>
                  <strong className="text-slate-900">{partyA.companyName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã số thuế: </span>
                  <strong className="text-slate-900 font-mono">{partyA.taxCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Trụ sở: </span>
                  <span className="text-slate-800">{partyA.address}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hotline: </span>
                  <strong className="text-slate-900 font-mono">{partyA.hotline}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Đại diện: </span>
                  <strong className="text-slate-900">{partyA.representative}</strong> ({partyA.position})
                </div>
                <div>
                  <span className="text-slate-500">Trạm giao xe: </span>
                  <span className="text-slate-800">{partyA.pickupBranch?.name} - {partyA.pickupBranch?.address}</span>
                </div>
              </div>
            </div>

            {/* Bên B */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-xs uppercase">
                <User className="w-4 h-4 text-amber-600" />
                {partyB.title || 'BÊN THUÊ XE (BÊN B - KHÁCH HÀNG)'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Họ và tên: </span>
                  <strong className="text-slate-900">{partyB.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại: </span>
                  <strong className="text-slate-900 font-mono">{partyB.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Email: </span>
                  <span className="text-slate-800 font-mono">{partyB.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">Số CCCD / Hộ chiếu: </span>
                  <strong className="text-slate-900 font-mono">{partyB.idNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày sinh: </span>
                  <span className="text-slate-800">{partyB.dob}</span>
                </div>
                <div>
                  <span className="text-slate-500">GPLX số: </span>
                  <strong className="text-slate-900 font-mono">{partyB.licenseNumber}</strong> (Hạng: {partyB.licenseClass})
                </div>
              </div>
            </div>

            {/* Người lái phụ nếu có */}
            {additional && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-1.5">
                <span className="font-bold text-indigo-950 block">
                  {additional.title || 'NGƯỜI LÁI XE BỔ SUNG ĐÃ ĐĂNG KÝ HỢP PHÁP'}:
                </span>
                <p className="text-slate-700">
                  Họ tên: <strong>{additional.fullName}</strong> • SĐT: <strong>{additional.phone}</strong> • CCCD: <strong>{additional.idNumber}</strong> • GPLX: <strong>{additional.licenseNumber} ({additional.licenseClass})</strong>
                </p>
              </div>
            )}
          </div>

          {/* ĐIỀU 2: PHƯƠNG TIỆN CHO THUÊ */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black uppercase text-indigo-900 tracking-wide bg-indigo-50/70 p-2.5 rounded-lg border-l-4 border-indigo-600">
              ĐIỀU 2: ĐỐI TƯỢNG HỢP ĐỒNG & THÔNG TIN PHƯƠNG TIỆN
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-xs">
              <div>
                <span className="text-slate-500 block">Dòng xe:</span>
                <strong className="text-slate-900">{vehicle.fullCarName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Biển số đăng ký:</span>
                <strong className="text-amber-900 font-mono text-sm bg-amber-100/80 px-2 py-0.5 rounded font-black inline-block">
                  {vehicle.licensePlate}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Số chỗ & Màu sắc:</span>
                <span className="text-slate-800 font-semibold">{vehicle.seats} chỗ • {vehicle.color}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nhiên liệu / Hộp số:</span>
                <span className="text-slate-800 font-semibold">{vehicle.fuelType} • {vehicle.transmission}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic pl-1">
              * Tình trạng bàn giao: {vehicle.standardHandoverCondition || 'Xe sạch sẽ, 100% nhiên liệu/pin, trang bị tiêu chuẩn và camera hành trình.'}
            </p>
          </div>

          {/* ĐIỀU 3: LỊCH TRÌNH VÀ BÀN GIAO */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black uppercase text-indigo-900 tracking-wide bg-indigo-50/70 p-2.5 rounded-lg border-l-4 border-indigo-600">
              ĐIỀU 3: LỊCH TRÌNH THUÊ VÀ BÀN GIAO XE
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/40 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold block">1. Nhận xe (Bắt đầu):</span>
                <p className="text-slate-900 font-semibold">
                  Thời gian: {schedule.startDate ? new Date(schedule.startDate).toLocaleString('vi-VN') : ''}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Địa điểm: {schedule.pickupBranchName} ({schedule.pickupAddress})
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-bold block">2. Trả xe (Kết thúc):</span>
                <p className="text-slate-900 font-semibold">
                  Thời gian: {schedule.endDate ? new Date(schedule.endDate).toLocaleString('vi-VN') : ''}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Địa điểm: {schedule.returnBranchName} ({schedule.returnAddress})
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-700 pl-1 font-medium">
              Tổng thời hạn thuê: <strong>{schedule.totalDays} ngày</strong>.
            </p>
          </div>

          {/* ĐIỀU 4: CHI PHÍ THUÊ & TIỀN CỌC */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-black uppercase text-indigo-900 tracking-wide bg-indigo-50/70 p-2.5 rounded-lg border-l-4 border-indigo-600">
              ĐIỀU 4: BẢNG KÊ CHI PHÍ THUÊ & TIỀN ĐẶT CỌC GIỮ XE
            </h4>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-slate-700">Đơn giá thuê theo ngày:</span>
                <strong className="text-slate-900">{formatCurrency(financials.dailyPrice || 0)} / ngày</strong>
              </div>
              <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-slate-700">Tiền thuê xe ({schedule.totalDays} ngày):</span>
                <strong className="text-slate-900">{formatCurrency(financials.rentalFee || 0)}</strong>
              </div>
              {financials.additionalDriverFee > 0 && (
                <div className="flex justify-between border-b border-amber-200/60 pb-1.5 text-indigo-800">
                  <span>Phí người lái xe bổ sung:</span>
                  <strong>{formatCurrency(financials.additionalDriverFee)}</strong>
                </div>
              )}
              <div className="flex justify-between border-b border-amber-200/60 pb-1.5">
                <span className="text-slate-700">Tiền cọc thế chấp xe:</span>
                <div className="text-right">
                  <strong className="text-amber-900 font-bold block">{formatCurrency(financials.depositAmount || 0)}</strong>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    [{financials.depositStatusText || 'ĐÃ THANH TOÁN TIỀN CỌC GIỮ XE'}]
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-950">
                <span>TỔNG TIỀN THUÊ XE:</span>
                <span className="text-amber-600 text-base">{formatCurrency(financials.totalAmount || 0)}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic pl-1">
              * Tiền cọc sẽ được hoàn lại 100% cho Bên B khi hoàn tất trả xe đúng hẹn, xe nguyên vẹn và đối soát không vi phạm giao thông.
            </p>
          </div>

          {/* ĐIỀU 5 & 6: VẬN HÀNH & BẢO HIỂM BỒI THƯỜNG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
              <h5 className="font-black text-slate-900 uppercase flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-600" />
                ĐIỀU 5: ĐIỀU KHOẢN VẬN HÀNH & GIỚI HẠN KM
              </h5>
              <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc pl-4 leading-normal">
                <li>{operating.kmRuleText || 'Giới hạn định mức: 350 km/ngày. Phí vượt trội: 5.000 VNĐ / km.'}</li>
                <li>{operating.fuelRuleText || 'Nhiên liệu khi trả tương đương lúc nhận. Bù chênh lệch theo giá thị trường + 10% phí phục vụ.'}</li>
                <li>{operating.cleanlinessRuleText || 'Nghiêm cấm hút thuốc và chở gia súc, chất cấm trên xe. Phạt 500.000 VNĐ khử mùi vệ sinh.'}</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
              <h5 className="font-black text-slate-900 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ĐIỀU 6: BẢO HIỂM & BỒI THƯỜNG & PHẠT NGUỘI
              </h5>
              <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc pl-4 leading-normal">
                <li>{liability.insuranceCoverageText || 'Áp dụng bảo hiểm TNDS & vật chất xe (miễn thường 2.000.000 VNĐ/vụ).'}</li>
                <li>{liability.accidentLiabilityText || 'Khi có sự cố giữ nguyên hiện trường và báo hotline 1900 8888 kịp thời.'}</li>
                <li>{liability.trafficFineLiabilityText || 'Bên B chịu 100% trách nhiệm và chi phí đối với các biên bản phạt nguội camera giao thông.'}</li>
              </ul>
            </div>
          </div>

          {/* CHỮ KÝ ĐIỆN TỬ */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h4 className="text-xs font-black uppercase text-center text-slate-700 tracking-wider">
              XÁC THỰC KÝ KẾT HỢP ĐỒNG ĐIỆN TỬ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center text-xs">
              {/* Chữ ký Bên A */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-2">
                <span className="font-bold text-slate-700 block uppercase">
                  ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)
                </span>
                <span className="text-[11px] text-slate-400 block italic">(Ký điện tử & Đóng dấu mộc số)</span>
                <div className="py-4">
                  <div className="inline-flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/80 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="font-black text-xs">ĐÃ KÝ SỐ ĐIỆN TỬ</span>
                    <span className="text-[10px] font-mono text-emerald-700">CERT: QUICKHATCH-CA-VN</span>
                    <span className="text-[10px] text-slate-500">
                      {signatures.partyA?.signedAt ? new Date(signatures.partyA.signedAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                </div>
                <strong className="text-slate-900 block font-bold">{partyA.representative}</strong>
              </div>

              {/* Chữ ký Bên B */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                <span className="font-bold text-slate-700 block uppercase">
                  ĐẠI DIỆN BÊN THUÊ XE (BÊN B)
                </span>
                <span className="text-[11px] text-slate-400 block italic">(Xác thực điện tử qua giao dịch cọc)</span>
                <div className="py-4">
                  <div className="inline-flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50/80 text-amber-900">
                    <ShieldCheck className="w-6 h-6 text-amber-600 mb-1" />
                    <span className="font-black text-xs">XÁC THỰC CỌC HỢP LỆ</span>
                    <span className="text-[10px] font-mono text-amber-800">MÃ: {signatures.partyB?.verificationCode || c.bookingCode}</span>
                    <span className="text-[10px] text-slate-500">
                      {signatures.partyB?.signedAt ? new Date(signatures.partyB.signedAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                </div>
                <strong className="text-slate-900 block font-bold">{partyB.fullName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hợp đồng điện tử tuân thủ Luật Giao Dịch Điện Tử & Bộ Luật Dân Sự Việt Nam.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              In Hợp Đồng
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

