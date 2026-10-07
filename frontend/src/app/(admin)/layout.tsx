'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  KeyRound,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Shield,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      name: 'Tổng Quan Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Quản Lý Đội Xe & Giá',
      href: '/admin/cars',
      icon: <Car className="w-5 h-5" />,
    },
    {
      name: 'Quản Lý Đặt Xe',
      href: '/admin/bookings',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      name: 'Bàn Giao & Nhận Xe',
      href: '/admin/handover',
      icon: <KeyRound className="w-5 h-5" />,
    },
    {
      name: 'Khách Hàng & Phân Quyền',
      href: '/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi tài khoản quản trị');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-gray-950 text-white border-r border-gray-800 shrink-0 z-30">
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/80">
          <Link href="/admin/dashboard" >
            <div className="flex items-baseline">
              <span className="text-xl font-black text-amber-400 tracking-tight">Quick</span>
              <span className="text-xl font-black text-white tracking-tight">Hatch</span>
            </div>
            
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Quản Trị Hệ Thống
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-400 text-gray-950 shadow-md shadow-amber-400/10'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20 text-gray-950' : 'bg-gray-800 text-amber-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick link to Storefront */}
          <div className="pt-6 mt-6 border-t border-gray-800/80">
            <div className="px-3 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Khách Hàng
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-900 hover:text-amber-400 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4" />
                <span>Xem Trang Khách Hàng</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </Link>
          </div>
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-gray-800/80 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 font-black flex items-center justify-center text-sm shadow-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {user?.fullName || 'Quản Trị Viên'}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <Shield className="w-3 h-3" />
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-baseline">
              <span className="text-lg font-black text-amber-500">Quick</span>
              <span className="text-lg font-black text-gray-900">Hatch</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden sm:flex items-center relative w-72 xl:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh đơn hàng, biển số xe, khách hàng..."
              className="w-full h-10 pl-10 pr-4 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            

            <button
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user?.fullName || 'Trần Văn Quản Trị'}</p>
                <p className="text-[11px] text-slate-400">admin@quickhatch.vn</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-gray-950 font-black flex items-center justify-center text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 bg-gray-950 text-white p-5 space-y-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <span className="text-xl font-black text-amber-400">QuickHatch Admin</span>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <nav className="space-y-2 flex-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold ${
                      isActive ? 'bg-amber-400 text-gray-950' : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-rose-400 py-3 border-t border-gray-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
