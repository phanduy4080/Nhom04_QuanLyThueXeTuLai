'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [usersList, setUsersList] = useState([
    {
      id: '1',
      fullName: 'Trần Văn Quản Trị',
      email: 'admin@quickhatch.vn',
      phone: '0900000001',
      role: 'ADMIN',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      createdAt: '01/09/2026',
    },
    {
      id: '2',
      fullName: 'Lê Văn Nhân Viên',
      email: 'nhanvien@quickhatch.vn',
      phone: '0900000002',
      role: 'STAFF',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      createdAt: '05/09/2026',
    },
    {
      id: '3',
      fullName: 'Nguyễn Văn Khách Hàng',
      email: 'khachhang@quickhatch.vn',
      phone: '0901234567',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      createdAt: '10/09/2026',
    },
    {
      id: '4',
      fullName: 'Trần Thị Mai',
      email: 'maitran@gmail.com',
      phone: '0918889999',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
      createdAt: '20/09/2026',
    },
  ]);

  const handleVerifyCustomer = (id: string, name: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, verificationStatus: 'VERIFIED' } : u)),
    );
    toast.success(`Đã xác thực GPLX & CCCD cho khách hàng ${name}!`);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    return matchRole && matchSearch;
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Khách Hàng & Phân Quyền (IAM)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý tài khoản quản trị, nhân viên, khách hàng và duyệt xác minh GPLX / CCCD.
        </p>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, email, số điện thoại..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
            <option value="STAFF">Nhân Viên Bàn Giao (STAFF)</option>
            <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Người Dùng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Vai Trò</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Xác Thực GPLX / CCCD</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Ngày Tạo</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-slate-900 text-sm block">{u.fullName}</strong>
                        <span className="text-slate-400">{u.email} • {u.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {u.role === 'ADMIN' ? (
                      <span className="px-2.5 py-1 rounded-lg font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                        <Shield className="w-3 h-3 shrink-0" /> ADMIN
                      </span>
                    ) : u.role === 'STAFF' ? (
                      <span className="px-2.5 py-1 rounded-lg font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                        <KeyRound className="w-3 h-3 shrink-0" /> STAFF
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                        <Users className="w-3 h-3 shrink-0" /> CUSTOMER
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {u.verificationStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Đã xác thực
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold whitespace-nowrap border border-amber-200 shadow-2xs">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Chờ duyệt GPLX
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 whitespace-nowrap shadow-2xs">
                      Hoạt động
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                    {u.createdAt}
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {u.verificationStatus === 'PENDING' && (
                      <button
                        onClick={() => handleVerifyCustomer(u.id, u.fullName)}
                        className="inline-flex items-center px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        Duyệt GPLX
                      </button>
                    )}
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
