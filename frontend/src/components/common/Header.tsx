'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Menu, X, Car } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const navLinks = [
    { name: 'All Cars', href: '/cars' },
    { name: 'About Us', href: '#about' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Details', href: '#details' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo QuickHatch / AutoRental */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-amber-500 tracking-tight">Quick</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">Hatch</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-gray-900 shadow-xs">
              <Car className="w-5 h-5 fill-gray-900" />
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors ${
                    isActive
                      ? 'text-amber-500 font-extrabold'
                      : 'text-gray-800 hover:text-amber-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Icons: Search & Profile */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/cars"
              className="p-2 text-gray-700 hover:text-amber-500 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </Link>

            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 pl-2 text-xs font-bold text-gray-900 bg-gray-100 rounded-full hover:bg-amber-100 transition-colors"
              >
                <span>{user.fullName}</span>
                <div className="w-7 h-7 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center font-bold">
                  {user.fullName.charAt(0)}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="p-2 text-gray-700 hover:text-amber-500 transition-colors"
                aria-label="Account Login"
              >
                <div className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-800 fill-gray-800" />
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-800 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-gray-800 hover:text-amber-500 hover:bg-amber-50 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-gray-900 bg-amber-400 rounded-lg"
            >
              Log In / Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
