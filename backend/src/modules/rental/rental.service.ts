import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { QueryHandoversDto } from './dto/query-handovers.dto';

@Injectable()
export class RentalService {
  private readonly logger = new Logger(RentalService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách Biên bản bàn giao xe (Check-in / Check-out)
   */
  async getHandoverRecords(query?: QueryHandoversDto) {
    const where: any = {};
    if (query?.type && query.type !== 'ALL') {
      where.type = query.type;
    }
    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query?.bookingCode) {
      where.booking = { bookingCode: query.bookingCode };
    }

    const items = await this.prisma.handoverRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            vehicle: {
              include: {
                model: { include: { brand: true, category: true } },
                currentBranch: true,
              },
            },
            pickupBranch: true,
            returnBranch: true,
          },
        },
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            currentBranch: true,
          },
        },
      },
    });

    return items.map((r) => this.formatHandoverRecord(r));
  }

  /**
   * Lấy chi tiết một Biên bản bàn giao xe theo ID hoặc Mã biên bản
   */
  async getHandoverByIdOrCode(idOrCode: string | number) {
    let where: any = {};
    const parsedId = Number(idOrCode);
    if (!isNaN(parsedId)) {
      where = { handoverId: parsedId };
    } else {
      where = { handoverCode: String(idOrCode) };
    }

    const item = await this.prisma.handoverRecord.findFirst({
      where,
      include: {
        booking: {
          include: {
            vehicle: {
              include: {
                model: { include: { brand: true, category: true } },
                currentBranch: true,
              },
            },
            pickupBranch: true,
            returnBranch: true,
          },
        },
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            currentBranch: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy biên bản bàn giao xe với mã: ${idOrCode}`);
    }

    return this.formatHandoverRecord(item);
  }

  /**
   * Lấy biên bản bàn giao xe gắn với một đơn đặt xe (Booking)
   */
  async getHandoverByBooking(bookingIdOrCode: string | number) {
    let bookingWhere: any = {};
    const parsedBookingId = Number(bookingIdOrCode);
    if (!isNaN(parsedBookingId)) {
      bookingWhere = { bookingId: parsedBookingId };
    } else {
      bookingWhere = { bookingCode: String(bookingIdOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      select: { bookingId: true },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt xe: ${bookingIdOrCode}`);
    }

    const item = await this.prisma.handoverRecord.findFirst({
      where: { bookingId: booking.bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            vehicle: {
              include: {
                model: { include: { brand: true, category: true } },
                currentBranch: true,
              },
            },
            pickupBranch: true,
            returnBranch: true,
          },
        },
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            currentBranch: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    return this.formatHandoverRecord(item);
  }

  /**
   * US-13, US-14, US-15: Lập Biên bản bàn giao xe
   * - US-13: Kiểm tra ODO, mức nhiên liệu, checklist nội/ngoại thất, ghi nhận hư hỏng cũ kèm ảnh chụp
   * - US-14: Lập Biên bản bàn giao xe liên kết với hợp đồng tương ứng
   * - US-15: Tự động chuyển trạng thái xe sang 'RENTED' khi hoàn tất giao xe
   */
  async createHandover(dto: CreateHandoverDto, staffId?: string | number) {
    // 1. Tìm đơn đặt xe tương ứng
    let bookingWhere: any = {};
    const parsedBookingId = Number(dto.bookingId);
    if (!isNaN(parsedBookingId)) {
      bookingWhere = { bookingId: parsedBookingId };
    } else {
      bookingWhere = { bookingCode: String(dto.bookingId) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            currentBranch: true,
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt xe với thông tin: ${dto.bookingId}`);
    }

    // Kiểm tra xe có sẵn để bàn giao hay không
    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
      throw new BadRequestException(`Không thể bàn giao xe cho đơn hàng đã bị hủy hoặc từ chối (${booking.status})`);
    }

    // 2. US-14: Đảm bảo mã hợp đồng liên kết tương ứng
    const now = new Date();
    const yyMM = now.toISOString().slice(2, 7).replace('-', '');
    const contractNumber = booking.contractNumber || `HD-${yyMM}-${booking.bookingCode}`;

    // Tạo mã biên bản bàn giao: BBBG-YYMM-BOOKING_CODE
    const handoverCode = `BBBG-${yyMM}-${booking.bookingCode}`;

    // 3. US-13: Đóng gói toàn bộ thông tin kiểm tra kỹ thuật, phụ kiện, hư hỏng cũ & ảnh chụp
    const structuredCondition = {
      summary: dto.carCondition || 'Phương tiện đã được kiểm tra kỹ thuật toàn diện và bàn giao nguyên trạng.',
      checklist: dto.checklist || {
        exterior: {
          bodyClean: true,
          lightsOk: true,
          mirrorsOk: true,
          tiresOk: true,
          windshieldOk: true,
        },
        interior: {
          seatsClean: true,
          steeringWheelOk: true,
          acOk: true,
          odorFree: true,
          matsOk: true,
        },
        accessories: {
          registrationDoc: true,
          insuranceCert: true,
          spareTire: true,
          toolKit: true,
          dashcam: true,
        },
      },
      damages: dto.damages || [],
      photos: dto.photos || [],
      signatures: dto.signatures || {
        staffSignature: dto.staffName || 'Đại diện QuickHatch',
        customerSignature: booking.customerName,
      },
      staffName: dto.staffName || 'Nhân viên phụ trách trạm',
      contractNumber,
      notes: dto.notes || '',
      signedAt: now.toISOString(),
    };

    // Kiểm tra nhân viên hợp lệ (nếu có staffId)
    let validStaffId: bigint | null = null;
    if (staffId) {
      try {
        const staffCandidate = BigInt(staffId);
        const userExists = await this.prisma.user.findUnique({
          where: { userId: staffCandidate },
          select: { userId: true },
        });
        if (userExists) validStaffId = staffCandidate;
      } catch {
        validStaffId = null;
      }
    }

    // 4. US-13, US-14, US-15: Chạy Transaction đảm bảo tính toàn vẹn dữ liệu
    const result = await this.prisma.$transaction(async (tx) => {
      // 4.1. Tạo hoặc cập nhật Biên bản bàn giao xe (rental.handover_records)
      const existing = await tx.handoverRecord.findFirst({
        where: {
          bookingId: booking.bookingId,
          type: dto.type || 'CHECKOUT',
        },
      });

      let record;
      if (existing) {
        record = await tx.handoverRecord.update({
          where: { handoverId: existing.handoverId },
          data: {
            odoMeter: dto.odoMeter,
            fuelLevel: dto.fuelLevel,
            carCondition: JSON.stringify(structuredCondition),
            status: 'COMPLETED',
            signedAt: now,
          },
        });
      } else {
        record = await tx.handoverRecord.create({
          data: {
            handoverCode,
            bookingId: booking.bookingId,
            vehicleId: booking.vehicleId,
            staffId: validStaffId,
            type: dto.type || 'CHECKOUT',
            odoMeter: dto.odoMeter,
            fuelLevel: dto.fuelLevel,
            carCondition: JSON.stringify(structuredCondition),
            status: 'COMPLETED',
            signedAt: now,
          },
        });
      }

      // 4.2. US-15: TỰ ĐỘNG CHUYỂN TRẠNG THÁI XE SANG 'RENTED' (Đang cho thuê) & Cập nhật số ODO
      await tx.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: {
          status: 'RENTED',
          odometerKm: dto.odoMeter,
          statusChangedAt: now,
        },
      });

      // 4.3. Ghi nhận lịch sử trạng thái xe (fleet.vehicle_status_history)
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: booking.vehicleId,
          fromStatus: booking.vehicle.status,
          toStatus: 'RENTED',
          reason: `Hoàn tất bàn giao xe thực tế cho khách (${booking.customerName}) theo hợp đồng ${contractNumber}, đơn ${booking.bookingCode}. ODO: ${dto.odoMeter} km, mức nhiên liệu: ${dto.fuelLevel}.`,
          changedBy: validStaffId,
        },
      });

      // 4.4. Tự động chuyển trạng thái đơn đặt xe sang 'IN_RENTAL' và cập nhật mã hợp đồng nếu chưa có
      await tx.booking.update({
        where: { bookingId: booking.bookingId },
        data: {
          status: 'IN_RENTAL',
          contractNumber,
          contractSignedAt: booking.contractSignedAt || now,
        },
      });

      return record;
    });

    this.logger.log(
      `Đã lập Biên bản bàn giao ${result.handoverCode} cho đơn ${booking.bookingCode}. Xe ${booking.vehicle.licensePlate} tự động chuyển sang trạng thái RENTED.`,
    );

    return this.getHandoverByIdOrCode(result.handoverId);
  }

  /**
   * Helper: Chuẩn hóa dữ liệu trả về cho Frontend
   */
  private formatHandoverRecord(record: any) {
    let parsedCondition: any = {
      summary: record.carCondition || '',
      checklist: {
        exterior: { bodyClean: true, lightsOk: true, mirrorsOk: true, tiresOk: true, windshieldOk: true },
        interior: { seatsClean: true, steeringWheelOk: true, acOk: true, odorFree: true, matsOk: true },
        accessories: { registrationDoc: true, insuranceCert: true, spareTire: true, toolKit: true, dashcam: true },
      },
      damages: [],
      photos: [],
      signatures: {},
      staffName: 'Nhân viên trạm',
      contractNumber: record.booking?.contractNumber || `HD-${record.booking?.bookingCode}`,
      notes: '',
    };

    if (record.carCondition) {
      try {
        if (record.carCondition.startsWith('{')) {
          parsedCondition = { ...parsedCondition, ...JSON.parse(record.carCondition) };
        } else {
          parsedCondition.summary = record.carCondition;
        }
      } catch {
        parsedCondition.summary = record.carCondition;
      }
    }

    const vehicle = record.vehicle || record.booking?.vehicle;
    const booking = record.booking;

    return {
      id: record.handoverId,
      handoverCode: record.handoverCode,
      bookingId: record.bookingId,
      bookingCode: booking?.bookingCode || 'DH-0000',
      contractNumber: parsedCondition.contractNumber || booking?.contractNumber || `HD-${booking?.bookingCode}`,
      customerName: booking?.customerName || 'Khách hàng',
      customerPhone: booking?.phone || '',
      customerIdNumber: booking?.idNumber || '',
      customerLicenseNumber: booking?.licenseNumber || '',
      hasAdditionalDriver: booking?.hasAdditionalDriver || false,
      additionalDriverName: booking?.additionalDriverName || null,
      additionalDriverPhone: booking?.additionalDriverPhone || null,
      additionalDriverIdNumber: booking?.additionalDriverIdNumber || null,
      additionalDriverLicenseNumber: booking?.additionalDriverLicenseNumber || null,
      vehicleId: record.vehicleId.toString(),
      carName: vehicle?.model
        ? `${vehicle.model.brand?.name || ''} ${vehicle.model.name || ''} ${vehicle.model.variant || ''}`.trim()
        : 'Xe Ô Tô',
      brand: vehicle?.model?.brand?.name || '',
      model: vehicle?.model?.name || '',
      licensePlate: vehicle?.licensePlate || '',
      color: vehicle?.color || 'Trắng',
      seats: vehicle?.seats || vehicle?.model?.seats || 5,
      type: record.type,
      odoMeter: record.odoMeter,
      fuelLevel: record.fuelLevel,
      status: record.status,
      signedAt: record.signedAt ? record.signedAt.toISOString() : record.createdAt.toISOString(),
      createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString(),
      pickupBranch: booking?.pickupBranch?.name || vehicle?.currentBranch?.name || 'Chi nhánh sân bay Tân Sơn Nhất',
      returnBranch: booking?.returnBranch?.name || 'Chi nhánh sân bay Tân Sơn Nhất',
      rentalPeriod: {
        startDate: booking?.startDate ? booking.startDate.toISOString() : null,
        endDate: booking?.endDate ? booking.endDate.toISOString() : null,
        totalDays: booking?.totalDays || 1,
      },
      conditionSummary: parsedCondition.summary,
      checklist: parsedCondition.checklist,
      damages: parsedCondition.damages || [],
      photos: parsedCondition.photos || [],
      signatures: parsedCondition.signatures || {},
      staffName: parsedCondition.staffName || 'Nhân viên phụ trách trạm',
      notes: parsedCondition.notes || '',
    };
  }
}
