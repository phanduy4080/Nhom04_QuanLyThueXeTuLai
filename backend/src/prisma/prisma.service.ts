import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, UserType, AccountStatus, TransmissionType, FuelType } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.ensureBasicData();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Tự động khởi tạo dữ liệu mẫu tối thiểu (Master Data) nếu cơ sở dữ liệu mới khởi tạo hoặc chưa có dữ liệu.
   * Giúp bất kỳ ai kéo code (pull) về cũng có thể tạo xe, đặt xe ngay mà không bị lỗi Foreign Key!
   */
  async ensureBasicData() {
    try {
      // 0. Đảm bảo cấu trúc bảng mở rộng Sprint 5 & 6 luôn sẵn sàng
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS booking.rental_extensions (
          extension_id SERIAL PRIMARY KEY,
          extension_code VARCHAR(50) UNIQUE NOT NULL,
          booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
          current_end_date TIMESTAMPTZ NOT NULL,
          new_end_date TIMESTAMPTZ NOT NULL,
          extended_days INT NOT NULL DEFAULT 1,
          daily_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
          extra_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
          reason TEXT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          system_decision VARCHAR(50) NULL,
          system_notes TEXT NULL,
          reviewed_by BIGINT NULL REFERENCES iam.users(user_id) ON DELETE SET NULL,
          reviewed_at TIMESTAMPTZ NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS incident.incidents (
          incident_id BIGSERIAL PRIMARY KEY,
          incident_code VARCHAR(50) UNIQUE NOT NULL,
          booking_id INT NOT NULL REFERENCES booking.bookings(booking_id) ON DELETE CASCADE,
          vehicle_id BIGINT NOT NULL REFERENCES fleet.vehicles(vehicle_id) ON DELETE CASCADE,
          incident_type incident.incident_type NOT NULL DEFAULT 'OTHER',
          status incident.incident_status NOT NULL DEFAULT 'REPORTED',
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          location VARCHAR(255),
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          contact_phone VARCHAR(50),
          evidence_photos JSONB DEFAULT '[]'::jsonb,
          insurance_claim_number VARCHAR(100),
          insurer_name VARCHAR(150),
          insurance_appraiser VARCHAR(100),
          insurance_contact VARCHAR(50),
          insurance_status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
          insurance_notes TEXT,
          total_damage_cost NUMERIC(15,2) DEFAULT 0,
          insurance_coverage_amount NUMERIC(15,2) DEFAULT 0,
          company_share_amount NUMERIC(15,2) DEFAULT 0,
          customer_share_amount NUMERIC(15,2) DEFAULT 0,
          deducted_from_deposit NUMERIC(15,2) DEFAULT 0,
          customer_payment_status VARCHAR(50) DEFAULT 'PENDING',
          liability_party incident.liable_party DEFAULT 'CUSTOMER',
          liability_notes TEXT,
          resolution_notes TEXT,
          reported_by_name VARCHAR(100),
          reported_by_phone VARCHAR(50),
          reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          assigned_staff_id BIGINT REFERENCES iam.users(user_id) ON DELETE SET NULL,
          resolved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 1. Khởi tạo Quyền hệ thống (iam.roles)
      const adminRole = await this.role.upsert({
        where: { code: 'ADMIN' },
        update: {},
        create: { code: 'ADMIN', name: 'Quản Trị Viên', description: 'Toàn quyền quản trị hệ thống', isSystem: true },
      });
      await this.role.upsert({
        where: { code: 'STAFF' },
        update: {},
        create: { code: 'STAFF', name: 'Nhân Viên', description: 'Nhân viên vận hành chi nhánh', isSystem: true },
      });
      await this.role.upsert({
        where: { code: 'CUSTOMER' },
        update: {},
        create: { code: 'CUSTOMER', name: 'Khách Hàng', description: 'Khách hàng thuê xe', isSystem: true },
      });

      // 2. Tài khoản Admin mẫu (iam.users) - Mật khẩu: 123456
      const adminUser = await this.user.upsert({
        where: { email: 'admin@quickhatch.vn' },
        update: {},
        create: {
          email: 'admin@quickhatch.vn',
          phone: '0900000001',
          userType: UserType.STAFF,
          status: AccountStatus.ACTIVE,
          passwordHash: '$2b$10$ep/0K0YfL/v5sF9j7tM.p.HwQ5eA8UqJkM1hWcWqL7mPnXvI5eZ2S',
        },
      });

      // Gán vai trò ADMIN cho adminUser
      await this.userRole.upsert({
        where: {
          userId_roleId: {
            userId: adminUser.userId,
            roleId: adminRole.roleId,
          },
        },
        update: {},
        create: {
          userId: adminUser.userId,
          roleId: adminRole.roleId,
        },
      });

      // 3. Khởi tạo Chi nhánh trạm xe (org.branches)
      const branchesData = [
        {
          code: 'CN_SGN_01',
          name: 'Chi Nhánh Sân Bay Tân Sơn Nhất',
          addressLine: '45 Trường Sơn',
          ward: 'Phường 2',
          district: 'Tân Bình',
          province: 'Hồ Chí Minh',
          phone: '02838485555',
          email: 'sgn@quickhatch.vn',
          isPickupPoint: true,
        },
        {
          code: 'CN_SGN_02',
          name: 'Chi Nhánh Quận 1 - Trung Tâm',
          addressLine: '12 Lê Duẩn',
          ward: 'Bến Nghé',
          district: 'Quận 1',
          province: 'Hồ Chí Minh',
          phone: '02838221122',
          email: 'q1@quickhatch.vn',
          isPickupPoint: true,
        },
        {
          code: 'CN_HAN_01',
          name: 'Chi Nhánh Sân Bay Nội Bài',
          addressLine: 'Ga T1 Sân Bay Nội Bài',
          ward: 'Phú Minh',
          district: 'Sóc Sơn',
          province: 'Hà Nội',
          phone: '02438865555',
          email: 'han@quickhatch.vn',
          isPickupPoint: true,
        },
      ];

      for (const b of branchesData) {
        await this.branch.upsert({
          where: { code: b.code },
          update: {},
          create: b,
        });
      }

      // 4. Hãng xe (fleet.brands)
      const brandsData = [
        { name: 'VinFast', country: 'Việt Nam' },
        { name: 'Toyota', country: 'Nhật Bản' },
        { name: 'Mazda', country: 'Nhật Bản' },
        { name: 'Hyundai', country: 'Hàn Quốc' },
        { name: 'Mitsubishi', country: 'Nhật Bản' },
        { name: 'Ford', country: 'Mỹ' },
      ];
      const brandsMap: Record<string, number> = {};
      for (const br of brandsData) {
        const brand = await this.brand.upsert({
          where: { name: br.name },
          update: {},
          create: br,
        });
        brandsMap[br.name] = brand.brandId;
      }

      // 5. Phân khúc xe (fleet.vehicle_categories)
      const categoriesData = [
        { code: 'SEDAN', name: 'Sedan 4-5 chỗ', description: 'Xe du lịch đô thị êm ái, tiết kiệm nhiên liệu', requiredLicenseClasses: ['B1', 'B2'], sortOrder: 1 },
        { code: 'SUV', name: 'SUV / Crossover 5-7 chỗ', description: 'Gầm cao đa dụng, mạnh mẽ, vượt địa hình tốt', requiredLicenseClasses: ['B1', 'B2'], sortOrder: 2 },
        { code: 'MPV', name: 'MPV 7 chỗ gia đình', description: 'Khoang lái rộng rãi, phù hợp du lịch gia đình', requiredLicenseClasses: ['B1', 'B2'], sortOrder: 3 },
        { code: 'EV', name: 'Xe Điện (Electric Vehicle)', description: 'Xe điện thân thiện môi trường, vận hành êm ái', requiredLicenseClasses: ['B1', 'B2'], sortOrder: 4 },
      ];
      const catMap: Record<string, number> = {};
      for (const cat of categoriesData) {
        const c = await this.vehicleCategory.upsert({
          where: { code: cat.code },
          update: {},
          create: cat,
        });
        catMap[cat.code] = c.categoryId;
      }

      // 6. Chính sách thuê mặc định (pricing.rental_policies)
      await this.rentalPolicy.upsert({
        where: { code: 'STANDARD_2026' },
        update: {},
        create: {
          code: 'STANDARD_2026',
          name: 'Chính Sách Thuê Chuẩn QuickHatch',
          description: 'Áp dụng cho toàn bộ xe du lịch tự lái thông thường',
          minDriverAge: 21,
          minLicenseYears: 1.0,
          lateFeePercentPerHour: 10.0,
          extraKmFee: 5000,
          cleaningFee: 200000,
        },
      });

      // 7. Dòng xe mẫu (fleet.vehicle_models)
      const modelsData = [
        { brand: 'VinFast', category: 'EV', name: 'VinFast VF 8', variant: 'Plus 2024', seats: 5, transmission: TransmissionType.AUTOMATIC, fuelType: FuelType.ELECTRIC, launchYear: 2024 },
        { brand: 'VinFast', category: 'EV', name: 'VinFast VF 3', variant: 'Eco 2024', seats: 4, transmission: TransmissionType.AUTOMATIC, fuelType: FuelType.ELECTRIC, launchYear: 2024 },
        { brand: 'Toyota', category: 'SEDAN', name: 'Toyota Vios', variant: '1.5G CVT', seats: 5, transmission: TransmissionType.AUTOMATIC, fuelType: FuelType.GASOLINE, launchYear: 2023 },
        { brand: 'Mazda', category: 'SUV', name: 'Mazda CX-5', variant: '2.0 Premium', seats: 5, transmission: TransmissionType.AUTOMATIC, fuelType: FuelType.GASOLINE, launchYear: 2024 },
        { brand: 'Hyundai', category: 'SUV', name: 'Hyundai SantaFe', variant: '2.5 Xăng Cao Cấp', seats: 7, transmission: TransmissionType.AUTOMATIC, fuelType: FuelType.GASOLINE, launchYear: 2023 },
        { brand: 'Mitsubishi', category: 'MPV', name: 'Mitsubishi Xpander', variant: '1.5 AT Premium', seats: 7, transmission: TransmissionType.AUTOMATIC, fuelType: FuelType.GASOLINE, launchYear: 2023 },
      ];

      for (const m of modelsData) {
        const brandId = brandsMap[m.brand];
        const categoryId = catMap[m.category];
        if (brandId && categoryId) {
          const existingModel = await this.vehicleModel.findFirst({
            where: {
              brandId,
              name: m.name,
              variant: m.variant,
            },
          });
          if (!existingModel) {
            await this.vehicleModel.create({
              data: {
                brandId,
                categoryId,
                name: m.name,
                variant: m.variant,
                seats: m.seats,
                transmission: m.transmission,
                fuelType: m.fuelType,
                launchYear: m.launchYear,
              },
            });
          }
        }
      }

      this.logger.log('Đã kiểm tra và đồng bộ dữ liệu mẫu cơ bản thành công (Roles, Admin, Branches, Brands, Models)');
    } catch (error) {
      this.logger.warn(`Bỏ qua tự động khởi tạo dữ liệu mẫu: ${error.message}`);
    }
  }
}
