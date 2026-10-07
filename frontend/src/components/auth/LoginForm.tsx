'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import SocialLoginButtons from './SocialLoginButtons';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';

// Schema xác thực Form Đăng Nhập
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Vui lòng nhập email hoặc số điện thoại' })
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(val);
        return isEmail || isPhone;
      },
      { message: 'Email hoặc số điện thoại không đúng định dạng' },
    ),
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  // Xử lý gửi Form Đăng Nhập
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await authService.login({
        email: data.email,
        password: data.password,
      });

      setAuth(res.user, res.token);
      toast.success(`Đăng nhập thành công! Chào mừng ${res.user.fullName}`);

      // Nếu là admin và không có redirect chỉ định -> điều hướng vào admin portal
      if (res.user.role === 'ADMIN' && redirectUrl === '/') {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectUrl);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng nhập không thành công. Vui lòng thử lại!';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Nút điền nhanh tài khoản mẫu để test
  const handleQuickFill = (role: 'customer' | 'admin') => {
    if (role === 'customer') {
      setValue('email', 'khachhang@quickhatch.vn');
      setValue('password', '123456');
      toast.info('Đã điền tài khoản Khách hàng thử nghiệm');
    } else {
      setValue('email', 'admin@quickhatch.vn');
      setValue('password', 'admin123');
      toast.info('Đã điền tài khoản Quản trị viên thử nghiệm');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tiêu đề & Lời chào */}
      <div className="text-left mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Chào Mừng Trở Lại
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Đăng nhập để quản lý lịch trình và trải nghiệm dịch vụ thuê xe tự lái đẳng cấp.
        </p>
      </div>

      {/* Quick Demo Fill Pills (Tiện lợi khi kiểm thử) */}
      <div className="mb-6 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('customer')}
            className="text-xs px-2.5 py-1.5 bg-white hover:bg-amber-100 text-slate-700 font-semibold rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Khách Hàng</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            className="text-xs px-2.5 py-1.5 bg-white hover:bg-amber-100 text-slate-700 font-semibold rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Quản Trị Viên (Admin)</span>
          </button>
        </div>
      </div>

      {/* Social Login */}
      <SocialLoginButtons />

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative px-3 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400">
          Hoặc tiếp tục với email
        </span>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email / Số điện thoại */}
        <Input
          label="Email hoặc Số Điện Thoại"
          type="text"
          placeholder="name@example.com hoặc 0901234567"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          required
          {...register('email')}
        />

        {/* Mật khẩu */}
        <div className="space-y-1">
          <Input
            label="Mật Khẩu"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            required
            {...register('password')}
          />
        </div>

        {/* Remember me & Quên mật khẩu */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            label="Ghi nhớ đăng nhập"
            {...register('rememberMe')}
          />
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút Đăng Nhập */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
          className="w-full mt-2"
        >
          Đăng Nhập
        </Button>
      </form>

      {/* Chuyển sang Đăng ký */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
        Bạn chưa có tài khoản?{' '}
        <Link
          href="/register"
          className="font-bold text-gray-900 hover:text-amber-600 underline underline-offset-4 transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>

      {/* Security footer badge */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Bảo mật thông tin thanh toán & dữ liệu cá nhân 100%</span>
      </div>
    </div>
  );
}
