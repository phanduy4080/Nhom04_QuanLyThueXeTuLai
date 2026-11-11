import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { QueryHandoversDto } from './dto/query-handovers.dto';
import { CreateReturnHandoverDto } from './dto/create-return-handover.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';

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
   * US-20 & US-22: Đối chiếu số km, mức nhiên liệu và tự động tính toán phí vi phạm (quá km, trễ giờ, thiếu nhiên liệu, vệ sinh)
   */
  async calculateReturnInspection(dto: CreateReturnHandoverDto) {
    let bookingWhere: any = {};
    if (!isNaN(Number(dto.bookingId))) {
      bookingWhere = { bookingId: Number(dto.bookingId) };
    } else {
      bookingWhere = { bookingCode: String(dto.bookingId) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
          },
        },
        handovers: {
          where: { type: 'CHECKOUT' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt xe: ${dto.bookingId}`);
    }

    const checkoutRecord = booking.handovers[0];
    const checkoutOdo = checkoutRecord ? checkoutRecord.odoMeter : Number(booking.vehicle.odometerKm || 0);

    // 1. Quá km
    const kmDriven = Math.max(0, dto.returnOdo - checkoutOdo);
    const dailyLimit = booking.vehicle.dailyKmLimit || 350;
    const allowedKm = (booking.totalDays || 1) * dailyLimit;
    const excessKm = Math.max(0, kmDriven - allowedKm);
    const extraKmRate = Number(booking.vehicle.extraKmFee || 5000);
    const excessKmFee = excessKm * extraKmRate;

    // 2. Trả trễ
    const returnDate = dto.actualReturnTime ? new Date(dto.actualReturnTime) : new Date();
    const scheduledEndDate = new Date(booking.endDate);
    const diffHours = Math.floor((returnDate.getTime() - scheduledEndDate.getTime()) / (1000 * 60 * 60));
    const lateHours = Math.max(0, diffHours);
    let lateFee = 0;
    if (lateHours > 0) {
      if (lateHours >= 6) {
        lateFee = Number(booking.dailyPrice);
      } else {
        lateFee = lateHours * 100000;
      }
    }

    // 3. Thiếu nhiên liệu / pin
    const returnFuel = Math.min(100, Math.max(0, dto.returnFuelPercent));
    let checkoutFuel = 100;
    if (checkoutRecord && checkoutRecord.fuelLevel) {
      const parsed = parseInt(checkoutRecord.fuelLevel.replace(/\D/g, ''), 10);
      if (!isNaN(parsed)) checkoutFuel = parsed;
    }
    const fuelShortagePercent = Math.max(0, checkoutFuel - returnFuel);
    const fuelShortageFee = fuelShortagePercent > 5 ? Math.round((fuelShortagePercent / 100) * 800000 + 50000) : 0;

    // 4. Vệ sinh nội thất
    const cleaningFee = dto.isInteriorDirty ? 300000 : 0;

    // 5. Hư hỏng mới
    const newDamagesFee = Number(dto.newDamagesFee || 0);

    const totalPenaltyFee = excessKmFee + lateFee + fuelShortageFee + cleaningFee + newDamagesFee;

    return {
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      carName: `${booking.vehicle.model?.brand?.name || ''} ${booking.vehicle.model?.name || ''}`.trim(),
      licensePlate: booking.vehicle.licensePlate,
      checkoutOdo,
      returnOdo: dto.returnOdo,
      kmDriven,
      allowedKm,
      dailyLimit,
      excessKm,
      extraKmRate,
      excessKmFee,
      scheduledEndDate: scheduledEndDate.toISOString(),
      actualReturnTime: returnDate.toISOString(),
      lateHours,
      lateFee,
      checkoutFuel,
      returnFuelPercent: returnFuel,
      fuelShortagePercent,
      fuelShortageFee,
      isInteriorDirty: Boolean(dto.isInteriorDirty),
      cleaningFee,
      newDamages: dto.newDamages || '',
      newDamagesFee,
      totalPenaltyFee,
      depositAmount: Number(booking.depositAmount || 0),
      isDisputed: Boolean(dto.isDisputed),
      disputeReason: dto.disputeReason || '',
    };
  }

  /**
   * US-20, US-21, US-22, US-23: Lập Biên bản hoàn trả xe & ghi nhận tình trạng xe khi trả
   * - US-20: Đối chiếu số km, mức nhiên liệu, hư hỏng mới
   * - US-21: Lập Biên bản hoàn trả xe (CHECKIN)
   * - US-22: Tự động lưu các khoản phạt vi phạm
   * - US-23: Chuyển sang quy trình thẩm định thiệt hại & tranh chấp nếu phát sinh hư hỏng lớn
   * - US-26: Tự động chuyển xe sang trạng thái INSPECTING (vệ sinh / kiểm tra kỹ thuật)
   */
  async createReturnHandover(dto: CreateReturnHandoverDto, staffId?: string | number) {
    const preview = await this.calculateReturnInspection(dto);

    let bookingWhere: any = {};
    if (!isNaN(Number(dto.bookingId))) {
      bookingWhere = { bookingId: Number(dto.bookingId) };
    } else {
      bookingWhere = { bookingCode: String(dto.bookingId) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      include: {
        vehicle: true,
        handovers: { where: { type: 'CHECKOUT' }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt xe: ${dto.bookingId}`);
    }

    const checkoutRecord = booking.handovers[0];
    const now = new Date();
    const yyMM = now.toISOString().slice(2, 7).replace('-', '');
    const handoverCode = `BBTR-${yyMM}-${booking.bookingCode}`;

    let validStaffId: bigint | null = null;
    if (staffId) {
      try {
        const u = await this.prisma.user.findUnique({ where: { userId: BigInt(staffId) } });
        if (u) validStaffId = u.userId;
      } catch {}
    }

    const conditionData = {
      summary: dto.carCondition || 'Phương tiện đã được hoàn trả và đối chiếu tình trạng thực tế.',
      excessKm: preview.excessKm,
      excessKmFee: preview.excessKmFee,
      lateHours: preview.lateHours,
      lateFee: preview.lateFee,
      fuelShortagePercent: preview.fuelShortagePercent,
      fuelShortageFee: preview.fuelShortageFee,
      cleaningFee: preview.cleaningFee,
      newDamages: dto.newDamages || '',
      newDamagesFee: preview.newDamagesFee,
      totalPenaltyFee: preview.totalPenaltyFee,
      isDisputed: Boolean(dto.isDisputed),
      disputeReason: dto.disputeReason || '',
      photos: dto.inspectionPhotos || [],
      staffName: dto.staffName || 'Nhân viên trạm nhận xe',
      customerSignature: booking.customerName,
      signedAt: now.toISOString(),
    };

    const record = await this.prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi hoàn trả xe (CHECKIN)
      const checkin = await tx.handoverRecord.create({
        data: {
          handoverCode,
          bookingId: booking.bookingId,
          vehicleId: booking.vehicleId,
          staffId: validStaffId,
          type: 'CHECKIN',
          odoMeter: dto.returnOdo,
          fuelLevel: `${dto.returnFuelPercent}%`,
          carCondition: JSON.stringify(conditionData),
          checkoutId: checkoutRecord?.handoverId || null,
          actualReturnTime: dto.actualReturnTime ? new Date(dto.actualReturnTime) : now,
          excessKm: preview.excessKm,
          excessKmFee: preview.excessKmFee,
          lateHours: preview.lateHours,
          lateFee: preview.lateFee,
          fuelShortageFee: preview.fuelShortageFee,
          cleaningFee: preview.cleaningFee,
          newDamages: dto.newDamages || null,
          newDamagesFee: preview.newDamagesFee,
          totalPenaltyFee: preview.totalPenaltyFee,
          isDisputed: Boolean(dto.isDisputed),
          disputeReason: dto.disputeReason || null,
          inspectionPhotos: dto.inspectionPhotos || [],
          status: 'COMPLETED',
          signedAt: now,
        },
      });

      // 2. US-26: Cập nhật trạng thái xe sang 'INSPECTING' (Chờ vệ sinh / kiểm tra kỹ thuật trước khi sẵn sàng)
      await tx.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: {
          odometerKm: dto.returnOdo,
          fuelLevelPercent: dto.returnFuelPercent,
          status: 'INSPECTING',
          statusChangedAt: now,
        },
      });

      // 3. Ghi log trạng thái xe
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: booking.vehicleId,
          fromStatus: 'RENTED',
          toStatus: 'INSPECTING',
          reason: `Khách hoàn trả xe (${booking.bookingCode}). ODO mới: ${dto.returnOdo} km. Xe chuyển sang trạng thái chờ vệ sinh & kiểm tra kỹ thuật.`,
          changedBy: validStaffId,
        },
      });

      // 4. US-23: Nếu có tranh chấp hoặc hư hỏng lớn, tự động tạo hồ sơ sự cố (incident)
      if (dto.isDisputed || preview.newDamagesFee >= 2000000) {
        const incidentCode = `INC-${yyMM}-${Math.floor(100000 + Math.random() * 900000)}`;
        await tx.incident.create({
          data: {
            incidentCode,
            bookingId: booking.bookingId,
            vehicleId: booking.vehicleId,
            incidentType: 'ACCIDENT',
            status: 'DISPUTED',
            title: `Tranh chấp bồi thường hư hỏng khi hoàn trả xe (${booking.bookingCode})`,
            description: dto.disputeReason || dto.newDamages || 'Khách hàng và nhân viên chưa đồng thuận về chi phí bồi thường hư hỏng.',
            location: 'Trạm nhận xe',
            contactPhone: booking.phone,
            evidencePhotos: dto.inspectionPhotos || [],
            totalDamageCost: preview.newDamagesFee,
            customerShareAmount: preview.newDamagesFee,
            liabilityParty: 'CUSTOMER',
            liabilityNotes: 'Phát sinh khi kiểm tra hoàn trả xe (Check-in). Chuyển sang quy trình thẩm định chuyên sâu.',
            reportedByName: dto.staffName || 'Nhân viên trạm',
            reportedByPhone: booking.phone,
          },
        });
      }

      return checkin;
    });

    return this.getHandoverByIdOrCode(record.handoverId);
  }

  /**
   * US-24 & US-25: Quyết toán hợp đồng thuê xe & Cấn trừ cọc
   * - Tổng hợp tiền thuê, phụ phí phát sinh, tiền bồi thường
   * - Cấn trừ với cọc/tạm ứng để tính số tiền hoàn lại hoặc thu thêm
   * - Kết thúc hợp đồng (COMPLETED)
   */
  async createSettlement(dto: CreateSettlementDto, staffId?: string | number) {
    let bookingWhere: any = {};
    if (!isNaN(Number(dto.bookingId))) {
      bookingWhere = { bookingId: Number(dto.bookingId) };
    } else {
      bookingWhere = { bookingCode: String(dto.bookingId) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      include: {
        vehicle: true,
        handovers: { where: { type: 'CHECKIN' }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt xe: ${dto.bookingId}`);
    }

    const checkinRecord = booking.handovers[0];
    const totalRentalAmount = Number(booking.totalAmount || 0);
    const totalPenalties = checkinRecord ? Number(checkinRecord.totalPenaltyFee || 0) : 0;
    const damageCompensation = Number(dto.damageCompensation || 0);
    const totalPayable = totalRentalAmount + totalPenalties + damageCompensation;
    const depositAmount = Number(booking.depositAmount || 0);

    const extraCharges = totalPenalties + damageCompensation;
    const netDepositBalance = depositAmount - extraCharges;
    const refundAmount = netDepositBalance > 0 ? netDepositBalance : 0;
    const additionalCharge = netDepositBalance < 0 ? Math.abs(netDepositBalance) : 0;

    const now = new Date();
    const yyMM = now.toISOString().slice(2, 7).replace('-', '');
    const settlementCode = `QT-${yyMM}-${booking.bookingCode}`;

    let validStaffId: bigint | null = null;
    if (staffId) {
      try {
        const u = await this.prisma.user.findUnique({ where: { userId: BigInt(staffId) } });
        if (u) validStaffId = u.userId;
      } catch {}
    }

    const settlement = await this.prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi quyết toán
      const s = await tx.settlement.create({
        data: {
          settlementCode,
          bookingId: booking.bookingId,
          handoverId: checkinRecord?.handoverId || dto.handoverId || null,
          totalRentalAmount,
          totalPenalties,
          damageCompensation,
          totalPayable,
          depositAmount,
          refundAmount,
          additionalCharge,
          paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
          settlementStatus: 'COMPLETED',
          notes: dto.notes || `Quyết toán hoàn tất. Hoàn cọc: ${refundAmount.toLocaleString('vi-VN')} đ, Thu thêm: ${additionalCharge.toLocaleString('vi-VN')} đ.`,
          settledBy: validStaffId,
          settledAt: now,
        },
      });

      // 2. US-25: Kết thúc hợp đồng, chuyển đơn đặt xe sang 'COMPLETED'
      await tx.booking.update({
        where: { bookingId: booking.bookingId },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'FULLY_PAID',
          notes: `${booking.notes || ''}\n[${now.toISOString()}] Đã thanh lý & quyết toán hợp đồng (${settlementCode}). Tiền cọc hoàn trả: ${refundAmount.toLocaleString('vi-VN')} đ.`,
        },
      });

      return s;
    });

    return {
      settlementId: settlement.settlementId,
      settlementCode: settlement.settlementCode,
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      totalRentalAmount,
      totalPenalties,
      damageCompensation,
      totalPayable,
      depositAmount,
      refundAmount,
      additionalCharge,
      settlementStatus: settlement.settlementStatus,
      paymentMethod: settlement.paymentMethod,
      notes: settlement.notes,
      settledAt: settlement.settledAt.toISOString(),
      message: refundAmount > 0
        ? `Quyết toán thành công! Hệ thống đã xác nhận hoàn trả ${refundAmount.toLocaleString('vi-VN')} VNĐ tiền cọc cho khách hàng.`
        : additionalCharge > 0
        ? `Quyết toán thành công! Khách hàng đã thanh toán bổ sung ${additionalCharge.toLocaleString('vi-VN')} VNĐ.`
        : 'Quyết toán thành công! Tiền cọc cấn trừ vừa đủ các chi phí phát sinh.',
    };
  }

  /**
   * Lấy thông tin bảng quyết toán của một đơn đặt xe
   */
  async getSettlementByBooking(bookingIdOrCode: string | number) {
    let bookingWhere: any = {};
    if (!isNaN(Number(bookingIdOrCode))) {
      bookingWhere = { bookingId: Number(bookingIdOrCode) };
    } else {
      bookingWhere = { bookingCode: String(bookingIdOrCode) };
    }

    const settlement = await this.prisma.settlement.findFirst({
      where: { booking: bookingWhere },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: true,
        handover: true,
      },
    });

    if (!settlement) return null;

    return {
      settlementId: settlement.settlementId,
      settlementCode: settlement.settlementCode,
      bookingId: settlement.bookingId,
      bookingCode: settlement.booking.bookingCode,
      totalRentalAmount: Number(settlement.totalRentalAmount),
      totalPenalties: Number(settlement.totalPenalties),
      damageCompensation: Number(settlement.damageCompensation),
      totalPayable: Number(settlement.totalPayable),
      depositAmount: Number(settlement.depositAmount),
      refundAmount: Number(settlement.refundAmount),
      additionalCharge: Number(settlement.additionalCharge),
      settlementStatus: settlement.settlementStatus,
      paymentMethod: settlement.paymentMethod,
      notes: settlement.notes,
      settledAt: settlement.settledAt.toISOString(),
    };
  }

  /**
   * US-26: Chuyển xe từ trạng thái 'INSPECTING' (Vệ sinh/kỹ thuật) hoặc 'MAINTENANCE' sang 'AVAILABLE'
   */
  async markVehicleReady(vehicleId: number | bigint, staffId?: string | number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId: BigInt(vehicleId) },
    });

    if (!vehicle) {
      throw new NotFoundException('Không tìm thấy phương tiện');
    }

    let validStaffId: bigint | null = null;
    if (staffId) {
      try {
        const u = await this.prisma.user.findUnique({ where: { userId: BigInt(staffId) } });
        if (u) validStaffId = u.userId;
      } catch {}
    }

    const updated = await this.prisma.vehicle.update({
      where: { vehicleId: BigInt(vehicleId) },
      data: {
        status: 'AVAILABLE',
        statusChangedAt: new Date(),
      },
    });

    await this.prisma.vehicleStatusHistory.create({
      data: {
        vehicleId: BigInt(vehicleId),
        fromStatus: vehicle.status,
        toStatus: 'AVAILABLE',
        reason: 'Đã hoàn tất vệ sinh nội ngoại thất và kiểm định kỹ thuật. Xe sẵn sàng phục vụ khách hàng.',
        changedBy: validStaffId,
      },
    });

    return {
      vehicleId: Number(updated.vehicleId),
      licensePlate: updated.licensePlate,
      status: updated.status,
      message: `Xe ${updated.licensePlate} đã sẵn sàng cho thuê (AVAILABLE)!`,
    };
  }

  /**
   * US-27: Quản lý hạn bảo hiểm và lịch bảo dưỡng định kỳ (theo km hoặc thời gian), nhận cảnh báo tự động
   */
  async getMaintenanceAndInsuranceAlerts() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { isActive: true },
      include: {
        model: { include: { brand: true } },
        currentBranch: true,
      },
      orderBy: { licensePlate: 'asc' },
    });

    const now = new Date();
    const alerts: any[] = [];
    let criticalCount = 0;
    let warningCount = 0;

    for (const v of vehicles) {
      const odo = v.odometerKm;
      const nextKm = v.nextMaintenanceKm || 5000;
      const kmRemaining = nextKm - odo;

      // Hạn bảo hiểm
      let daysToInsurance: number | null = null;
      let insuranceStatus: 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
      if (v.insuranceExpiryDate) {
        const diffMs = new Date(v.insuranceExpiryDate).getTime() - now.getTime();
        daysToInsurance = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysToInsurance <= 7) {
          insuranceStatus = 'CRITICAL';
          criticalCount++;
        } else if (daysToInsurance <= 30) {
          insuranceStatus = 'WARNING';
          warningCount++;
        }
      }

      // Hạn đăng kiểm
      let daysToInspection: number | null = null;
      let inspectionStatus: 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
      if (v.inspectionExpiryDate) {
        const diffMs = new Date(v.inspectionExpiryDate).getTime() - now.getTime();
        daysToInspection = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysToInspection <= 7) {
          inspectionStatus = 'CRITICAL';
          criticalCount++;
        } else if (daysToInspection <= 30) {
          inspectionStatus = 'WARNING';
          warningCount++;
        }
      }

      // Hạn bảo dưỡng theo km
      let maintenanceStatus: 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
      if (kmRemaining <= 300) {
        maintenanceStatus = 'CRITICAL';
        criticalCount++;
      } else if (kmRemaining <= 1000) {
        maintenanceStatus = 'WARNING';
        warningCount++;
      }

      const overallSeverity =
        insuranceStatus === 'CRITICAL' || inspectionStatus === 'CRITICAL' || maintenanceStatus === 'CRITICAL'
          ? 'CRITICAL'
          : insuranceStatus === 'WARNING' || inspectionStatus === 'WARNING' || maintenanceStatus === 'WARNING'
          ? 'WARNING'
          : 'OK';

      alerts.push({
        vehicleId: Number(v.vehicleId),
        carName: `${v.model?.brand?.name || ''} ${v.model?.name || ''}`.trim(),
        licensePlate: v.licensePlate,
        branchName: v.currentBranch?.name || 'Chi nhánh Trung tâm',
        odometerKm: odo,
        status: v.status,
        insuranceExpiryDate: v.insuranceExpiryDate ? v.insuranceExpiryDate.toISOString().slice(0, 10) : null,
        daysToInsurance,
        insuranceStatus,
        inspectionExpiryDate: v.inspectionExpiryDate ? v.inspectionExpiryDate.toISOString().slice(0, 10) : null,
        daysToInspection,
        inspectionStatus,
        lastMaintenanceKm: v.lastMaintenanceKm,
        nextMaintenanceKm: nextKm,
        kmRemaining,
        maintenanceStatus,
        overallSeverity,
      });
    }

    return {
      summary: {
        totalVehicles: vehicles.length,
        criticalAlerts: criticalCount,
        warningAlerts: warningCount,
        safeCount: vehicles.length - (criticalCount + warningCount),
      },
      vehicles: alerts,
    };
  }

  /**
   * US-28: Báo cáo thống kê toàn diện cho Quản lý
   * (Doanh thu, số lượt thuê, tỷ lệ khai thác xe, tỷ lệ hủy/gia hạn, sự cố/bảo hiểm, top xe thuê nhiều nhất)
   */
  async getExecutiveReports() {
    const [bookings, vehicles, extensions, incidents, settlements] = await Promise.all([
      this.prisma.booking.findMany({
        include: {
          vehicle: { include: { model: { include: { brand: true } } } },
        },
      }),
      this.prisma.vehicle.findMany({ where: { isActive: true } }),
      this.prisma.rentalExtension.findMany(),
      this.prisma.incident.findMany(),
      this.prisma.settlement.findMany(),
    ]);

    // 1. Doanh thu
    const completedRevenue = bookings
      .filter((b) => ['CONFIRMED', 'IN_RENTAL', 'COMPLETED'].includes(b.status))
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

    const extraExtensionRevenue = extensions
      .filter((e) => e.status === 'APPROVED')
      .reduce((sum, e) => sum + Number(e.extraAmount || 0), 0);

    const penaltyRevenue = settlements.reduce((sum, s) => sum + Number(s.totalPenalties || 0), 0);

    const totalRevenue = completedRevenue + penaltyRevenue;

    // 2. Lượt thuê & Phân bố trạng thái
    const statusCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    const totalBookings = bookings.length;
    const completedBookings = statusCounts['COMPLETED'] || 0;
    const inRentalBookings = statusCounts['IN_RENTAL'] || 0;
    const cancelledBookings = (statusCounts['CANCELLED'] || 0) + (statusCounts['REJECTED'] || 0);
    const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

    // 3. Tỷ lệ khai thác xe (Fleet Utilization)
    const totalFleet = vehicles.length;
    const rentedCars = vehicles.filter((v) => v.status === 'RENTED').length;
    const inspectingCars = vehicles.filter((v) => v.status === 'INSPECTING').length;
    const availableCars = vehicles.filter((v) => v.status === 'AVAILABLE').length;
    const maintenanceCars = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
    const utilizationRate = totalFleet > 0 ? Math.round((rentedCars / totalFleet) * 100) : 0;

    // 4. Thống kê Sự cố & Bảo hiểm
    const totalIncidents = incidents.length;
    const totalDamageCost = incidents.reduce((sum, i) => sum + Number(i.totalDamageCost || 0), 0);
    const insuranceCovered = incidents.reduce((sum, i) => sum + Number(i.insuranceCoverageAmount || 0), 0);
    const customerCompensation = incidents.reduce((sum, i) => sum + Number(i.customerShareAmount || 0), 0);

    // 5. Top các dòng xe được thuê nhiều nhất
    const modelMap: Record<string, { modelName: string; brand: string; count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const model = b.vehicle?.model;
      if (model) {
        const key = model.name;
        if (!modelMap[key]) {
          modelMap[key] = {
            modelName: model.name,
            brand: model.brand?.name || '',
            count: 0,
            revenue: 0,
          };
        }
        modelMap[key].count++;
        modelMap[key].revenue += Number(b.totalAmount || 0);
      }
    });

    const topRentedModels = Object.values(modelMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      overview: {
        totalRevenue,
        completedRevenue,
        extraExtensionRevenue,
        penaltyRevenue,
        totalBookings,
        completedBookings,
        inRentalBookings,
        cancellationRate,
        fleetUtilizationRate: utilizationRate,
      },
      fleetStatus: {
        totalFleet,
        rentedCars,
        inspectingCars,
        availableCars,
        maintenanceCars,
      },
      extensions: {
        totalRequests: extensions.length,
        approvedCount: extensions.filter((e) => e.status === 'APPROVED').length,
        rejectedCount: extensions.filter((e) => e.status === 'REJECTED').length,
        extraRevenue: extraExtensionRevenue,
      },
      incidents: {
        totalIncidents,
        totalDamageCost,
        insuranceCovered,
        customerCompensation,
      },
      topRentedModels,
    };
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
