'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  CheckCircle2,
  Camera,
  FileCheck,
  Gauge,
  Fuel,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { rentalService } from '@/services/rental.service';

export default function AdminHandoverPage() {
  const [activeTab, setActiveTab] = useState<'pickup' | 'return'>('pickup');
  const [handoverRecords, setHandoverRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandovers = async () => {
      try {
        setLoading(true);
        const res = await rentalService.getHandovers();
        if (res.data) setHandoverRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHandovers();
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Biên Bản Bàn Giao & Nhận Xe
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ghi nhận số ODO, mức nhiên liệu/pin, ảnh tình trạng xe lúc giao và nhận xe.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('pickup')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pickup'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Giao Xe Cho Khách (Check-in)
        </button>

        <button
          onClick={() => setActiveTab('return')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'return'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Nhận Xe Trả Lại (Check-out)
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Mã Biên Bản</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Đơn Đặt & Khách Hàng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Xe Thuê</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Số Km (ODO)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Mức Pin / Xăng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Nhân Viên Bàn Giao</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {handoverRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{r.id}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <strong className="text-slate-900 block">{r.customerName}</strong>
                    <span className="text-slate-400 font-mono">{r.bookingCode}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">{r.carName}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{r.odo.toLocaleString()} km</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold whitespace-nowrap">{r.fuel}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{r.staff}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap">
                      Đã hoàn tất
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
