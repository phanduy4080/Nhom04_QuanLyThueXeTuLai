'use client';

import React, { useState } from 'react';

interface BrandLogoProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Lấy chữ viết tắt biểu tượng của hãng xe theo đúng thiết kế
 */
export function getBrandMonogram(name: string): { text: string; isGold?: boolean } {
  const normalized = (name || '').trim().toUpperCase();

  if (normalized.includes('VINFAST')) return { text: 'VF', isGold: true };
  if (normalized.includes('TOYOTA')) return { text: 'TOY' };
  if (normalized.includes('MAZDA')) return { text: 'MZD' };
  if (normalized.includes('HYUNDAI')) return { text: 'HYU' };
  if (normalized.includes('MERCEDES')) return { text: 'MB', isGold: true };
  if (normalized.includes('BMW')) return { text: 'BMW' };
  if (normalized.includes('FORD')) return { text: 'FORD' };
  if (normalized.includes('MITSUBISHI')) return { text: 'MIT' };
  if (normalized.includes('KIA')) return { text: 'KIA' };
  if (normalized.includes('HONDA')) return { text: 'HND' };
  if (normalized.includes('AUDI')) return { text: 'AUDI' };
  if (normalized.includes('PORSCHE')) return { text: 'POR', isGold: true };

  const words = normalized.split(/\s+/);
  if (words.length >= 2) {
    return { text: words.slice(0, 3).map((w) => w[0]).join('') };
  }
  return { text: normalized.slice(0, 3) };
}

export default function BrandLogo({
  name,
  logoUrl,
  className = '',
  size = 'md',
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-[10px]',
    md: 'w-12 h-12 rounded-xl text-xs',
    lg: 'w-14 h-14 rounded-2xl text-sm',
    xl: 'w-18 h-18 rounded-2xl text-base',
  }[size];

  const monogram = getBrandMonogram(name);

  if (logoUrl && !imgError) {
    return (
      <div
        className={`relative flex items-center justify-center bg-white border border-slate-200 overflow-hidden shadow-2xs ${sizeClasses} ${className}`}
      >
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-1.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: Biểu tượng Monogram bo góc theo phong cách QuickHatch
  return (
    <div
      className={`flex items-center justify-center font-black tracking-tight select-none shadow-2xs bg-slate-700 border border-slate-600/80 transition-transform ${sizeClasses} ${className}`}
      title={name}
    >
      <span className={monogram.isGold ? 'text-amber-400 font-extrabold' : 'text-white'}>
        {monogram.text}
      </span>
    </div>
  );
}
