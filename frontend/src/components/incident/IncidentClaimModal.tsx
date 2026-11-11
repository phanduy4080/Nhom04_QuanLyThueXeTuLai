'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  Building2,
  DollarSign,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  Check,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  incidentService,
  IncidentItem,
  IncidentStatus,
  LiableParty,
} from '@/services/incident.service';

interface IncidentClaimModalProps {
  incident: IncidentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedIncident: IncidentItem) => void;
}

const STATUS_OPTIONS: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'REPORTED', label: 'Mới Báo Cáo', color: 'bg-amber-100 text-amber-800' },
  { value: 'UNDER_REVIEW', label: 'Đang Thẩm Tra', color: 'bg-blue-100 text-blue-800' },
  { value: 'INSURANCE_PROCESSING', label: 'Bảo Hiểm Đang Xử Lý', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'ASSESSMENT', label: 'Giám Định Thiệt Hại', color: 'bg-purple-100 text-purple-800' },
  { value: 'DISPUTED', label: 'Đang Khiếu Nại/Tranh Chấp', color: 'bg-rose-100 text-rose-800' },
  { value: 'RESOLVED', label: 'Đã Thỏa Thuận & Bồi Thường', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'CLOSED', label: 'Đã Đóng Hồ Sơ', color: 'bg-slate-200 text-slate-800' },
];

const LIABLE_PARTIES: { value: LiableParty; label: string }[] = [
  { value: 'CUSTOMER', label: 'Khách hàng (Người thuê chịu trách nhiệm)' },
  { value: 'INSURER', label: 'Bảo hiểm (Chi trả theo hợp đồng bảo hiểm)' },
  { value: 'COMPANY', label: 'Công ty (Bảo hành / Miễn thường / Hao mòn)' },
  { value: 'THIRD_PARTY', label: 'Bên thứ ba (Người gây tai nạn chịu trách nhiệm)' },
];

