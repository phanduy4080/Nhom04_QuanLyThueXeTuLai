import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đăng Nhập | QuickHatch - Thuê Xe Tự Lái',
  description: 'Đăng nhập vào hệ thống thuê xe tự lái QuickHatch để quản lý lịch thuê xe và nhận ưu đãi độc quyền.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Đang tải form đăng nhập...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
