This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
1. Khởi động tất cả các container:
Mở terminal tại thư mục gốc của dự án và chạy:

bash
docker compose up -d --build
2. Kiểm tra trạng thái các container:
bash
docker compose ps
3. Xem log hoạt động:
bash
docker compose logs -f
4. Dừng toàn bộ hệ thống:
bash
docker compose down
Các cổng truy cập sau khi chạy Docker:
🌐 Front-end Web: http://localhost:3000
🚀 Back-end API: http://localhost:5001/api/v1
📚 Swagger API Docs: http://localhost:5001/api/docs
🗄️ PostgreSQL Port: localhost:5432
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

. Cấu trúc Front-end (frontend/src/)
frontend/src/
├── app/                                        # Hệ thống App Router (Đã khởi tạo & build thành công)
│   ├── (auth)/
│   │   ├── login/page.tsx                      # Trang đăng nhập
│   │   └── register/page.tsx                   # Trang đăng ký
│   ├── (storefront)/
│   │   ├── page.tsx                            # Trang chủ (Tìm kiếm nhanh, xe hot, bảng giá)
│   │   ├── cars/
│   │   │   ├── page.tsx                        # Danh sách xe & bộ lọc đa tiêu chí
│   │   │   └── [slug]/page.tsx                 # Chi tiết thông số xe, gallery, đặt xe
│   │   ├── booking/page.tsx                    # Luồng đặt cọc xe
│   │   └── profile/page.tsx                    # Lịch sử đơn thuê & hợp đồng
│   └── (admin)/
│       ├── admin/dashboard/page.tsx            # Báo cáo doanh thu & tỷ lệ lấp đầy
│       ├── admin/cars/page.tsx                 # CRUD Quản lý đội xe & tình trạng
│       ├── admin/bookings/page.tsx             # Quản lý đơn đặt cọc & hợp đồng
│       ├── admin/handover/page.tsx             # Biên bản bàn giao/nhận xe (Check-in/Out)
│       └── admin/users/page.tsx                # Quản lý khách hàng & phân quyền
├── components/
│   ├── ui/                                     # Nơi chứa các Shadcn UI primitives
│   ├── common/                                 # Header, Footer, DateRangePicker, CarCard...
│   ├── storefront/                             # CarFilter, CarGallery, BookingSummary...
│   └── admin/                                  # CarFormModal, StatusBadge, HandoverChecklist...
├── lib/
│   ├── api/axios.ts                            # Axios instance với Interceptors gắn JWT
│   ├── seo/metadata.ts                         # SEO helper
│   └── utils.ts                                # cn helper, formatCurrency, formatDate
├── services/
│   └── car.service.ts                          # Car API Service (gọi NestJS backend)
├── stores/
│   ├── useAuthStore.ts                         # Zustand quản lý Auth state
│   └── useBookingStore.ts                      # Zustand quản lý dữ liệu luồng đặt xe
├── styles/
│   ├── _variables.sass                         # Sass Design Tokens (Colors, Typography, Radii)
│   └── _mixins.sass                            # Sass Responsive Mixins & Glassmorphism
└── types/
    └── index.ts                                # Type definitions (Car, Booking, User, ApiResponse...)
2. Cấu trúc Back-end (backend/src/)
backend/src/
├── common/
│   ├── decorators/                             # @CurrentUser(), @Roles()
│   ├── filters/                                # Global HttpExceptionFilter
│   ├── guards/                                 # JwtAuthGuard, RolesGuard
│   └── interceptors/                           # TransformResponseInterceptor
├── config/                                     # Cấu hình JWT, Cloudinary, PayOS, Mailer
├── modules/                                    # Các Feature Modules
│   ├── auth/                                   # Xác thực người dùng, JWT
│   ├── users/                                  # Quản lý tài khoản
│   ├── cars/                                   # Quản lý xe, phân loại, tìm kiếm
│   ├── categories/                             # Phân khúc & hãng xe
│   ├── bookings/                               # Đặt xe, kiểm tra lịch trống
│   ├── contracts/                              # Hợp đồng thuê xe điện tử
│   ├── handovers/                              # Biên bản bàn giao/nhận lại xe
│   ├── payments/                               # Cổng thanh toán VietQR / PayOS
│   ├── maintenance/                            # Lịch bảo dưỡng xe
│   └── statistics/                             # Thống kê doanh thu
├── prisma/
│   ├── prisma.service.ts                       # Database Client Service
│   ├── prisma.module.ts                        # Global Database Module
│   └── schema.prisma                           # PostgreSQL Database Schema
├── app.module.ts                               # Root Module (ConfigModule, ScheduleModule)
└── main.ts                                     # Bootstrap (CORS, Helmet, ValidationPipe, Swagger UI)