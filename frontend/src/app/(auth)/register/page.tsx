import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đăng Ký Tài Khoản | QuickHatch - Thuê Xe Tự Lái',
  description: 'Đăng ký tài khoản QuickHatch để thuê xe tự lái đời mới, giao tận nơi nhanh chóng, giá tốt.',
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Đang tải form đăng ký...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
