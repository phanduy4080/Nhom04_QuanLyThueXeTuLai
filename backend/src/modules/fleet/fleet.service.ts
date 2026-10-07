import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateVehicleStatusDto } from './dto/update-status.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { Prisma, VehicleStatus } from '@prisma/client';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  /**
   * US-04 & US-05: Tìm kiếm xe & Lọc theo tiêu chí + Kiểm tra tự động lịch trống
   */
  async findAll(query: QueryVehiclesDto) {
    const {
      search,
      branchId,
      categoryId,
      brandId,
      seats,
      transmission,
      fuelType,
      status,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {
      isActive: true,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    } else {
      // Mặc định khách hàng chỉ xem xe AVAILABLE
      where.status = 'AVAILABLE';
    }

    if (branchId) where.currentBranchId = branchId;
    if (seats) where.seats = seats;
    if (transmission) where.transmission = transmission;
    if (fuelType) where.fuelType = fuelType;

    if (minPrice || maxPrice) {
      where.listPricePerDay = {};
      if (minPrice) where.listPricePerDay.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) where.listPricePerDay.lte = new Prisma.Decimal(maxPrice);
    }

    if (categoryId || brandId) {
      where.model = {};
      if (categoryId) where.model.categoryId = categoryId;
      if (brandId) where.model.brandId = brandId;
    }

    if (search) {
      where.OR = [
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { model: { name: { contains: search, mode: 'insensitive' } } },
        { model: { brand: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // US-05: Tự động kiểm tra xung đột lịch nếu khách chọn ngày bắt đầu & kết thúc
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
      }

      // Loại bỏ các xe có Availability Block đang hoạt động trong khoảng thời gian này
      where.availabilityBlocks = {
        none: {
          isActive: true,
          OR: [
            {
              // Block trùng lặp thời gian
              AND: [
                { createdAt: { lte: end } },
                { releasedAt: null },
              ],
            },
          ],
        },
      };
    }

    const [total, vehicles] = await Promise.all([
      this.prisma.vehicle.count({ where }),
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          model: {
            include: {
              brand: true,
              category: true,
            },
          },
          currentBranch: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            include: { file: true },
          },
          featureMaps: {
            include: { feature: true },
          },
          policy: {
            include: { cancellationRules: true },
          },
        },
        orderBy: { vehicleId: 'desc' },
      }),
    ]);

    // Format kết quả an toàn cho JSON response
    const formattedVehicles = vehicles.map((v) => ({
      id: v.vehicleId.toString(),
      publicId: v.publicId,
      assetCode: v.assetCode,
      licensePlate: v.licensePlate,
      name: `${v.model.brand.name} ${v.model.name} ${v.model.variant}`.trim(),
      brand: v.model.brand.name,
      category: v.model.category.name,
      modelYear: v.manufactureYear || v.model.launchYear,
      seats: v.seats || v.model.seats,
      transmission: v.transmission,
      fuelType: v.fuelType,
      fuelConsumption: v.model.fuelConsumptionL100km
        ? `${v.model.fuelConsumptionL100km}L/100km`
        : v.model.batteryKwh
          ? `${v.model.batteryKwh} kWh (${v.model.evRangeKm} km)`
          : undefined,
      pricePerDay: Number(v.listPricePerDay),
      depositAmount: Number(v.depositAmount),
      dailyKmLimit: v.dailyKmLimit,
      extraKmFee: v.extraKmFee ? Number(v.extraKmFee) : undefined,
      status: v.status,
      branch: v.currentBranch?.name,
      location: v.currentBranch ? `${v.currentBranch.district}, ${v.currentBranch.province}` : undefined,
      features: v.featureMaps.map((fm) => fm.feature.name),
      images: v.images.map((img) => img.file?.objectKey || '/placeholder-car.png'),
      thumbnail: v.images.find((i) => i.isPrimary)?.file?.objectKey || v.images[0]?.file?.objectKey || '/placeholder-car.png',
      policy: v.policy
        ? {
            id: v.policy.policyId,
            name: v.policy.name,
            minDriverAge: v.policy.minDriverAge,
            minLicenseYears: Number(v.policy.minLicenseYears),
            lateFeePercentPerHour: Number(v.policy.lateFeePercentPerHour),
            cleaningFee: Number(v.policy.cleaningFee),
            cancellationRules: v.policy.cancellationRules.map((cr) => ({
              hoursBeforeMin: cr.hoursBeforeMin,
              feePercent: Number(cr.feePercent),
              description: cr.description,
            })),
          }
        : null,
    }));

    return {
      vehicles: formattedVehicles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * US-01 & US-06: Lấy chi tiết xe và chính sách thuê minh bạch
   */
  async findById(id: string) {
    const vehicleId = BigInt(id);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        model: {
          include: {
            brand: true,
            category: true,
          },
        },
        currentBranch: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          include: { file: true },
        },
        featureMaps: {
          include: { feature: true },
        },
        policy: {
          include: { cancellationRules: true },
        },
      },
    });

    if (!vehicle || vehicle.deletedAt) {
      throw new NotFoundException(`Không tìm thấy xe với mã ID: ${id}`);
    }

    return {
      id: vehicle.vehicleId.toString(),
      publicId: vehicle.publicId,
      assetCode: vehicle.assetCode,
      licensePlate: vehicle.licensePlate,
      name: `${vehicle.model.brand.name} ${vehicle.model.name} ${vehicle.model.variant}`.trim(),
      brand: vehicle.model.brand.name,
      category: vehicle.model.category.name,
      categoryId: vehicle.model.categoryId,
      modelId: vehicle.modelId,
      modelYear: vehicle.manufactureYear || vehicle.model.launchYear,
      seats: vehicle.seats || vehicle.model.seats,
      doors: vehicle.model.doors,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      batteryKwh: vehicle.model.batteryKwh ? Number(vehicle.model.batteryKwh) : null,
      evRangeKm: vehicle.model.evRangeKm,
      fuelTankLiters: vehicle.model.fuelTankLiters ? Number(vehicle.model.fuelTankLiters) : null,
      fuelConsumption: vehicle.model.fuelConsumptionL100km
        ? `${vehicle.model.fuelConsumptionL100km}L/100km`
        : undefined,
      color: vehicle.color,
      odometerKm: vehicle.odometerKm,
      status: vehicle.status,
      pricePerDay: Number(vehicle.listPricePerDay),
      depositAmount: Number(vehicle.depositAmount),
      dailyKmLimit: vehicle.dailyKmLimit,
      extraKmFee: vehicle.extraKmFee ? Number(vehicle.extraKmFee) : undefined,
      branch: vehicle.currentBranch,
      features: vehicle.featureMaps.map((fm) => fm.feature.name),
      images: vehicle.images.map((img) => img.file?.objectKey || '/placeholder-car.png'),
      policy: vehicle.policy
        ? {
            id: vehicle.policy.policyId,
            code: vehicle.policy.code,
            name: vehicle.policy.name,
            minDriverAge: vehicle.policy.minDriverAge,
            minLicenseYears: Number(vehicle.policy.minLicenseYears),
            lateFeePercentPerHour: Number(vehicle.policy.lateFeePercentPerHour),
            extraKmFee: Number(vehicle.policy.extraKmFee),
            fuelShortageFeePerPercent: Number(vehicle.policy.fuelShortageFeePerPercent),
            cleaningFee: Number(vehicle.policy.cleaningFee),
            termsText: vehicle.policy.termsText,
            cancellationRules: vehicle.policy.cancellationRules.map((cr) => ({
              hoursBeforeMin: cr.hoursBeforeMin,
              feePercent: Number(cr.feePercent),
              feeFixed: Number(cr.feeFixed),
              description: cr.description,
            })),
          }
        : null,
    };
  }

  /**
   * US-01: Thêm xe mới vào đội xe
   */
  async create(dto: CreateVehicleDto, userId?: string) {
    const userBigInt = userId ? BigInt(userId) : undefined;

    // Kiểm tra trùng biển số
    const existing = await this.prisma.vehicle.findFirst({
      where: {
        licensePlate: dto.licensePlate,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(`Biển số xe ${dto.licensePlate} đã tồn tại trong hệ thống`);
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        licensePlate: dto.licensePlate,
        assetCode: dto.assetCode,
        modelId: dto.modelId,
        manufactureYear: dto.manufactureYear,
        color: dto.color,
        seats: dto.seats,
        transmission: dto.transmission,
        fuelType: dto.fuelType,
        listPricePerDay: new Prisma.Decimal(dto.listPricePerDay),
        depositAmount: new Prisma.Decimal(dto.depositAmount),
        dailyKmLimit: dto.dailyKmLimit,
        extraKmFee: dto.extraKmFee ? new Prisma.Decimal(dto.extraKmFee) : undefined,
        currentBranchId: dto.currentBranchId,
        notes: dto.notes,
        status: 'AVAILABLE',
        createdBy: userBigInt,
      },
      include: {
        model: { include: { brand: true, category: true } },
      },
    });

    if (dto.images && dto.images.length > 0) {
      await this.saveVehicleImages(vehicle.vehicleId, dto.images);
    }

    return {
      id: vehicle.vehicleId.toString(),
      licensePlate: vehicle.licensePlate,
      model: vehicle.model.name,
      status: vehicle.status,
      message: 'Thêm xe thành công',
    };
  }

  /**
   * Cập nhật thông tin chi tiết xe
   */
  async update(id: string, dto: UpdateVehicleDto) {
    const vehicleId = BigInt(id);

    const updateData: Prisma.VehicleUpdateInput = {};
    if (dto.licensePlate) updateData.licensePlate = dto.licensePlate;
    if (dto.assetCode) updateData.assetCode = dto.assetCode;
    if (dto.modelId) updateData.model = { connect: { modelId: dto.modelId } };
    if (dto.manufactureYear !== undefined) updateData.manufactureYear = dto.manufactureYear;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.seats !== undefined) updateData.seats = dto.seats;
    if (dto.transmission) updateData.transmission = dto.transmission;
    if (dto.fuelType) updateData.fuelType = dto.fuelType;
    if (dto.listPricePerDay !== undefined) updateData.listPricePerDay = new Prisma.Decimal(dto.listPricePerDay);
    if (dto.depositAmount !== undefined) updateData.depositAmount = new Prisma.Decimal(dto.depositAmount);
    if (dto.dailyKmLimit !== undefined) updateData.dailyKmLimit = dto.dailyKmLimit;
    if (dto.extraKmFee !== undefined) updateData.extraKmFee = new Prisma.Decimal(dto.extraKmFee);
    if (dto.currentBranchId !== undefined) updateData.currentBranch = dto.currentBranchId ? { connect: { branchId: dto.currentBranchId } } : { disconnect: true };
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.vehicle.update({
      where: { vehicleId },
      data: updateData,
    });

    if (dto.images !== undefined) {
      await this.saveVehicleImages(vehicleId, dto.images);
    }

    return {
      id: updated.vehicleId.toString(),
      licensePlate: updated.licensePlate,
      status: updated.status,
      message: 'Cập nhật thông tin xe thành công',
    };
  }

  private async saveVehicleImages(vehicleId: bigint, imageUrls: string[]) {
    if (!imageUrls || !Array.isArray(imageUrls)) return;
    await this.prisma.vehicleImage.deleteMany({ where: { vehicleId } });

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i]?.trim();
      if (!url) continue;

      let file = await this.prisma.file.findFirst({
        where: { objectKey: url },
      });

      if (!file) {
        file = await this.prisma.file.create({
          data: {
            storageProvider: 'LOCAL',
            bucket: 'vehicle-photos',
            objectKey: url,
            originalName: `car-photo-${i + 1}.jpg`,
            mimeType: 'image/jpeg',
            isPrivate: false,
          },
        });
      }

      await this.prisma.vehicleImage.create({
        data: {
          vehicleId,
          fileId: file.fileId,
          sortOrder: i,
          isPrimary: i === 0,
          caption: i === 0 ? 'Ảnh đại diện chính' : `Góc chụp ${i + 1}`,
        },
      });
    }
  }

  /**
   * US-02: Theo dõi và cập nhật trạng thái xe + ghi lịch sử chuyển trạng thái
   */
  async updateStatus(id: string, dto: UpdateVehicleStatusDto, userId?: string) {
    const vehicleId = BigInt(id);
    const userBigInt = userId ? BigInt(userId) : undefined;

    const currentVehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
    });

    if (!currentVehicle) {
      throw new NotFoundException(`Không tìm thấy xe ID: ${id}`);
    }

    const fromStatus = currentVehicle.status;
    const toStatus = dto.status;

    // Cập nhật trạng thái xe & ghi log lịch sử
    const [updatedVehicle] = await this.prisma.$transaction([
      this.prisma.vehicle.update({
        where: { vehicleId },
        data: {
          status: toStatus,
          statusChangedAt: new Date(),
        },
      }),
      this.prisma.vehicleStatusHistory.create({
        data: {
          vehicleId,
          fromStatus,
          toStatus,
          reason: dto.reason || `Thay đổi trạng thái từ ${fromStatus} sang ${toStatus}`,
          sourceType: 'MANUAL',
          changedBy: userBigInt,
        },
      }),
    ]);

    // Nếu chuyển sang bảo dưỡng hoặc sửa chữa -> tự động tạo Availability Block
    if (toStatus === 'MAINTENANCE' || toStatus === 'REPAIRING' || toStatus === 'SUSPENDED') {
      await this.prisma.vehicleAvailabilityBlock.create({
        data: {
          vehicleId,
          blockType: toStatus === 'MAINTENANCE' ? 'MAINTENANCE' : toStatus === 'REPAIRING' ? 'REPAIR' : 'SUSPENSION',
          note: dto.reason || `Tự động tạo block do xe chuyển sang ${toStatus}`,
          createdBy: userBigInt,
        },
      });
    }

    return {
      id: updatedVehicle.vehicleId.toString(),
      licensePlate: updatedVehicle.licensePlate,
      fromStatus,
      toStatus,
      statusChangedAt: updatedVehicle.statusChangedAt,
      message: `Đã cập nhật trạng thái xe thành ${toStatus}`,
    };
  }

  /**
   * US-05: Kiểm tra xe có sẵn sàng trong khoảng thời gian cụ thể hay không
   */
  async checkAvailability(id: string, startDate: string, endDate: string) {
    const vehicleId = BigInt(id);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Thời gian nhận xe phải trước thời gian trả xe');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        availabilityBlocks: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    const isAvailable = vehicle.status === 'AVAILABLE' && vehicle.availabilityBlocks.length === 0;

    return {
      vehicleId: vehicle.vehicleId.toString(),
      licensePlate: vehicle.licensePlate,
      currentStatus: vehicle.status,
      isAvailable,
      startDate,
      endDate,
      message: isAvailable
        ? 'Xe hoàn toàn có sẵn trong thời gian bạn chọn'
        : 'Xe hiện không thể đặt trong khoảng thời gian này',
    };
  }

  /**
   * Danh mục xe, Hãng xe, Dòng xe phục vụ bộ lọc
   */
  async getCategories() {
    return this.prisma.vehicleCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getBrands() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getModels(brandId?: number, categoryId?: number) {
    const where: Prisma.VehicleModelWhereInput = { isActive: true };
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.vehicleModel.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: { name: 'asc' },
    });
  }
}
