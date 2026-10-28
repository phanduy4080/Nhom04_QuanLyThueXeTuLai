import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateVehicleStatusDto } from './dto/update-status.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { QueryModelsDto } from './dto/query-models.dto';
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
    const trimmedPlate = dto.licensePlate.trim().toUpperCase();

    // 1. Kiểm tra trùng biển số
    const existing = await this.prisma.vehicle.findFirst({
      where: {
        licensePlate: trimmedPlate,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(`Biển số xe "${trimmedPlate}" đã tồn tại trong hệ thống`);
    }

    // 2. Xử lý mã tài sản (tránh lỗi unique constraint khi truyền chuỗi rỗng)
    const cleanAssetCode = dto.assetCode?.trim() ? dto.assetCode.trim() : null;
    if (cleanAssetCode) {
      const existingAsset = await this.prisma.vehicle.findFirst({
        where: {
          assetCode: cleanAssetCode,
          deletedAt: null,
        },
      });
      if (existingAsset) {
        throw new BadRequestException(`Mã tài sản nội bộ "${cleanAssetCode}" đã tồn tại trong hệ thống`);
      }
    }

    // 3. Kiểm tra dòng xe (Model) tồn tại
    const targetModelId = Number(dto.modelId);
    const model = await this.prisma.vehicleModel.findUnique({
      where: { modelId: targetModelId },
      include: { brand: true, category: true },
    });

    if (!model) {
      throw new BadRequestException(
        `Dòng xe với ID ${dto.modelId} không tồn tại trong cơ sở dữ liệu. Vui lòng chọn dòng xe khác hoặc tạo mới tại Quản lý dòng xe.`,
      );
    }

    // 4. Kiểm tra chi nhánh (Branch) tồn tại
    let validBranchId: number | undefined = undefined;
    if (dto.currentBranchId) {
      const targetBranchId = Number(dto.currentBranchId);
      const branch = await this.prisma.branch.findUnique({
        where: { branchId: targetBranchId },
      });
      if (!branch) {
        throw new BadRequestException(
          `Chi nhánh trạm xe với ID ${dto.currentBranchId} không tồn tại trong cơ sở dữ liệu. Vui lòng chọn chi nhánh có sẵn.`,
        );
      }
      validBranchId = branch.branchId;
    }

    // 5. Kiểm tra người tạo (User) có tồn tại trong iam.users không (tránh lỗi Foreign Key)
    let validUserId: bigint | undefined = undefined;
    if (userId) {
      try {
        const candidateId = BigInt(userId);
        const userExists = await this.prisma.user.findUnique({
          where: { userId: candidateId },
          select: { userId: true },
        });
        if (userExists) {
          validUserId = candidateId;
        }
      } catch {
        validUserId = undefined;
      }
    }

    try {
      const vehicle = await this.prisma.vehicle.create({
        data: {
          licensePlate: trimmedPlate,
          assetCode: cleanAssetCode,
          modelId: model.modelId,
          manufactureYear: dto.manufactureYear || model.launchYear,
          color: dto.color,
          seats: dto.seats || model.seats,
          transmission: dto.transmission || model.transmission,
          fuelType: dto.fuelType || model.fuelType,
          listPricePerDay: new Prisma.Decimal(dto.listPricePerDay),
          depositAmount: new Prisma.Decimal(dto.depositAmount),
          dailyKmLimit: dto.dailyKmLimit,
          extraKmFee: dto.extraKmFee ? new Prisma.Decimal(dto.extraKmFee) : undefined,
          currentBranchId: validBranchId,
          notes: dto.notes,
          status: 'AVAILABLE',
          createdBy: validUserId,
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
        model: `${vehicle.model.brand.name} ${vehicle.model.name}`,
        status: vehicle.status,
        message: 'Thêm xe thành công',
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      if (err.code === 'P2002') {
        throw new BadRequestException('Thông tin xe bị trùng lặp (Biển số xe hoặc Mã tài sản đã tồn tại)');
      }
      if (err.code === 'P2003') {
        throw new BadRequestException('Dữ liệu liên kết không hợp lệ: Dòng xe, chi nhánh hoặc tài khoản người dùng không khớp trong cơ sở dữ liệu');
      }
      throw err;
    }
  }

  /**
   * Cập nhật thông tin chi tiết xe
   */
  async update(id: string, dto: UpdateVehicleDto) {
    const vehicleId = BigInt(id);

    const updateData: Prisma.VehicleUpdateInput = {};
    if (dto.licensePlate) updateData.licensePlate = dto.licensePlate.trim().toUpperCase();
    if (dto.assetCode !== undefined) {
      updateData.assetCode = dto.assetCode?.trim() ? dto.assetCode.trim() : null;
    }
    if (dto.modelId) updateData.model = { connect: { modelId: Number(dto.modelId) } };
    if (dto.manufactureYear !== undefined) updateData.manufactureYear = dto.manufactureYear;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.seats !== undefined) updateData.seats = dto.seats;
    if (dto.transmission) updateData.transmission = dto.transmission;
    if (dto.fuelType) updateData.fuelType = dto.fuelType;
    if (dto.listPricePerDay !== undefined) updateData.listPricePerDay = new Prisma.Decimal(dto.listPricePerDay);
    if (dto.depositAmount !== undefined) updateData.depositAmount = new Prisma.Decimal(dto.depositAmount);
    if (dto.dailyKmLimit !== undefined) updateData.dailyKmLimit = dto.dailyKmLimit;
    if (dto.extraKmFee !== undefined) updateData.extraKmFee = new Prisma.Decimal(dto.extraKmFee);
    if (dto.currentBranchId !== undefined) {
      updateData.currentBranch = dto.currentBranchId ? { connect: { branchId: Number(dto.currentBranchId) } } : { disconnect: true };
    }
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    try {
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
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('Thông tin cập nhật bị trùng lặp (Biển số xe hoặc Mã tài sản đã tồn tại)');
      }
      if (err.code === 'P2003') {
        throw new BadRequestException('Dữ liệu liên kết không hợp lệ: Dòng xe hoặc chi nhánh không tồn tại');
      }
      throw err;
    }
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

  /**
   * Quản lý dòng xe (Vehicle Models)
   */
  async getModels(brandId?: number, categoryId?: number, includeInactive = false, search?: string) {
    const where: Prisma.VehicleModelWhereInput = {};
    if (!includeInactive) where.isActive = true;
    if (brandId) where.brandId = Number(brandId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { variant: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.vehicleModel.findMany({
      where,
      include: {
        brand: true,
        category: true,
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            pricePlans: true,
          },
        },
      },
      orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async getModelById(id: number) {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { modelId: id },
      include: {
        brand: true,
        category: true,
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            pricePlans: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Không tìm thấy dòng xe với mã ID: ${id}`);
    }

    return model;
  }

  async createModel(dto: CreateModelDto) {
    const [brand, category] = await Promise.all([
      this.prisma.brand.findUnique({ where: { brandId: dto.brandId } }),
      this.prisma.vehicleCategory.findUnique({ where: { categoryId: dto.categoryId } }),
    ]);

    if (!brand) {
      throw new BadRequestException(`Không tìm thấy hãng xe với mã ID: ${dto.brandId}`);
    }
    if (!category) {
      throw new BadRequestException(`Không tìm thấy phân khúc xe với mã ID: ${dto.categoryId}`);
    }

    const existing = await this.prisma.vehicleModel.findFirst({
      where: {
        brandId: dto.brandId,
        name: dto.name,
        variant: dto.variant || '',
        transmission: dto.transmission,
        fuelType: dto.fuelType,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Dòng xe "${brand.name} ${dto.name} (${dto.variant || 'Tiêu chuẩn'})" đã tồn tại trong hệ thống`,
      );
    }

    return this.prisma.vehicleModel.create({
      data: {
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        name: dto.name,
        variant: dto.variant || '',
        seats: dto.seats,
        doors: dto.doors,
        transmission: dto.transmission,
        fuelType: dto.fuelType,
        engineCc: dto.engineCc,
        powerHp: dto.powerHp,
        fuelTankLiters: dto.fuelTankLiters ? new Prisma.Decimal(dto.fuelTankLiters) : null,
        batteryKwh: dto.batteryKwh ? new Prisma.Decimal(dto.batteryKwh) : null,
        evRangeKm: dto.evRangeKm,
        trunkLiters: dto.trunkLiters,
        fuelConsumptionL100km: dto.fuelConsumptionL100km
          ? new Prisma.Decimal(dto.fuelConsumptionL100km)
          : null,
        launchYear: dto.launchYear,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        brand: true,
        category: true,
      },
    });
  }

  async updateModel(id: number, dto: UpdateModelDto) {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { modelId: id },
    });

    if (!model) {
      throw new NotFoundException(`Không tìm thấy dòng xe với mã ID: ${id}`);
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { brandId: dto.brandId } });
      if (!brand) throw new BadRequestException(`Không tìm thấy hãng xe ID ${dto.brandId}`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.vehicleCategory.findUnique({
        where: { categoryId: dto.categoryId },
      });
      if (!category) throw new BadRequestException(`Không tìm thấy phân khúc xe ID ${dto.categoryId}`);
    }

    return this.prisma.vehicleModel.update({
      where: { modelId: id },
      data: {
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        name: dto.name,
        variant: dto.variant !== undefined ? dto.variant : undefined,
        seats: dto.seats,
        doors: dto.doors !== undefined ? dto.doors : undefined,
        transmission: dto.transmission,
        fuelType: dto.fuelType,
        engineCc: dto.engineCc !== undefined ? dto.engineCc : undefined,
        powerHp: dto.powerHp !== undefined ? dto.powerHp : undefined,
        fuelTankLiters:
          dto.fuelTankLiters !== undefined
            ? dto.fuelTankLiters
              ? new Prisma.Decimal(dto.fuelTankLiters)
              : null
            : undefined,
        batteryKwh:
          dto.batteryKwh !== undefined
            ? dto.batteryKwh
              ? new Prisma.Decimal(dto.batteryKwh)
              : null
            : undefined,
        evRangeKm: dto.evRangeKm !== undefined ? dto.evRangeKm : undefined,
        trunkLiters: dto.trunkLiters !== undefined ? dto.trunkLiters : undefined,
        fuelConsumptionL100km:
          dto.fuelConsumptionL100km !== undefined
            ? dto.fuelConsumptionL100km
              ? new Prisma.Decimal(dto.fuelConsumptionL100km)
              : null
            : undefined,
        launchYear: dto.launchYear !== undefined ? dto.launchYear : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
      include: {
        brand: true,
        category: true,
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            pricePlans: true,
          },
        },
      },
    });
  }

  async deleteModel(id: number) {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { modelId: id },
      include: {
        _count: {
          select: {
            vehicles: true, // Bao gồm cả xe đã xóa mềm để tránh vi phạm khóa ngoại
            pricePlans: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Không tìm thấy dòng xe với mã ID: ${id}`);
    }

    if (model._count.vehicles > 0 || model._count.pricePlans > 0) {
      await this.prisma.vehicleModel.update({
        where: { modelId: id },
        data: { isActive: false },
      });
      return {
        success: true,
        action: 'DEACTIVATED',
        message: `Dòng xe đang có ${model._count.vehicles} xe và ${model._count.pricePlans} bảng giá liên kết. Hệ thống đã chuyển sang trạng thái "Ngưng hoạt động".`,
      };
    }

    try {
      await this.prisma.vehicleModel.delete({
        where: { modelId: id },
      });

      return {
        success: true,
        action: 'DELETED',
        message: 'Đã xóa hoàn toàn dòng xe khỏi hệ thống.',
      };
    } catch {
      await this.prisma.vehicleModel.update({
        where: { modelId: id },
        data: { isActive: false },
      });
      return {
        success: true,
        action: 'DEACTIVATED',
        message: 'Dòng xe có dữ liệu liên kết nên hệ thống đã chuyển sang trạng thái "Ngưng hoạt động".',
      };
    }
  }

  /**
   * Xóa xe (Soft delete)
   */
  async delete(id: string) {
    const vehicleId = BigInt(id);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
    });
    if (!vehicle || vehicle.deletedAt) {
      throw new NotFoundException(`Không tìm thấy xe với ID: ${id}`);
    }

    await this.prisma.vehicle.update({
      where: { vehicleId },
      data: {
        deletedAt: new Date(),
        status: 'SUSPENDED',
      },
    });

    return { success: true, message: 'Đã xóa xe khỏi đội xe thành công' };
  }
}
