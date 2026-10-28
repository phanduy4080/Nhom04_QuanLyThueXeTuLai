import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrgService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách chi nhánh (hỗ trợ lọc tìm kiếm và trạng thái ngưng hoạt động)
   */
  async getBranches(includeInactive = false, search?: string, province?: string) {
    const where: Prisma.BranchWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (province) {
      where.province = { contains: province, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { addressLine: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.branch.findMany({
      where,
      include: {
        branchHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            bookingsPickup: true,
          },
        },
      },
      orderBy: [{ province: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Lấy chi tiết chi nhánh theo ID
   */
  async getBranchById(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { branchId: id },
      include: {
        branchHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            bookingsPickup: true,
            bookingsReturn: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với mã ID: ${id}`);
    }

    return branch;
  }

  /**
   * Thêm chi nhánh / trạm xe mới
   */
  async createBranch(dto: CreateBranchDto) {
    const cleanCode = dto.code.trim().toUpperCase();

    const existing = await this.prisma.branch.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      throw new ConflictException(`Mã chi nhánh "${cleanCode}" đã tồn tại trong hệ thống`);
    }

    const branch = await this.prisma.branch.create({
      data: {
        code: cleanCode,
        name: dto.name.trim(),
        addressLine: dto.addressLine.trim(),
        ward: dto.ward?.trim() || null,
        district: dto.district?.trim() || null,
        province: dto.province.trim(),
        latitude: dto.latitude ? new Prisma.Decimal(dto.latitude) : null,
        longitude: dto.longitude ? new Prisma.Decimal(dto.longitude) : null,
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim() || null,
        isPickupPoint: dto.isPickupPoint !== undefined ? dto.isPickupPoint : true,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        branchHours: {
          create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
            dayOfWeek: day,
            openTime: dto.openTime || '07:00',
            closeTime: dto.closeTime || '21:00',
            isClosed: false,
          })),
        },
      },
      include: {
        branchHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            bookingsPickup: true,
          },
        },
      },
    });

    return branch;
  }

  /**
   * Cập nhật thông tin chi nhánh / trạm xe
   */
  async updateBranch(id: number, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { branchId: id },
    });

    if (!branch) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với mã ID: ${id}`);
    }

    if (dto.code) {
      const cleanCode = dto.code.trim().toUpperCase();
      if (cleanCode !== branch.code) {
        const existing = await this.prisma.branch.findUnique({
          where: { code: cleanCode },
        });
        if (existing) {
          throw new ConflictException(`Mã chi nhánh "${cleanCode}" đã được sử dụng`);
        }
      }
    }

    if (dto.openTime || dto.closeTime) {
      for (let day = 0; day <= 6; day++) {
        await this.prisma.branchHour.upsert({
          where: { branchId_dayOfWeek: { branchId: id, dayOfWeek: day } },
          create: {
            branchId: id,
            dayOfWeek: day,
            openTime: dto.openTime || '07:00',
            closeTime: dto.closeTime || '21:00',
            isClosed: false,
          },
          update: {
            openTime: dto.openTime !== undefined ? dto.openTime : undefined,
            closeTime: dto.closeTime !== undefined ? dto.closeTime : undefined,
          },
        });
      }
    }

    return this.prisma.branch.update({
      where: { branchId: id },
      data: {
        code: dto.code ? dto.code.trim().toUpperCase() : undefined,
        name: dto.name ? dto.name.trim() : undefined,
        addressLine: dto.addressLine ? dto.addressLine.trim() : undefined,
        ward: dto.ward !== undefined ? (dto.ward?.trim() || null) : undefined,
        district: dto.district !== undefined ? (dto.district?.trim() || null) : undefined,
        province: dto.province ? dto.province.trim() : undefined,
        latitude: dto.latitude !== undefined ? (dto.latitude ? new Prisma.Decimal(dto.latitude) : null) : undefined,
        longitude: dto.longitude !== undefined ? (dto.longitude ? new Prisma.Decimal(dto.longitude) : null) : undefined,
        phone: dto.phone !== undefined ? (dto.phone?.trim() || null) : undefined,
        email: dto.email !== undefined ? (dto.email?.trim() || null) : undefined,
        isPickupPoint: dto.isPickupPoint !== undefined ? dto.isPickupPoint : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
      include: {
        branchHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            bookingsPickup: true,
          },
        },
      },
    });
  }

  /**
   * Xóa hoặc ngưng hoạt động chi nhánh / trạm xe
   */
  async deleteBranch(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { branchId: id },
      include: {
        _count: {
          select: {
            vehicles: { where: { deletedAt: null } },
            bookingsPickup: true,
            bookingsReturn: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với mã ID: ${id}`);
    }

    if (
      branch._count.vehicles > 0 ||
      branch._count.bookingsPickup > 0 ||
      branch._count.bookingsReturn > 0
    ) {
      await this.prisma.branch.update({
        where: { branchId: id },
        data: { isActive: false },
      });
      return {
        success: true,
        action: 'DEACTIVATED',
        message: `Chi nhánh đang có ${branch._count.vehicles} xe và ${branch._count.bookingsPickup + branch._count.bookingsReturn} lịch đặt xe liên kết. Hệ thống đã chuyển sang trạng thái "Ngưng hoạt động".`,
      };
    }

    await this.prisma.branch.delete({
      where: { branchId: id },
    });

    return {
      success: true,
      action: 'DELETED',
      message: 'Đã xóa hoàn toàn chi nhánh khỏi hệ thống.',
    };
  }
}
