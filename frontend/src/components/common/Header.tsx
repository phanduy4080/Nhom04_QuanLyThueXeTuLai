'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Menu, X, Car, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuthStore();

  const navLinks = [
    { name: 'Trang Chủ', href: '/' },
    { name: 'Tất Cả Xe Cho Thuê', href: '/cars' },
    { name: 'Chính Sách Báo Giá', href: '/policy' },
    { name: 'Liên Hệ', href: '/contact' },
  ];

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/cars?search=${encodeURIComponent(headerSearchQuery.trim())}`);
      setIsSearchOpen(false);
    } else {
      router.push('/cars');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    setUserDropdownOpen(false);
    router.push('/');
  };

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo QuickHatch / AutoRental */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-amber-500 tracking-tight">Quick</span>
              <span className="text-2xl font-black text-gray-950 tracking-tight">Hatch</span>
            </div>
            
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors ${
                    isActive
                      ? 'text-amber-600 font-extrabold'
                      : 'text-slate-700 hover:text-amber-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Search & Auth Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Header Search Form */}
            {isSearchOpen ? (
              <form
                onSubmit={handleHeaderSearch}
                className="relative flex items-center animate-in fade-in zoom-in-95 duration-200"
              >
                <input
                  type="text"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  placeholder="Tìm tên xe, thương hiệu..."
                  autoFocus
                  className="w-56 lg:w-72 h-10 pl-9 pr-8 text-xs font-semibold bg-slate-100 border border-amber-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
                <Search className="w-4 h-4 text-amber-500 absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tìm kiếm xe"
                title="Tìm kiếm xe"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-amber-100/80 rounded-full transition-colors cursor-pointer"
                >
                  <span>{user.fullName}</span>
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center font-black">
                    {user.fullName.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    {isAdminOrStaff && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>Trang Quản Trị (Admin)</span>
                      </Link>
                    )}

                    <Link
                      href="/cars"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Car className="w-4 h-4 text-slate-400" />
                      <span>Thuê Xe Mới</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-gray-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Đăng Nhập / Đăng Ký</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-800 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search Form */}
          <form onSubmit={handleHeaderSearch} className="relative">
            <input
              type="text"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              placeholder="Tìm kiếm xe, thương hiệu..."
              className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-bold text-slate-800 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
              >
                {link.name}
              </Link>
            ))}

            {isAdminOrStaff && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 rounded-xl flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Trang Quản Trị (Admin Portal)</span>
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-sm font-bold text-gray-950 bg-amber-400 rounded-xl"
              >
                Đăng Nhập / Đăng Ký
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
