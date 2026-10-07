import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateRentalPriceDto } from './dto/calculate-price.dto';
import { CreatePricePlanDto } from './dto/create-price-plan.dto';
import { CreateRentalPolicyDto } from './dto/create-rental-policy.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /**
   * US-03: Lấy danh sách các bảng giá (Price Plans)
   */
  async getPricePlans() {
    return this.prisma.pricePlan.findMany({
      where: { isActive: true },
      include: {
        priceTiers: { orderBy: { minDays: 'asc' } },
        model: { include: { brand: true } },
        category: true,
        branch: true,
      },
      orderBy: { priority: 'desc' },
    });
  }

  /**
   * US-03: Tạo bảng giá mới (Admin)
   */
  async createPricePlan(dto: CreatePricePlanDto, userId?: string) {
    const userBigInt = userId ? BigInt(userId) : undefined;
    const vehicleBigInt = dto.vehicleId ? BigInt(dto.vehicleId) : undefined;

    const plan = await this.prisma.pricePlan.create({
      data: {
        name: dto.name,
        planType: dto.planType,
        scope: dto.scope,
        modelId: dto.modelId,
        categoryId: dto.categoryId,
        vehicleId: vehicleBigInt,
        branchId: dto.branchId,
        createdBy: userBigInt,
        priceTiers: {
          create: dto.tiers.map((t) => ({
            minDays: t.minDays,
            maxDays: t.maxDays,
            pricePerDay: new Prisma.Decimal(t.pricePerDay),
          })),
        },
      },
      include: {
        priceTiers: true,
      },
    });

    return {
      id: plan.planId.toString(),
      name: plan.name,
      tiersCount: plan.priceTiers.length,
      message: 'Tạo bảng giá thành công',
    };
  }

  /**
   * US-03 & US-06: Lấy danh sách chính sách thuê xe
   */
  async getRentalPolicies() {
    return this.prisma.rentalPolicy.findMany({
      where: { isActive: true },
      include: { cancellationRules: true },
    });
  }

  async getRentalPolicyById(id: number) {
    const policy = await this.prisma.rentalPolicy.findUnique({
      where: { policyId: id },
      include: { cancellationRules: true },
    });

    if (!policy) {
      throw new NotFoundException('Không tìm thấy chính sách');
    }

    return policy;
  }

  async createRentalPolicy(dto: CreateRentalPolicyDto) {
    return this.prisma.rentalPolicy.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        minDriverAge: dto.minDriverAge,
        minLicenseYears: new Prisma.Decimal(dto.minLicenseYears),
        lateFeePercentPerHour: new Prisma.Decimal(dto.lateFeePercentPerHour),
        extraKmFee: new Prisma.Decimal(dto.extraKmFee),
        cleaningFee: new Prisma.Decimal(dto.cleaningFee),
        termsText: dto.termsText,
      },
    });
  }

  /**
   * Lấy danh sách gói bảo hiểm & dịch vụ đi kèm
   */
  async getInsurancePackages() {
    return this.prisma.rentalPackage.findMany({
      where: { isActive: true },
    });
  }

  async getExtras() {
    return this.prisma.extra.findMany({
      where: { isActive: true },
    });
  }

  /**
   * US-06: Tính toán chi tiết báo giá và tính minh bạch điều kiện thuê
   */
  async calculateRentalPrice(dto: CalculateRentalPriceDto) {
    const vehicleId = BigInt(dto.vehicleId);
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('Thời gian nhận xe phải trước thời gian trả xe');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        model: { include: { brand: true, category: true } },
        policy: { include: { cancellationRules: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    // Tính tổng số ngày thuê (tối thiểu 1 ngày)
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalDays = Math.max(1, Math.ceil(diffHours / 24));

    // Xác định đơn giá theo ngày từ Price Plans / Tiers hoặc List Price
    let dailyPrice = Number(vehicle.listPricePerDay);

    const activePlan = await this.prisma.pricePlan.findFirst({
      where: {
        isActive: true,
        OR: [
          { vehicleId },
          { modelId: vehicle.modelId },
          { categoryId: vehicle.model.categoryId },
        ],
      },
      include: {
        priceTiers: { orderBy: { minDays: 'desc' } },
      },
      orderBy: { priority: 'desc' },
    });

    if (activePlan && activePlan.priceTiers.length > 0) {
      const matchedTier = activePlan.priceTiers.find(
        (t) => totalDays >= t.minDays && (!t.maxDays || totalDays <= t.maxDays),
      );
      if (matchedTier) {
        dailyPrice = Number(matchedTier.pricePerDay);
      }
    }

    const rentalSubtotal = dailyPrice * totalDays;

    // Tính phí gói bảo hiểm
    let insuranceFee = 0;
    let selectedInsurance = null;
    if (dto.insurancePackageId) {
      const pkg = await this.prisma.rentalPackage.findUnique({
        where: { packageId: dto.insurancePackageId },
      });
      if (pkg) {
        insuranceFee = Number(pkg.pricePerDay) * totalDays;
        selectedInsurance = {
          id: pkg.packageId,
          name: pkg.name,
          pricePerDay: Number(pkg.pricePerDay),
          totalFee: insuranceFee,
          customerDeductible: Number(pkg.customerDeductible),
          coverageText: pkg.coverageText,
        };
      }
    }

    // Tính phí dịch vụ gia tăng (Extras)
    let extrasFee = 0;
    const selectedExtras: Array<{ id: number; name: string; price: number; totalFee: number }> = [];
    if (dto.extraIds && dto.extraIds.length > 0) {
      const extras = await this.prisma.extra.findMany({
        where: { extraId: { in: dto.extraIds } },
      });
      for (const ex of extras) {
        const fee = ex.priceUnit === 'PER_DAY' ? Number(ex.price) * totalDays : Number(ex.price);
        extrasFee += fee;
        selectedExtras.push({
          id: ex.extraId,
          name: ex.name,
          price: Number(ex.price),
          totalFee: fee,
        });
      }
    }

    // Giảm giá khuyến mãi
    let discountAmount = 0;
    let appliedPromo = null;
    if (dto.promoCode) {
      const promo = await this.prisma.promotion.findUnique({
        where: { code: dto.promoCode },
      });
      if (promo && promo.isActive) {
        if (promo.promoType === 'PERCENT') {
          discountAmount = (rentalSubtotal * Number(promo.value)) / 100;
          if (promo.maxDiscount && discountAmount > Number(promo.maxDiscount)) {
            discountAmount = Number(promo.maxDiscount);
          }
        } else {
          discountAmount = Number(promo.value);
        }
        appliedPromo = {
          code: promo.code,
          name: promo.name,
          discountAmount,
        };
      }
    }

    const totalRentalAmount = Math.max(0, rentalSubtotal + insuranceFee + extrasFee - discountAmount);
    const depositAmount = Number(vehicle.depositAmount);

    return {
      vehicleId: vehicle.vehicleId.toString(),
      vehicleName: `${vehicle.model.brand.name} ${vehicle.model.name}`,
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalDays,
      pricingBreakdown: {
        dailyRate: dailyPrice,
        rentalSubtotal,
        insuranceFee,
        extrasFee,
        discountAmount,
        totalRentalAmount,
        depositAmount,
        totalPayableAtPickup: depositAmount + totalRentalAmount,
      },
      selectedInsurance,
      selectedExtras,
      appliedPromo,
      transparencyPolicy: vehicle.policy
        ? {
            policyName: vehicle.policy.name,
            minDriverAge: vehicle.policy.minDriverAge,
            minLicenseYears: Number(vehicle.policy.minLicenseYears),
            lateFeeNotice: `Phí trễ hạn: ${Number(vehicle.policy.lateFeePercentPerHour)}% giá thuê ngày cho mỗi giờ trả trễ`,
            fuelNotice: 'Nhiên liệu nhận - trả theo nguyên tắc như lúc nhận (Same-to-Same)',
            cleaningFeeNotice: `Phí vệ sinh: ${Number(vehicle.policy.cleaningFee).toLocaleString('vi-VN')} VNĐ nếu xe bị bẩn nhiều`,
            cancellationPolicy: vehicle.policy.cancellationRules.map((r) => ({
              condition: `Hủy trước giờ nhận >= ${r.hoursBeforeMin}h`,
              feePercent: `${Number(r.feePercent)}%`,
              description: r.description,
            })),
          }
        : null,
    };
  }
}
