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
  Layers,
  MapPin,
  Building2,
  ShieldAlert,
  Wrench,
  BarChart3,
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
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: 'Quản Lý Đội Xe & Giá',
      href: '/admin/cars',
      icon: <Car className="w-4 h-4" />,
    },
    {
      name: 'Dòng Xe (Model)',
      href: '/admin/models',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      name: 'Chi Nhánh & Trạm Xe',
      href: '/admin/branches',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: 'Quản Lý Đặt Xe',
      href: '/admin/bookings',
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      name: 'Bàn Giao & Nhận Xe',
      href: '/admin/handover',
      icon: <KeyRound className="w-4 h-4" />,
    },
    {
      name: 'Sự Cố & Bảo Hiểm',
      href: '/admin/incidents',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      name: 'Bảo Dưỡng & Cảnh Báo',
      href: '/admin/maintenance',
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      name: 'Báo Cáo & Thống Kê',
      href: '/admin/reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: 'Khách Hàng & Phân Quyền',
      href: '/admin/users',
      icon: <Users className="w-4 h-4" />,
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi tài khoản quản trị');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 antialiased">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800/80 shrink-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-amber-400 tracking-tight">Quick</span>
              <span className="text-lg font-bold text-white tracking-tight">Hatch</span>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Quản Trị
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick link to Storefront */}
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem Trang Khách Hàng</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </Link>
          </div>
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-semibold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user?.fullName || 'Quản Trị Viên'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-baseline">
              <span className="text-base font-bold text-amber-500">Quick</span>
              <span className="text-base font-bold text-slate-900">Hatch</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden sm:flex items-center relative w-72 lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh đơn hàng, biển số xe..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user?.fullName || 'Quản Trị Viên'}</p>
                <p className="text-[10px] text-slate-400">{user?.role || 'Admin'}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Body with consistent padding and max width */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-64 bg-slate-950 text-slate-300 p-4 space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-base font-bold text-amber-400">QuickHatch Admin</span>
              <button onClick={() => setMobileSidebarOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                      isActive ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-400 hover:bg-slate-900'
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
              className="flex items-center gap-2 text-xs font-medium text-rose-400 py-2.5 border-t border-slate-800"
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
