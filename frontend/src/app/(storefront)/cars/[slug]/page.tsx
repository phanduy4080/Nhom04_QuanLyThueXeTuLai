'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Car as CarIcon,
  Shield,
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Users,
  Fuel,
  Info,
  ChevronLeft,
  ChevronRight,
  Camera,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { carService } from '@/services/car.service';
import { pricingService, PriceCalculationResult } from '@/services/pricing.service';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const carId = resolvedParams.slug;

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Rental form
  const [startDate, setStartDate] = useState('2026-10-15T08:00');
  const [endDate, setEndDate] = useState('2026-10-18T20:00');
  const [insurancePackages, setInsurancePackages] = useState<any[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number>(1);
  const [extras, setExtras] = useState<any[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);

  // Quote Result (US-06)
  const [quote, setQuote] = useState<PriceCalculationResult | null>(null);

  useEffect(() => {
    const fetchCarAndPolicy = async () => {
      try {
        setLoading(true);
        const [carRes, insRes, extrasRes] = await Promise.all([
          carService.getCarById(carId),
          pricingService.getInsurancePackages(),
          pricingService.getExtras(),
        ]);

        if (carRes.data) setCar(carRes.data);
        if (insRes.data) {
          setInsurancePackages(insRes.data);
          const defaultPkg = insRes.data.find((p: any) => p.isDefault) || insRes.data[0];
          if (defaultPkg) setSelectedInsuranceId(defaultPkg.packageId);
        }
        if (extrasRes.data) setExtras(extrasRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải thông tin xe');
      } finally {
        setLoading(false);
      }
    };

    fetchCarAndPolicy();
  }, [carId]);

  // Recalculate price whenever dates or selections change (US-06)
  useEffect(() => {
    const calculateQuote = async () => {
      if (!carId || !startDate || !endDate) return;

      try {
        setCalcLoading(true);
        const res = await pricingService.calculatePrice({
          vehicleId: carId,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          insurancePackageId: selectedInsuranceId,
          extraIds: selectedExtraIds,
        });

        if (res.data) setQuote(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCalcLoading(false);
      }
    };

    calculateQuote();
  }, [carId, startDate, endDate, selectedInsuranceId, selectedExtraIds]);

  const toggleExtra = (id: number) => {
    if (selectedExtraIds.includes(id)) {
      setSelectedExtraIds(selectedExtraIds.filter((item) => item !== id));
    } else {
      setSelectedExtraIds([...selectedExtraIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Đang tải thông tin xe và chính sách...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy thông tin xe</h2>
        <Link href="/cars">
          <Button variant="primary">Quay lại danh sách xe</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay Lại Danh Sách Xe</span>
        </Link>

        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Car Photos, Specs, Transparent Policy (US-06) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Hero Image */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                  {car.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {car.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Biển số: {car.licensePlate} • Chi nhánh: {car.branch?.name || 'TP. Hồ Chí Minh'}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Đơn giá niêm yết</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(car.pricePerDay)}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ngày</span>
              </div>
            </div>

            {/* Interactive Multi-Photo Gallery */}
            <div className="space-y-3">
              {/* Main Photo Viewer */}
              <div className="relative h-80 sm:h-[420px] rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-200/80 group">
                {car.images && car.images.length > 0 && car.images[selectedImageIndex]?.startsWith('http') ? (
                  <img
                    src={car.images[selectedImageIndex]}
                    alt={`${car.name} - Ảnh ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-amber-200/60 flex items-center justify-center text-amber-700">
                    <CarIcon className="w-16 h-16" />
                  </div>
                )}

                {/* Left / Right Arrow Controls */}
                {car.images && car.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? car.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                      title="Ảnh trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === car.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                      title="Ảnh tiếp theo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Top Overlay Badge: Photo Counter */}
                {car.images && car.images.length > 0 && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {selectedImageIndex + 1} / {car.images.length} ảnh
                    </span>
                  </div>
                )}

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2.5 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs">
                  <span>Trạng thái: <strong>Sẵn sàng giao xe</strong></span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Khử khuẩn & Kiểm định 100%
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {car.images && car.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {car.images.map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-amber-500 ring-2 ring-amber-400/40 scale-95 shadow-md'
                          : 'border-slate-200/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {imgUrl?.startsWith('http') ? (
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <CarIcon className="w-5 h-5" />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-white text-[9px] font-bold rounded">
                        #{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" /> Chỗ ngồi
                </span>
                <strong className="text-sm text-slate-900 block mt-1">{car.seats} Chỗ</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CarIcon className="w-3.5 h-3.5 text-amber-500" /> Hộp số
                </span>
                <strong className="text-sm text-slate-900 block mt-1">
                  {car.transmission === 'AUTOMATIC' ? 'Tự Động' : 'Số Sàn'}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" /> Nhiên liệu
                </span>
                <strong className="text-sm text-slate-900 block mt-1">
                  {car.fuelType === 'ELECTRIC' ? 'Xe Điện (EV)' : 'Xăng / Dầu'}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Giới hạn
                </span>
                <strong className="text-sm text-slate-900 block mt-1">
                  {car.dailyKmLimit ? `${car.dailyKmLimit} km/ngày` : 'Không giới hạn'}
                </strong>
              </div>
            </div>
          </div>

          {/* US-06: Bảng Minh Bạch Điều Kiện & Chính Sách Thuê */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">
                Chính Sách & Điều Kiện Thuê Xe Minh Bạch
              </h2>
            </div>

            {/* Điều kiện người lái */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Yêu Cầu Đối Với Người Lái Xe
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Độ tuổi tối thiểu:</strong>
                    <p className="text-slate-500">Từ 21 tuổi trở lên (đủ tuổi chịu trách nhiệm dân sự)</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Kinh nghiệm lái xe:</strong>
                    <p className="text-slate-500">Có GPLX hạng B1/B2 tối thiểu từ 1 năm trở lên</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiền cọc & Quy định trả trễ */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Tiền Cọc Thế Chấp & Quy Định Trả Trễ
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                  <span className="font-semibold text-slate-700">Tiền cọc thế chấp nhận xe:</span>
                  <strong className="font-bold text-amber-900 text-sm">
                    {formatCurrency(car.depositAmount)} (Hoàn trả 100% khi trả xe)
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed">
                  • <strong>Phí trả trễ giờ:</strong> 10% giá thuê ngày cho mỗi giờ trả trễ.<br />
                  • <strong>Phí vệ sinh:</strong> 200.000 VNĐ (nếu xe bị bẩn hoặc có mùi thuốc lá).<br />
                  • <strong>Nhiên liệu:</strong> Nhận xe mức nào trả xe mức đó (Same-to-Same).
                </div>
              </div>
            </div>

            {/* Chính sách hoàn hủy cọc */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Chính Sách Hoàn Hủy Đặt Xe
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Thời Gian Hủy</th>
                      <th className="p-2.5">Phí Phạt Hủy</th>
                      <th className="p-2.5">Quyền Lợi Khách Hàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-medium">Hủy trước giờ nhận &gt; 48 giờ</td>
                      <td className="p-2.5 text-emerald-600 font-bold">0% (Miễn phí)</td>
                      <td className="p-2.5">Hoàn lại 100% tiền cọc</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Hủy trước 24 - 48 giờ</td>
                      <td className="p-2.5 text-amber-600 font-bold">30% cọc</td>
                      <td className="p-2.5">Hoàn lại 70% tiền cọc</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Hủy dưới 24 giờ trước giờ nhận</td>
                      <td className="p-2.5 text-red-600 font-bold">100% cọc</td>
                      <td className="p-2.5">Không hoàn cọc do đã giữ xe</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Quote Breakdown & Insurance Selection (US-06) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
            <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Báo Giá Thuê Xe Chi Tiết</span>
              <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                {quote?.totalDays || 1} Ngày Thuê
              </span>
            </h2>

            {/* Chọn thời gian thuê (US-05) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nhận Xe
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Trả Xe
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            {/* Chọn Gói Bảo Hiểm (US-06) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Chọn Gói Bảo Hiểm
              </label>
              <div className="space-y-2">
                {insurancePackages.map((pkg) => (
                  <label
                    key={pkg.packageId}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedInsuranceId === pkg.packageId
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="insurance"
                      checked={selectedInsuranceId === pkg.packageId}
                      onChange={() => setSelectedInsuranceId(pkg.packageId)}
                      className="mt-1 accent-amber-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{pkg.name}</span>
                        <span>{Number(pkg.pricePerDay) === 0 ? 'Miễn phí' : `+${formatCurrency(pkg.pricePerDay)}/ngày`}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{pkg.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dịch vụ gia tăng (Extras) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Dịch Vụ Đi Kèm
              </label>
              <div className="space-y-2">
                {extras.map((ex) => (
                  <label
                    key={ex.extraId}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedExtraIds.includes(ex.extraId)}
                        onChange={() => toggleExtra(ex.extraId)}
                        className="accent-amber-500"
                      />
                      <span className="font-semibold text-slate-800">{ex.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      +{formatCurrency(ex.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bảng tính chi phí chi tiết (US-06 Breakdown) */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền thuê xe ({quote?.totalDays || 1} ngày):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(quote?.pricingBreakdown.rentalSubtotal || 0)}
                </span>
              </div>

              {quote?.pricingBreakdown.insuranceFee ? (
                <div className="flex justify-between text-slate-600">
                  <span>Phí bảo hiểm nâng cao:</span>
                  <span className="font-bold text-slate-900">
                    +{formatCurrency(quote.pricingBreakdown.insuranceFee)}
                  </span>
                </div>
              ) : null}

              {quote?.pricingBreakdown.extrasFee ? (
                <div className="flex justify-between text-slate-600">
                  <span>Dịch vụ gia tăng:</span>
                  <span className="font-bold text-slate-900">
                    +{formatCurrency(quote.pricingBreakdown.extrasFee)}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between text-slate-600">
                <span>Tiền thế chấp / cọc (hoàn lại):</span>
                <span className="font-bold text-amber-700">
                  {formatCurrency(quote?.pricingBreakdown.depositAmount || car.depositAmount)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Tổng Tiền Thuê:</span>
                <span className="text-amber-600 text-base">
                  {formatCurrency(quote?.pricingBreakdown.totalRentalAmount || 0)}
                </span>
              </div>
            </div>

            {/* Nút Đặt Xe */}
            <Link href={`/booking?carId=${car.id}&start=${startDate}&end=${endDate}&ins=${selectedInsuranceId}`}>
              <Button
                variant="primary"
                size="lg"
                className="w-full h-12 shadow-lg shadow-amber-500/25 font-black text-base"
              >
                Tiến Hành Đặt Xe Ngay
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cam kết giá minh bạch 100%, không phát sinh phụ phí ẩn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
