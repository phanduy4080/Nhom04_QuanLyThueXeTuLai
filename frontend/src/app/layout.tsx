import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Hệ Thống Thuê Xe Tự Lái Uy Tín - Giá Tốt | Nhóm 04',
  description: 'Dịch vụ cho thuê xe tự lái 4-7 chỗ đời mới, xe điện VinFast, giao xe tận nơi, thủ tục nhanh chóng, giá tốt nhất.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
