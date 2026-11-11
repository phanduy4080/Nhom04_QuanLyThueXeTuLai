'use client';

import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface BrandLogoProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Danh sách link logo SVG chính hãng tải từ Wikimedia Commons
 */
export const BRAND_DEFAULT_LOGOS: Record<string, string> = {
  VINFAST: '/brands/vinfast.svg',
  TOYOTA: '/brands/toyota.svg',
  MAZDA: '/brands/mazda.svg',
  HYUNDAI: '/brands/hyundai.svg',
  MERCEDES: '/brands/mercedes.svg',
  'MERCEDES-BENZ': '/brands/mercedes.svg',
  BMW: '/brands/bmw.svg',
  FORD: '/brands/ford.svg',
  MITSUBISHI: '/brands/mitsubishi.svg',
  HONDA: '/brands/honda.svg',
};

/**
 * Tìm kiếm đường dẫn logo thực tế cho hãng xe
 */
export function getBrandLogoUrl(name: string, customLogoUrl?: string | null): string {
  if (customLogoUrl && customLogoUrl.trim()) {
    return customLogoUrl.trim();
  }

  const normalized = (name || '').trim().toUpperCase();
  for (const [key, path] of Object.entries(BRAND_DEFAULT_LOGOS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }

  return '';
}

export default function BrandLogo({
  name,
  logoUrl,
  className = '',
  size = 'md',
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg p-1',
    md: 'w-12 h-12 rounded-xl p-1.5',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2.5',
    xl: 'w-20 h-20 rounded-2xl p-3',
  }[size];

  const resolvedUrl = getBrandLogoUrl(name, logoUrl);

  if (resolvedUrl && !imgError) {
    return (
      <div
        className={`relative flex items-center justify-center bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300 ${sizeClasses} ${className}`}
        title={name}
      >
        <img
          src={resolvedUrl}
          alt={`Logo ${name}`}
          className="w-full h-full object-contain filter drop-shadow-xs"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback an toàn nếu ảnh hỏng hoàn toàn: icon Car biểu tượng chuyên nghiệp
  return (
    <div
      className={`flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs ${sizeClasses} ${className}`}
      title={name}
    >
      <Car className="w-1/2 h-1/2 text-slate-600" />
    </div>
  );
}
