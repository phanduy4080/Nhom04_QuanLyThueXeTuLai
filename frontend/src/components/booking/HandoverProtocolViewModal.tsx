'use client';

import React from 'react';
import {
  X,
  Printer,
  FileCheck,
  ShieldCheck,
  Car as CarIcon,
  User,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HandoverRecordItem } from '@/services/rental.service';

interface HandoverProtocolViewModalProps {
  handover: HandoverRecordItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HandoverProtocolViewModal({
  handover,
  isOpen,
  onClose,
}: HandoverProtocolViewModalProps) {
  if (!isOpen || !handover) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto print:max-h-none print:shadow-none print:border-none print:m-0 print:w-full">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Biên Bản Bàn Giao Xe Điện Tử (US-14)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Số: {handover.handoverCode} • Liên kết HĐ: {handover.contractNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              In Biên Bản
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-sans text-slate-800 print:overflow-visible print:p-0">
          {/* Header Quốc hiệu Tiêu ngữ */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h4>
            <p className="text-xs sm:text-sm font-medium italic text-slate-600">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="w-24 h-0.5 bg-slate-400 mx-auto my-1"></div>
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-slate-900 pt-3">
              BIÊN BẢN BÀN GIAO PHƯƠNG TIỆN CHO THUÊ TỰ LÁI
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Mã biên bản: <strong>{handover.handoverCode}</strong> • Ngày lập: {new Date(handover.signedAt || handover.createdAt).toLocaleString('vi-VN')}
            </p>
            <p className="text-xs text-slate-600 italic">
              (Kèm theo và là bộ phận không tách rời của Hợp đồng số:{' '}
              <strong className="font-mono text-slate-900">{handover.contractNumber}</strong>)
            </p>
          </div>

          {/* Nội dung biên bản */}
          <div className="py-6 space-y-6 text-xs sm:text-sm leading-relaxed">
            {/* Thông tin 2 bên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              {/* Bên giao */}
              <div className="space-y-1.5">
                <span className="font-black uppercase text-amber-800 text-xs block pb-1 border-b border-amber-200">
                  BÊN GIAO XE (ĐẠI DIỆN CÔNG TY)
                </span>
                <p>
                  <strong>Đơn vị:</strong> Công Ty Cổ Phần Cho Thuê Xe QuickHatch
                </p>
                <p>
                  <strong>Chi nhánh:</strong> {handover.pickupBranch}
                </p>
                <p>
                  <strong>Nhân viên bàn giao:</strong> {handover.staffName || 'Trần Văn Quản Trị'}
                </p>
              </div>

              {/* Bên nhận */}
              <div className="space-y-1.5">
                <span className="font-black uppercase text-indigo-800 text-xs block pb-1 border-b border-indigo-200">
                  BÊN NHẬN XE (KHÁCH THUÊ XE)
                </span>
                <p>
                  <strong>Khách hàng:</strong> {handover.customerName}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {handover.customerPhone || '---'}
                </p>
                <p>
                  <strong>CCCD / CMND:</strong> {handover.customerIdNumber || '---'}
                </p>
                <p>
                  <strong>Số GPLX:</strong> {handover.customerLicenseNumber || '---'}
                </p>
                {handover.hasAdditionalDriver && (
                  <p className="text-indigo-700 font-bold pt-1">
                    * Người lái phụ: {handover.additionalDriverName} ({handover.additionalDriverPhone}) - GPLX: {handover.additionalDriverLicenseNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Thông số phương tiện bàn giao */}
            <div className="space-y-2">
              <h5 className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                I. THÔNG TIN PHƯƠNG TIỆN BÀN GIAO THỰC TẾ
              </h5>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-500 w-1/4">Tên dòng xe / Model</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 w-1/4">{handover.carName}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-500 w-1/4">Biển số đăng ký</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 w-1/4">{handover.licensePlate}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Màu sắc / Số chỗ</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{handover.color} • {handover.seats} chỗ ngồi</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Mã đơn đặt xe</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{handover.bookingCode}</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2.5 px-3 font-bold text-amber-900">Số Km ODO lúc giao</td>
                      <td className="py-2.5 px-3 font-mono font-black text-amber-800 text-sm">
                        {handover.odoMeter.toLocaleString()} KM
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-900">Mức nhiên liệu / Pin</td>
                      <td className="py-2.5 px-3 font-black text-emerald-700 text-sm">
                        {handover.fuelLevel}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checklist kiểm tra */}
            <div className="space-y-2">
              <h5 className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                II. BIÊN BẢN KIỂM TRA HIỆN TRẠNG & TRANG THIẾT BỊ BÀN GIAO
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block pb-1 border-b border-slate-100">1. Ngoại thất xe</span>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Thân vỏ sạch sẽ, rửa bóng
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Đèn chiếu sáng, xi-nhan tốt
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Gương chiếu hậu lành lặn
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    4 lốp đủ áp suất, hoa lốp dày
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block pb-1 border-b border-slate-100">2. Nội thất xe</span>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Ghế da sạch đẹp, không rách
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Điều hòa mát lạnh sâu
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Vô lăng & còi hoạt động chuẩn
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Khử mùi thơm mát, thảm sàn đủ
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block pb-1 border-b border-slate-100">3. Giấy tờ & Cứu hộ</span>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Bản sao Đăng ký xe công chứng
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Bảo hiểm TNDS còn hạn
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Lốp phụ + Bộ kích cứu hộ
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Camera hành trình 4K
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi nhận hư hỏng cũ */}
            <div className="space-y-2">
              <h5 className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                III. GHI NHẬN HƯ HỎNG / VẾT TRẦY XƯỚC CÓ SẴN TRƯỚC KHI GIAO
              </h5>
              {handover.damages && handover.damages.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2 w-12 text-center">STT</th>
                        <th className="p-2 w-44">Vị trí hư hỏng</th>
                        <th className="p-2">Mô tả hiện trạng vết xước</th>
                        <th className="p-2 w-28 text-center">Mức độ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {handover.damages.map((dmg, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-center font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900">{dmg.position}</td>
                          <td className="p-2 text-slate-700">{dmg.description}</td>
                          <td className="p-2 text-center font-semibold text-amber-700">
                            {dmg.severity === 'HIGH' ? 'Nặng' : dmg.severity === 'MEDIUM' ? 'Vừa' : 'Nhẹ'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-medium">
                  ✓ Không ghi nhận hư hỏng hoặc vết trầy xước cũ nào. Thân vỏ và sơn xe nguyên vẹn 100%.
                </p>
              )}
            </div>

            {/* Thư viện ảnh chụp kiểm tra thực tế */}
            {handover.photos && handover.photos.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                  IV. HÌNH ẢNH HIỆN TRẠNG XE ĐÍNH KÈM
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {handover.photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 shadow-2xs"
                    >
                      <img
                        src={url}
                        alt={`Ảnh hiện trạng ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cam kết & Chữ ký */}
            <div className="pt-6 border-t border-slate-200 space-y-6">
              <p className="text-xs text-slate-600 italic leading-relaxed text-justify">
                Hai bên đã cùng nhau kiểm tra, thống nhất đúng với các thông tin đã ghi nhận trong biên bản này. Bên Nhận đã nhận đủ xe và toàn bộ giấy tờ, phụ kiện liên quan và cam kết bảo quản, hoàn trả phương tiện đúng thỏa thuận theo Hợp đồng thuê xe.
              </p>

              <div className="grid grid-cols-2 text-center pt-2">
                <div>
                  <p className="font-bold text-xs uppercase text-slate-900">ĐẠI DIỆN BÊN GIAO XE</p>
                  <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="font-serif italic font-bold text-slate-800 text-lg">
                      {handover.staffName || 'Trần Văn Quản Trị'}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900">{handover.staffName || 'Trần Văn Quản Trị'}</p>
                </div>

                <div>
                  <p className="font-bold text-xs uppercase text-slate-900">ĐẠI DIỆN BÊN NHẬN XE</p>
                  <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="font-serif italic font-bold text-indigo-900 text-lg">
                      {handover.customerName}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900">{handover.customerName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden on print) */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 print:hidden">
          <p className="text-xs text-slate-400">
            Biên bản được số hóa và ký điện tử theo quy định của pháp luật.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              In Biên Bản Bàn Giao
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
