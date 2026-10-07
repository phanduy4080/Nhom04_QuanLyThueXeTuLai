'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Car,
  ChevronDown,
  Info,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'deposit' | 'insurance' | 'cancellation'>('pricing');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const priceTiers = [
    {
      category: 'Xe Điện Mini EV (VinFast VF 3)',
      pricePerDay: 450000,
      deposit: 5000000,
      tierDiscount: [
        { days: '1 - 2 ngày', rate: '450.000đ/ngày', discount: 'Giá chuẩn' },
        { days: '3 - 5 ngày', rate: '427.500đ/ngày', discount: 'Giảm 5%' },
        { days: '6 - 10 ngày', rate: '405.000đ/ngày', discount: 'Giảm 10%' },
        { days: 'Từ 11 ngày', rate: '382.500đ/ngày', discount: 'Giảm 15%' },
      ],
      features: ['Sạc pin miễn phí tại trạm VF', 'Di chuyển nội đô cực kỳ linh hoạt', 'Tự động 100%'],
    },
    {
      category: 'Sedan 4-5 Chỗ (Toyota Vios / Honda City)',
      pricePerDay: 700000,
      deposit: 5000000,
      tierDiscount: [
        { days: '1 - 2 ngày', rate: '700.000đ/ngày', discount: 'Giá chuẩn' },
        { days: '3 - 5 ngày', rate: '665.000đ/ngày', discount: 'Giảm 5%' },
        { days: '6 - 10 ngày', rate: '630.000đ/ngày', discount: 'Giảm 10%' },
        { days: 'Từ 11 ngày', rate: '595.000đ/ngày', discount: 'Giảm 15%' },
      ],
      features: ['Tiết kiệm nhiên liệu 5.8L/100km', 'Cốp sau rộng 506 lít', 'Hộp số tự động CVT'],
    },
    {
      category: 'Crossover / SUV 5 Chỗ (Mazda CX-5 / Hyundai Tucson)',
      pricePerDay: 1100000,
      deposit: 10000000,
      tierDiscount: [
        { days: '1 - 2 ngày', rate: '1.100.000đ/ngày', discount: 'Giá chuẩn' },
        { days: '3 - 5 ngày', rate: '1.045.000đ/ngày', discount: 'Giảm 5%' },
        { days: '6 - 10 ngày', rate: '990.000đ/ngày', discount: 'Giảm 10%' },
        { days: 'Từ 11 ngày', rate: '935.000đ/ngày', discount: 'Giảm 15%' },
      ],
      features: ['Gầm cao, mâm 19 inch', 'Ghế da cao cấp & màn hình HUD', 'Hệ thống an toàn i-Activsense'],
    },
    {
      category: 'SUV / MPV 7 Chỗ (Hyundai SantaFe / Xpander)',
      pricePerDay: 850000,
      deposit: 8000000,
      tierDiscount: [
        { days: '1 - 2 ngày', rate: '850.000đ/ngày', discount: 'Giá chuẩn' },
        { days: '3 - 5 ngày', rate: '807.500đ/ngày', discount: 'Giảm 5%' },
        { days: '6 - 10 ngày', rate: '765.000đ/ngày', discount: 'Giảm 10%' },
        { days: 'Từ 11 ngày', rate: '722.500đ/ngày', discount: 'Giảm 15%' },
      ],
      features: ['7 chỗ ngồi rộng rãi cho đại gia đình', 'Gầm xe 225mm vượt dốc', 'Điều hòa 2 dàn lạnh độc lập'],
    },
    {
      category: 'SUV Điện Thông Minh (VinFast VF 8 Plus)',
      pricePerDay: 1200000,
      deposit: 10000000,
      tierDiscount: [
        { days: '1 - 2 ngày', rate: '1.200.000đ/ngày', discount: 'Giá chuẩn' },
        { days: '3 - 5 ngày', rate: '1.140.000đ/ngày', discount: 'Giảm 5%' },
        { days: '6 - 10 ngày', rate: '1.080.000đ/ngày', discount: 'Giảm 10%' },
        { days: 'Từ 11 ngày', rate: '1.020.000đ/ngày', discount: 'Giảm 15%' },
      ],
      features: ['Pin 87.7 kWh chạy 471 km/lần sạc', 'Trợ lý ảo thông minh & ADAS cấp 2', 'Nội thất da Nappa sang trọng'],
    },
  ];

  const faqs = [
    {
      q: '1. Thủ tục nhận xe tự lái tại QuickHatch gồm những gì?',
      a: 'Bạn chỉ cần chuẩn bị: (1) Căn cước công dân gắn chip hoặc Hộ chiếu còn hiệu lực; (2) Giấy phép lái xe hạng B1/B2 trở lên có thời hạn tối thiểu 1 năm; (3) Tiền đặt cọc thế chấp xe (bằng chuyển khoản hoặc tiền mặt khi nhận xe).',
    },
    {
      q: '2. Tiền cọc thế chấp được hoàn lại như thế nào và trong bao lâu?',
      a: 'Ngay khi bạn bàn giao lại xe và hoàn tất biên bản kiểm tra xe, nhân viên QuickHatch sẽ thực hiện lệnh hoàn trả 100% tiền cọc về tài khoản ngân hàng của bạn trong vòng 5 - 15 phút.',
    },
    {
      q: '3. Nếu trả xe muộn hơn so với hợp đồng thì tính phí ra sao?',
      a: 'QuickHatch hỗ trợ miễn phí 30 phút đầu tiên khi trả xe. Từ tiếng thứ 2 trở đi, phụ phí tính 10% đơn giá ngày thuê cho mỗi giờ trễ. Nếu trễ trên 6 tiếng, hệ thống sẽ tự động tính thành 1 ngày thuê tiếp theo.',
    },
    {
      q: '4. Sự khác biệt giữa Gói Bảo Hiểm Tiêu Chuẩn và Gói Toàn Diện?',
      a: 'Gói Tiêu Chuẩn được tích hợp sẵn miễn phí trong giá thuê, khách hàng có mức tự chịu bồi thường tối đa 5.000.000đ/vụ. Gói Toàn Diện (150.000đ/ngày) giúp bạn được miễn trừ 100% chi phí bồi thường khi phát sinh va quẹt, xước sơn và được hỗ trợ cứu hộ giao thông 24/7 toàn quốc.',
    },
    {
      q: '5. Chính sách hủy đặt xe và hoàn tiền cọc giữ chỗ như thế nào?',
      a: 'Hủy trước 48 giờ trước giờ nhận xe: Hoàn tiền 100%. Hủy trong khoảng từ 24 - 48 giờ: Phí hủy 30%. Hủy trong vòng 24 giờ trước nhận xe: Phí hủy 50%.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-4 text-center sm:text-left relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Chính Sách & Bảng Giá Thuê Xe Tự Lái
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            QuickHatch công khai toàn bộ biểu phí, chính sách chiết khấu theo ngày, quy định bảo hiểm và điều khoản hoàn cọc rõ ràng để Quý khách hoàn toàn an tâm trên mọi hành trình.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-8 overflow-x-auto pb-1">
        {[
          { id: 'pricing', label: 'Bảng Giá & Chiết Khấu Bậc', icon: DollarSign },
          { id: 'deposit', label: 'Tiền Cọc & Hoàn Cọc', icon: ShieldCheck },
          { id: 'insurance', label: 'Gói Bảo Hiểm & Phụ Phí', icon: Shield },
          { id: 'cancellation', label: 'Quy Định Hủy Chuyến', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pricing & Tiers */}
      {activeTab === 'pricing' && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Bảng Giá Thuê Xe & Ưu Đãi Thuê Dài Ngày
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Giá thuê tự động giảm dần theo thời gian thuê thực tế (thuê càng nhiều ngày giá càng rẻ).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {priceTiers.map((tier, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                      Phân Khúc
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{tier.category}</h3>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-400 block font-medium">Giá niêm yết chuẩn</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-black text-slate-900">
                        {formatCurrency(tier.pricePerDay)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ngày</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Cọc nhận xe: {formatCurrency(tier.deposit)}
                    </span>
                  </div>

                  {/* Tier breakdown table */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Bậc giá theo số ngày thuê:
                    </span>
                    {tier.tierDiscount.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <span className="text-slate-600 font-medium">{d.days}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{d.rate}</span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            {d.discount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link href="/cars" className="block">
                    <Button variant="primary" size="md" className="w-full">
                      Tìm Xe Phân Khúc Này
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Deposit & Refund Policy */}
      {activeTab === 'deposit' && (
        <div className="space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs animate-in fade-in-50 duration-300">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Quy Trình Đặt Cọc & Hoàn Cọc Minh Bạch 100%
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tiền cọc thế chấp nhằm đảm bảo trách nhiệm giữ gìn tài sản của người thuê xe trong thời gian lưu hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900">Khi Đặt Xe (Giữ Chỗ)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khách hàng thanh toán trước <strong>500.000đ - 1.000.000đ</strong> tiền cọc giữ xe để khóa lịch trên hệ thống, cam kết có xe 100% đúng giờ hẹn.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900">Khi Nhận Bàn Giao Xe</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thanh toán số tiền cọc thế chấp còn lại (tùy theo từng phân khúc xe từ 5.000.000đ đến 10.000.000đ) sau khi kiểm tra tình trạng xe và ký hợp đồng.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-emerald-950">Hoàn Cọc Siêu Tốc (5-15 Phút)</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Ngay khi hoàn tất thủ tục trả xe, nhân viên kỹ thuật kiểm tra và kích hoạt lệnh chuyển khoản hoàn trả 100% tiền cọc về tài khoản của bạn.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3 mt-4">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Hình thức đặt cọc linh hoạt:</strong> Quý khách có thể lựa chọn cọc bằng Chuyển khoản ngân hàng trực tiếp, Thẻ tín dụng (tạm giữ hạn mức Pre-authorization) hoặc Xe máy chính chủ kèm cà vẹt gốc.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Insurance & Extras */}
      {activeTab === 'insurance' && (
        <div className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs animate-in fade-in-50 duration-300">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Gói Bảo Hiểm & Phụ Phí Vận Hành</h2>
            <p className="text-sm text-slate-500 mt-1">
              Bảo vệ bạn và gia đình trước mọi rủi ro không mong muốn khi lưu thông trên đường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Package */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Gói Miễn Phí Tích Hợp
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">Gói Tiêu Chuẩn (Basic)</h3>
                </div>
                <span className="text-lg font-black text-slate-900">0 VNĐ</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
                <p>• <strong>Bảo hiểm TNDS bắt buộc:</strong> Đáp ứng đầy đủ quy định pháp luật.</p>
                <p>• <strong>Mức tự chịu tổn thất (Deductible):</strong> Tối đa 5.000.000 VNĐ/vụ va quẹt.</p>
                <p>• <strong>Cứu hộ:</strong> Hỗ trợ cứu hộ trong phạm vi bán kính 30km nội thành.</p>
              </div>
            </div>

            {/* Premium Package */}
            <div className="p-6 rounded-3xl border-2 border-amber-400 bg-amber-50/30 space-y-4 relative shadow-sm">
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-400 text-gray-950 text-xs font-black">
                KHUYÊN DÙNG
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                    100% An Tâm Tuyệt Đối
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">Gói Toàn Diện (Premium)</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">150.000 VNĐ</span>
                  <span className="text-xs text-slate-500 font-medium block">/ngày</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 border-t border-amber-200 pt-4">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Miễn trừ 100% chi phí bồi thường:</strong> Va quẹt, trầy xước không mất tiền.</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Cứu hộ 24/7 toàn quốc:</strong> Hỗ trợ sự cố kỹ thuật tận nơi bất kể ngày đêm.</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Xe thay thế tương đương:</strong> Nếu xe gặp sự cố kỹ thuật không thể di chuyển.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Phụ phí minh bạch */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Biểu Phí Phụ Thu Phát Sinh (Nếu Có)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 block">Vượt Quá Giới Hạn Km</strong>
                <p className="text-slate-500">3.000đ - 5.000đ / km vượt mức (áp dụng nếu vượt quá 350 km/ngày).</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 block">Trả Xe Trễ Giờ</strong>
                <p className="text-slate-500">Miễn phí 30 phút đầu; sau đó tính 10% giá thuê/ngày cho mỗi giờ.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 block">Phí Vệ Sinh Đặc Biệt</strong>
                <p className="text-slate-500">100.000đ - 200.000đ nếu xe bị bám bùn đất nặng, hải sản hoặc mùi thuốc lá.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 block">Nhiên Liệu Bàn Giao</strong>
                <p className="text-slate-500">Nhận xe mức nào trả xe mức đó (bù theo giá xăng dầu thị trường nếu thiếu).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cancellation Policy */}
      {activeTab === 'cancellation' && (
        <div className="space-y-6 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs animate-in fade-in-50 duration-300">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Quy Định Hủy Chuyến & Đổi Lịch Trình</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nhằm đảm bảo quyền lợi xe luôn sẵn sàng cho khách hàng, QuickHatch áp dụng chính sách hủy chuyến công bằng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-lg inline-block">
                Hoàn tiền 100%
              </span>
              <h3 className="font-bold text-slate-900 text-base">Trước 48 Giờ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Miễn phí hủy hoàn toàn và hoàn trả 100% tiền cọc giữ chỗ khi thông báo trước 48h so với giờ nhận xe.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-lg inline-block">
                Phí hủy 30%
              </span>
              <h3 className="font-bold text-slate-900 text-base">Từ 24 Đến 48 Giờ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khách hàng chịu phí hủy 30% tiền cọc giữ xe để bù đắp chi phí điều phối bãi xe và bảo dưỡng.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-900 rounded-lg inline-block">
                Phí hủy 50%
              </span>
              <h3 className="font-bold text-slate-900 text-base">Dưới 24 Giờ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Áp dụng phí hủy 50% tiền cọc giữ chỗ khi hủy gấp trong vòng 24 giờ trước thời điểm khởi hành.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Accordion Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Câu Hỏi Thường Gặp (FAQ)</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm sm:text-base hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3 pl-2 border-l-2 border-amber-400 animate-in fade-in-50 duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-amber-400 p-8 sm:p-10 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1 text-gray-950">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Sẵn Sàng Cho Chuyến Đi Sắp Tới Của Bạn?
          </h3>
          <p className="text-xs sm:text-sm font-medium text-gray-900">
            Hơn 50+ dòng xe đời mới đang sẵn sàng giao tận nơi trong 30 phút.
          </p>
        </div>
        <Link href="/cars" className="shrink-0">
          <Button
            variant="primary"
            size="lg"
            className="bg-gray-950 text-white hover:bg-slate-800 shadow-md font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Khám Phá Đội Xe Ngay
          </Button>
        </Link>
      </div>
    </div>
  );
}
