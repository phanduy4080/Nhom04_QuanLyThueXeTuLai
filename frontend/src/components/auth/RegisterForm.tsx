'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import SocialLoginButtons from './SocialLoginButtons';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';

// Schema xác thực Form Đăng Ký
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Họ và tên tối thiểu 2 ký tự' })
      .max(50, { message: 'Họ và tên không vượt quá 50 ký tự' }),
    email: z
      .string()
      .min(1, { message: 'Vui lòng nhập địa chỉ email' })
      .email({ message: 'Địa chỉ email không hợp lệ' }),
    phone: z
      .string()
      .min(1, { message: 'Vui lòng nhập số điện thoại' })
      .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
        message: 'Số điện thoại không đúng định dạng VN (10 số)',
      }),
    password: z
      .string()
      .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Vui lòng xác nhận mật khẩu' }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'Bạn cần đồng ý với điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const res = await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      setAuth(res.user, res.token);
      toast.success('Đăng ký tài khoản thành công!');
      router.push('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng ký không thành công. Vui lòng thử lại!';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-left mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tạo Tài Khoản Mới
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Đăng ký trong 1 phút để nhận ưu đãi giảm 10% cho chuyến xe tự lái đầu tiên.
        </p>
      </div>

      {/* Social Login */}
      <SocialLoginButtons />

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative px-3 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400">
          Hoặc điền thông tin đăng ký
        </span>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ tên */}
        <Input
          label="Họ và Tên"
          type="text"
          placeholder="Nguyễn Văn A"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        {/* Email */}
        <Input
          label="Địa Chỉ Email"
          type="email"
          placeholder="nguyenvana@gmail.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          required
          {...register('email')}
        />

        {/* Số điện thoại */}
        <Input
          label="Số Điện Thoại"
          type="tel"
          placeholder="0912 345 678"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          required
          {...register('phone')}
        />

        {/* Mật khẩu */}
        <Input
          label="Mật Khẩu"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          showPasswordToggle
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          required
          {...register('password')}
        />

        {/* Xác nhận Mật khẩu */}
        <Input
          label="Xác Nhận Mật Khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          showPasswordToggle
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />

        {/* Điều khoản */}
        <div className="pt-2">
          <Checkbox
            label={
              <span className="text-xs text-slate-600">
                Tôi đồng ý với{' '}
                <Link href="/terms" className="font-semibold text-slate-900 underline hover:text-amber-600">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="font-semibold text-slate-900 underline hover:text-amber-600">
                  Chính sách bảo mật
                </Link>
              </span>
            }
            error={errors.agreeTerms?.message}
            {...register('agreeTerms')}
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
          className="w-full mt-2"
        >
          Tạo Tài Khoản
        </Button>
      </form>

      {/* Chuyển sang Đăng nhập */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
        Bạn đã có tài khoản?{' '}
        <Link
          href="/login"
          className="font-bold text-gray-900 hover:text-amber-600 underline underline-offset-4 transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Cam kết bảo mật dữ liệu khách hàng theo chuẩn GDPR</span>
      </div>
    </div>
  );
}
