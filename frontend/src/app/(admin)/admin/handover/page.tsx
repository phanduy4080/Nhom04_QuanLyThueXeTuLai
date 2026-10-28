'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  CheckCircle2,
  Camera,
  FileCheck,
  Gauge,
  Fuel,
  AlertTriangle,
  Plus,
  Search,
  RefreshCw,
  Printer,
  Eye,
  Car as CarIcon,
  ShieldCheck,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { rentalService, HandoverRecordItem } from '@/services/rental.service';
import { bookingService, BookingResponse } from '@/services/booking.service';
import { HandoverProtocolViewModal } from '@/components/booking/HandoverProtocolViewModal';
import { HandoverInspectionModal } from '@/components/booking/HandoverInspectionModal';

export default function AdminHandoverPage() {
  const [activeTab, setActiveTab] = useState<'CHECKOUT' | 'CHECKIN'>('CHECKOUT');
  const [handoverRecords, setHandoverRecords] = useState<HandoverRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedHandover, setSelectedHandover] = useState<HandoverRecordItem | null>(null);
  const [showSelectBookingModal, setShowSelectBookingModal] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<BookingResponse[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [inspectBooking, setInspectBooking] = useState<BookingResponse | null>(null);

  const fetchHandovers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await rentalService.getHandovers({
        type: activeTab,
        search: searchTerm || undefined,
      });
      if (res.data) {
        setHandoverRecords(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách biên bản bàn giao');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchHandovers();
  }, [fetchHandovers]);

  // Lấy các đơn sẵn sàng bàn giao (CONFIRMED)
  const handleOpenNewHandover = async () => {
    try {
      setLoadingBookings(true);
      setShowSelectBookingModal(true);
      const res = await bookingService.getBookings({ status: 'CONFIRMED' });
      if (res.data) {
        setConfirmedBookings(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách đơn chờ bàn giao');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSelectBookingForHandover = (booking: BookingResponse) => {
    setShowSelectBookingModal(false);
    setInspectBooking(booking);
  };

  const handleHandoverSuccess = (newRecord: HandoverRecordItem) => {
    fetchHandovers();
    setSelectedHandover(newRecord);
  };

  const filteredRecords = handoverRecords.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.handoverCode?.toLowerCase().includes(term) ||
      r.bookingCode?.toLowerCase().includes(term) ||
      r.customerName?.toLowerCase().includes(term) ||
      r.carName?.toLowerCase().includes(term) ||
      r.licensePlate?.toLowerCase().includes(term) ||
      r.contractNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </span>
            <span>Biên Bản Bàn Giao & Nhận Xe (Sprint 5)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm tra số ODO, mức nhiên liệu/pin, checklist hiện trạng, ghi nhận hư hỏng cũ và tự động chuyển xe sang &apos;Đang cho thuê&apos; (US-13, US-14, US-15).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHandovers}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Làm Mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNewHandover}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
          >
            + Lập Biên Bản Bàn Giao
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('CHECKOUT')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CHECKOUT'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Giao Xe Cho Khách (Check-out)</span>
        </button>

        <button
          onClick={() => setActiveTab('CHECKIN')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CHECKIN'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Nhận Xe Trả Lại (Check-in)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã biên bản, mã hợp đồng, mã đơn, khách hàng, biển số xe..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Mã Biên Bản & Hợp Đồng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Đơn Đặt & Khách Hàng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Phương Tiện</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Số Km (ODO)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Nhiên Liệu / Pin</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Hiện Trạng & Hư Hỏng Cũ</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {loading && filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Đang tải danh sách biên bản bàn giao...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Chưa có biên bản bàn giao nào. Bấm <strong>&quot;+ Lập Biên Bản Bàn Giao&quot;</strong> để tạo biên bản giao xe cho khách.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block text-sm">
                        {r.handoverCode}
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 font-semibold block mt-0.5">
                        {r.contractNumber || `HD-${r.bookingCode}`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <strong className="text-slate-900 block text-xs">{r.customerName}</strong>
                      <span className="text-slate-400 font-mono text-[11px] block">{r.bookingCode}</span>
                      <span className="text-[11px] text-slate-400">{r.customerPhone}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{r.carName}</p>
                      <span className="font-mono text-amber-700 font-bold text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {r.licensePlate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.odoMeter?.toLocaleString()} KM
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                        {r.fuelLevel}
                      </span>
                    </td>

                    {/* Hiện trạng & Hư hỏng cũ (US-13) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {r.damages && r.damages.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {r.damages.length} vết xước cũ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Nguyên vẹn 100%
                          </span>
                        )}
                        {r.photos && r.photos.length > 0 && (
                          <span className="text-[11px] text-slate-400 block">
                            📸 {r.photos.length} ảnh hiện trạng
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Đã Bàn Giao</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedHandover(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                          title="Xem & In Biên Bản Bàn Giao (US-14)"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-700" />
                          <span>In Biên Bản</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Chọn đơn đặt xe để bàn giao */}
      {showSelectBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Chọn Đơn Đặt Xe Sẵn Sàng Bàn Giao
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chỉ hiển thị các đơn đã duyệt và khách đã hoàn tất thanh toán cọc (CONFIRMED)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSelectBookingModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {loadingBookings ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Đang tải danh sách đơn đã cọc...
                </div>
              ) : confirmedBookings.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700">Không có đơn đặt xe nào đang chờ bàn giao</p>
                  <p className="text-xs text-slate-400">
                    Đơn hàng cần được duyệt (US-10) và khách thanh toán tiền cọc thành công (US-11) trước khi tiến hành bàn giao xe.
                  </p>
                </div>
              ) : (
                confirmedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-center justify-between gap-4 cursor-pointer"
                    onClick={() => handleSelectBookingForHandover(b)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {b.bookingCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đã cọc
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 mt-1">{b.customerName} ({b.phone})</p>
                      <p className="text-xs text-slate-500 font-medium">
                        Xe: <strong className="text-slate-800">{b.carName}</strong> • Biển số: <strong className="font-mono text-amber-700">{b.licensePlate}</strong>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                      leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                    >
                      Bàn Giao Xe
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kiểm tra kỹ thuật & Lập biên bản bàn giao (US-13, US-14, US-15) */}
      <HandoverInspectionModal
        booking={inspectBooking}
        isOpen={Boolean(inspectBooking)}
        onClose={() => setInspectBooking(null)}
        onSuccess={handleHandoverSuccess}
      />

      {/* Modal: Xem & In Biên Bản Bàn Giao Chuẩn Pháp Lý (US-14) */}
      <HandoverProtocolViewModal
        handover={selectedHandover}
        isOpen={Boolean(selectedHandover)}
        onClose={() => setSelectedHandover(null)}
      />
    </div>
  );
}
