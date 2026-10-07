import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo đơn đặt xe mới (Khách hàng tạo đơn & đặt cọc)
   */
  async createBooking(dto: CreateBookingDto, userId?: number | bigint) {
    const vehicleId = BigInt(dto.vehicleId);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        model: {
          include: { brand: true, category: true },
        },
        currentBranch: true,
      },
    });

    if (!vehicle || !vehicle.isActive || vehicle.deletedAt) {
      throw new NotFoundException('Phương tiện không tồn tại hoặc đã ngừng hoạt động');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
    }

    if (end <= start) {
      throw new BadRequestException('Ngày trả xe phải sau ngày nhận xe');
    }

    // US-05: Kiểm tra xe có bị trùng lịch hoặc đang sửa chữa/bảo dưỡng không
    if (['MAINTENANCE', 'REPAIRING', 'SUSPENDED'].includes(vehicle.status)) {
      throw new BadRequestException('Xe đang trong thời gian bảo dưỡng / sửa chữa, không thể đặt xe');
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_RENTAL'] },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Phương tiện đã có lịch đặt xe trong khoảng thời gian bạn chọn');
    }

    // Tính số ngày và tổng tiền
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dailyPrice = Number(vehicle.listPricePerDay);
    const totalAmount = dailyPrice * totalDays;
    const depositAmount = Number(vehicle.depositAmount);

    // Sinh mã đơn tự động
    const datePart = new Date().toISOString().slice(2, 7).replace('-', '');
    const randPart = Math.floor(100000 + Math.random() * 900000);
    const bookingCode = `DH-${datePart}-${randPart}`;

    const pickupBranchId = dto.pickupBranchId || vehicle.currentBranchId || 1;
    const returnBranchId = dto.returnBranchId || pickupBranchId;

    const booking = await this.prisma.booking.create({
      data: {
        bookingCode,
        userId: userId ? BigInt(userId) : null,
        customerName: dto.customerName,
        phone: dto.phone,
        email: dto.email,
        idNumber: dto.idNumber || null,
        licenseNumber: dto.licenseNumber || null,
        vehicleId,
        pickupBranchId,
        returnBranchId,
        startDate: start,
        endDate: end,
        totalDays,
        dailyPrice: new Prisma.Decimal(dailyPrice),
        totalAmount: new Prisma.Decimal(totalAmount),
        depositAmount: new Prisma.Decimal(depositAmount),
        status: 'PENDING',
        paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
        paymentStatus: 'PAID_DEPOSIT',
        notes: dto.notes || null,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    // Tạo block lịch giữ xe
    try {
      await this.prisma.vehicleAvailabilityBlock.create({
        data: {
          vehicleId,
          blockType: 'BOOKING',
          refType: 'BOOKING',
          refId: BigInt(booking.bookingId),
          holdExpiresAt: end,
          note: `Đơn đặt cọc ${bookingCode} của khách hàng ${dto.customerName}`,
        },
      });
    } catch (e) {
      console.warn('Could not create availability block record:', e);
    }

    return this.formatBooking(booking);
  }

  /**
   * Danh sách đơn đặt xe (Dành cho Admin / Staff quản trị & duyệt cọc)
   */
  async findAll(query: QueryBookingsDto) {
    const { status, branchId, search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (branchId) {
      where.pickupBranchId = branchId;
    }

    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            include: {
              model: { include: { brand: true, category: true } },
              images: { include: { file: true } },
            },
          },
          pickupBranch: true,
          returnBranch: true,
        },
      }),
    ]);

    return {
      data: items.map((b) => this.formatBooking(b)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Xem chi tiết 1 đơn đặt xe theo ID hoặc BookingCode
   */
  async findOne(idOrCode: string | number) {
    let where: Prisma.BookingWhereInput = {};

    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    return this.formatBooking(booking);
  }

  /**
   * Cập nhật trạng thái đơn đặt xe (Duyệt cọc, Giao xe, Hoàn tất, Hủy)
   */
  async updateStatus(id: number, dto: UpdateBookingStatusDto, staffUserId?: number | bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    const updated = await this.prisma.booking.update({
      where: { bookingId: id },
      data: {
        status: dto.status,
        notes: dto.notes ? `${booking.notes || ''}\n[${new Date().toISOString()}] ${dto.notes}` : booking.notes,
        approvedBy: staffUserId ? BigInt(staffUserId) : booking.approvedBy,
        approvedAt: dto.status === 'CONFIRMED' ? new Date() : booking.approvedAt,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    // Cập nhật trạng thái xe tương ứng
    if (dto.status === 'CONFIRMED') {
      await this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'BOOKED' },
      });
    } else if (dto.status === 'IN_RENTAL') {
      await this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'RENTED' },
      });
    } else if (dto.status === 'COMPLETED' || dto.status === 'CANCELLED') {
      await this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.formatBooking(updated);
  }

  /**
   * Đơn đặt xe của tôi (Dành cho khách hàng)
   */
  async getMyBookings(userId?: number | bigint, email?: string, phone?: string) {
    const where: Prisma.BookingWhereInput = {
      OR: [],
    };

    if (userId) {
      where.OR?.push({ userId: BigInt(userId) });
    }
    if (email) {
      where.OR?.push({ email });
    }
    if (phone) {
      where.OR?.push({ phone });
    }

    if (!where.OR?.length) {
      return [];
    }

    const items = await this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    return items.map((b) => this.formatBooking(b));
  }

  /**
   * KPI Dashboard Thống Kê
   */
  async getDashboardStats() {
    const [
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      revenueResult,
    ] = await Promise.all([
      this.prisma.vehicle.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.vehicle.count({ where: { status: 'AVAILABLE', isActive: true, deletedAt: null } }),
      this.prisma.vehicle.count({ where: { status: 'RENTED', isActive: true, deletedAt: null } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['CONFIRMED', 'IN_RENTAL', 'COMPLETED'] } },
      }),
    ]);

    return {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
    };
  }

  private formatBooking(b: any) {
    const vehicleName = b.vehicle?.model
      ? `${b.vehicle.model.brand?.name || ''} ${b.vehicle.model.name || ''} ${b.vehicle.model.variant || ''}`.trim()
      : 'Xe Ô Tô';

    let thumbnail = '';
    const images: string[] = [];
    if (b.vehicle?.images && b.vehicle.images.length > 0) {
      for (const img of b.vehicle.images) {
        if (img.file?.publicUrl) {
          images.push(img.file.publicUrl);
        }
      }
    }
    thumbnail = images[0] || '';

    return {
      id: b.bookingId,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      phone: b.phone,
      email: b.email,
      idNumber: b.idNumber,
      licenseNumber: b.licenseNumber,
      carId: Number(b.vehicleId),
      carName: vehicleName,
      licensePlate: b.vehicle?.licensePlate || '',
      thumbnail,
      images,
      pickupBranch: b.pickupBranch?.name || 'Chi nhánh Sân bay',
      returnBranch: b.returnBranch?.name || 'Chi nhánh Sân bay',
      startDate: b.startDate ? b.startDate.toISOString() : '',
      endDate: b.endDate ? b.endDate.toISOString() : '',
      totalDays: b.totalDays,
      dailyPrice: Number(b.dailyPrice),
      totalAmount: Number(b.totalAmount),
      depositAmount: Number(b.depositAmount),
      insuranceFee: Number(b.insuranceFee),
      status: b.status,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      notes: b.notes,
      approvedAt: b.approvedAt ? b.approvedAt.toISOString() : null,
      createdAt: b.createdAt ? b.createdAt.toISOString() : '',
    };
  }
}