export const IncidentClaimModal: React.FC<IncidentClaimModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<IncidentStatus>('REPORTED');
  // Insurance
  const [insuranceClaimNumber, setInsuranceClaimNumber] = useState('');
  const [insurerName, setInsurerName] = useState('');
  const [insuranceAppraiser, setInsuranceAppraiser] = useState('');
  const [insuranceContact, setInsuranceContact] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState('NOT_SUBMITTED');
  const [insuranceNotes, setInsuranceNotes] = useState('');

  // Cost Allocation & Liability (US-19)
  const [totalDamageCost, setTotalDamageCost] = useState(0);
  const [insuranceCoverageAmount, setInsuranceCoverageAmount] = useState(0);
  const [companyShareAmount, setCompanyShareAmount] = useState(0);
  const [customerShareAmount, setCustomerShareAmount] = useState(0);
  const [deductedFromDeposit, setDeductedFromDeposit] = useState(0);
  const [customerPaymentStatus, setCustomerPaymentStatus] = useState('PENDING');
  const [liabilityParty, setLiabilityParty] = useState<LiableParty>('CUSTOMER');
  const [liabilityNotes, setLiabilityNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (incident && isOpen) {
      setStatus(incident.status || 'REPORTED');
      setInsuranceClaimNumber(incident.insuranceClaimNumber || '');
      setInsurerName(incident.insurerName || 'Bảo Việt / PVI Insurance');
      setInsuranceAppraiser(incident.insuranceAppraiser || '');
      setInsuranceContact(incident.insuranceContact || '');
      setInsuranceStatus(incident.insuranceStatus || 'NOT_SUBMITTED');
      setInsuranceNotes(incident.insuranceNotes || '');

      setTotalDamageCost(Number(incident.totalDamageCost || 0));
      setInsuranceCoverageAmount(Number(incident.insuranceCoverageAmount || 0));
      setCompanyShareAmount(Number(incident.companyShareAmount || 0));
      setCustomerShareAmount(Number(incident.customerShareAmount || 0));
      setDeductedFromDeposit(Number(incident.deductedFromDeposit || 0));
      setCustomerPaymentStatus(incident.customerPaymentStatus || 'PENDING');
      setLiabilityParty(incident.liabilityParty || 'CUSTOMER');
      setLiabilityNotes(incident.liabilityNotes || '');
      setResolutionNotes(incident.resolutionNotes || '');
      setSelectedPhoto(null);
    }
  }, [incident, isOpen]);

  if (!isOpen || !incident) return null;

  const allocatedTotal = insuranceCoverageAmount + companyShareAmount + customerShareAmount;
  const isAllocatedMatch = Math.abs(allocatedTotal - totalDamageCost) < 1;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await incidentService.updateClaimAndLiability(
        incident.incidentCode || incident.incidentId,
        {
          status,
          insuranceClaimNumber,
          insurerName,
          insuranceAppraiser,
          insuranceContact,
          insuranceStatus,
          insuranceNotes,
          totalDamageCost,
          insuranceCoverageAmount,
          companyShareAmount,
          customerShareAmount,
          deductedFromDeposit,
          customerPaymentStatus,
          liabilityParty,
          liabilityNotes,
          resolutionNotes,
        },
      );

      toast.success(res.message || 'Đã cập nhật hồ sơ sự cố & phân định trách nhiệm thành công!');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi khi cập nhật hồ sơ sự cố');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
             
              <span className="text-xs text-slate-300 font-mono">
                Mã: {incident.incidentCode}
              </span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Lập Hồ Sơ Sự Cố & Phân Định Chi Phí Bồi Thường
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Đơn thuê #{incident.bookingCode} • Xe: {incident.carName} ({incident.licensePlate}) • Khách hàng: {incident.customerName}
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
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Thông tin sự cố cơ bản */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Tiêu đề sự cố
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {incident.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800">
                  {incident.incidentType}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Xảy ra: {new Date(incident.occurredAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-bold">Mô tả sự việc:</strong> {incident.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {incident.location || 'Chưa rõ'}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                SĐT liên hệ: <strong>{incident.contactPhone || 'Chưa có'}</strong>
              </span>
            </div>

            {/* Gallery ảnh minh chứng */}
            {incident.evidencePhotos && incident.evidencePhotos.length > 0 && (
              <div className="pt-2 border-t border-slate-200/80">
                <p className="text-xs font-bold text-slate-700 mb-2">
                  Ảnh minh chứng hiện trường ({incident.evidencePhotos.length} ảnh):
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {incident.evidencePhotos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cập nhật Trạng thái hồ sơ */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Trạng thái tiến trình hồ sơ sự cố
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    status === opt.value
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* PHẦN 1: LÀM VIỆC VỚI BẢO HIỂM (US-19) */}
          <div className="p-5 border-2 border-indigo-100 bg-indigo-50/30 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>1. Thông Tin Giám Định & Khiếu Nại Bảo Hiểm (US-19)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã hồ sơ bảo hiểm</label>
                <input
                  type="text"
                  value={insuranceClaimNumber}
                  onChange={(e) => setInsuranceClaimNumber(e.target.value)}
                  placeholder="VD: CLAIM-PTI-2026-88"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đơn vị bảo hiểm</label>
                <input
                  type="text"
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  placeholder="VD: PVI / Bảo Việt / PTI..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng thái duyệt bồi thường</label>
                <select
                  value={insuranceStatus}
                  onChange={(e) => setInsuranceStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold"
                >
                  <option value="NOT_SUBMITTED">Chưa gửi hồ sơ bảo hiểm</option>
                  <option value="CLAIMED">Đã tiếp nhận hồ sơ khiếu nại</option>
                  <option value="APPRAISED">Đã giám định hiện trường</option>
                  <option value="APPROVED">Bảo hiểm duyệt bồi thường</option>
                  <option value="REJECTED">Bảo hiểm từ chối bồi thường</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giám định viên bảo hiểm</label>
                <input
                  type="text"
                  value={insuranceAppraiser}
                  onChange={(e) => setInsuranceAppraiser(e.target.value)}
                  placeholder="Họ tên giám định viên"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SĐT liên hệ giám định</label>
                <input
                  type="text"
                  value={insuranceContact}
                  onChange={(e) => setInsuranceContact(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label className="font-bold text-slate-700 block mb-1">Ghi chú bảo hiểm</label>
                <input
                  type="text"
                  value={insuranceNotes}
                  onChange={(e) => setInsuranceNotes(e.target.value)}
                  placeholder="Biên bản công an, giấy chứng nhận..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* PHẦN 2: PHÂN ĐỊNH TRÁCH NHIỆM & CHI PHÍ BỒI THƯỜNG (US-19) */}
          <div className="p-5 border-2 border-emerald-100 bg-emerald-50/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>2. Phân Định Trách Nhiệm Chi Phí (Bảo hiểm, Công ty, Khách hàng)</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${isAllocatedMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {isAllocatedMatch ? '✓ Khớp 100% tổng chi phí' : `Chênh lệch: ${formatCurrency(allocatedTotal - totalDamageCost)}`}
              </span>
            </div>

            {/* Bên chịu trách nhiệm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Bên chịu trách nhiệm chính (US-19)
                </label>
                <select
                  value={liabilityParty}
                  onChange={(e) => setLiabilityParty(e.target.value as LiableParty)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold"
                >
                  {LIABLE_PARTIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Tổng chi phí khắc phục / sửa chữa (Garage báo giá)
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={totalDamageCost}
                  onChange={(e) => setTotalDamageCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg font-black text-slate-900 text-sm"
                />
              </div>
            </div>

            {/* 3 Cột phân định chi phí */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white border border-slate-200 rounded-xl text-xs">
              <div>
                <label className="font-bold text-indigo-900 block mb-1">
                  1. Bảo hiểm chi trả:
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={insuranceCoverageAmount}
                  onChange={(e) => setInsuranceCoverageAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-lg font-bold text-indigo-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {formatCurrency(insuranceCoverageAmount)}
                </span>
              </div>

              <div>
                <label className="font-bold text-teal-900 block mb-1">
                  2. Công ty chịu:
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={companyShareAmount}
                  onChange={(e) => setCompanyShareAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-lg font-bold text-teal-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {formatCurrency(companyShareAmount)}
                </span>
              </div>

              <div>
                <label className="font-bold text-rose-900 block mb-1">
                  3. Khách hàng bồi thường:
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={customerShareAmount}
                  onChange={(e) => setCustomerShareAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-lg font-bold text-rose-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {formatCurrency(customerShareAmount)}
                </span>
              </div>
            </div>

            {/* Khấu trừ tiền cọc & Thanh toán của khách */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Số tiền khấu trừ trực tiếp vào tiền cọc ({formatCurrency(deductedFromDeposit)})
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={deductedFromDeposit}
                  onChange={(e) => setDeductedFromDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Trạng thái thanh toán của khách hàng
                </label>
                <select
                  value={customerPaymentStatus}
                  onChange={(e) => setCustomerPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold"
                >
                  <option value="PENDING">Chờ khách hàng thanh toán bổ sung</option>
                  <option value="DEDUCTED_FROM_DEPOSIT">Đã cấn trừ đủ vào tiền cọc</option>
                  <option value="PAID">Khách đã chuyển khoản thanh toán xong</option>
                  <option value="WAIVED">Công ty miễn thu bồi thường</option>
                </select>
              </div>
            </div>

            {/* Biên bản & Thỏa thuận */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Biên bản phân định trách nhiệm
                </label>
                <textarea
                  rows={2}
                  value={liabilityNotes}
                  onChange={(e) => setLiabilityNotes(e.target.value)}
                  placeholder="Ghi nhận lỗi từ phía người lái, biên bản giải quyết hiện trường..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Kết luận & thỏa thuận bồi hoàn
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Hai bên đã thống nhất mức bồi hoàn, hoàn tất thủ tục bàn giao..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              leftIcon={<Save className="w-4 h-4 text-white" />}
            >
              {saving ? 'Đang lưu hồ sơ...' : 'Lưu Hồ Sơ & Phân Định Chi Phí (US-19)'}
            </Button>
          </div>
        </form>
      </div>

      {/* Lightbox Xem Ảnh Lớn */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={selectedPhoto}
            alt="Ảnh lớn"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

