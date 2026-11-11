import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentClaimDto } from './dto/update-incident-claim.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncidentService {
  constructor(private prisma: PrismaService) {}

  /**
   * US-18: Khách hàng thông báo sự cố kèm mô tả và hình ảnh minh chứng
   */
  async createIncident(dto: CreateIncidentDto, reportedByUserId?: number | bigint) {
    let bookingWhere: Prisma.BookingWhereInput = {};
    if (!isNaN(Number(dto.bookingIdOrCode))) {
      bookingWhere = { bookingId: Number(dto.bookingIdOrCode) };
    } else {
      bookingWhere = { bookingCode: String(dto.bookingIdOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe liên quan đến sự cố');
    }

    // Sinh mã hồ sơ sự cố độc nhất: INC-YYMM-XXXXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const incidentCode = `INC-${yearMonth}-${randomSuffix}`;

    const incident = await this.prisma.incident.create({
      data: {
        incidentCode,
        bookingId: booking.bookingId,
        vehicleId: booking.vehicleId,
        incidentType: dto.incidentType,
        status: 'REPORTED',
        title: dto.title,
        description: dto.description,
        location: dto.location || 'Chưa cập nhật địa điểm cụ thể',
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
        contactPhone: dto.contactPhone || booking.phone,
        evidencePhotos: dto.evidencePhotos || [],
        reportedByName: booking.customerName,
        reportedByPhone: dto.contactPhone || booking.phone,
        reportedAt: new Date(),
      },
      include: {
        booking: true,
        vehicle: {
          include: {
            model: { include: { brand: true } },
          },
        },
      },
    });

    return this.formatIncident(incident);
  }

  /**
   * US-19: Danh sách hồ sơ sự cố (Nhân viên / Admin quản trị)
   */
  async findAll(query: QueryIncidentDto) {
    const where: Prisma.IncidentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.incidentType) {
      where.incidentType = query.incidentType;
    }

    if (query.bookingId) {
      where.bookingId = Number(query.bookingId);
    }

    if (query.search) {
      where.OR = [
        { incidentCode: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { reportedByName: { contains: query.search, mode: 'insensitive' } },
        { reportedByPhone: { contains: query.search, mode: 'insensitive' } },
        { booking: { bookingCode: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const items = await this.prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: true,
        vehicle: {
          include: {
            model: { include: { brand: true } },
          },
        },
        assignedStaff: true,
      },
    });

    return items.map((i) => this.formatIncident(i));
  }

  /**
   * Chi tiết một hồ sơ sự cố
   */
  async findOne(idOrCode: string | number) {
    let where: Prisma.IncidentWhereInput = {};
    if (!isNaN(Number(idOrCode))) {
      where = { incidentId: BigInt(idOrCode) };
    } else {
      where = { incidentCode: String(idOrCode) };
    }

    const incident = await this.prisma.incident.findFirst({
      where,
      include: {
        booking: {
          include: {
            pickupBranch: true,
            returnBranch: true,
          },
        },
        vehicle: {
          include: {
            model: { include: { brand: true } },
          },
        },
        assignedStaff: true,
      },
    });

    if (!incident) {
      throw new NotFoundException('Không tìm thấy hồ sơ sự cố');
    }

    return this.formatIncident(incident);
  }

  /**
   * US-19: Nhân viên cập nhật hồ sơ sự cố, làm việc với bảo hiểm & phân định trách nhiệm chi phí
   */
  async updateClaimAndLiability(
    idOrCode: string | number,
    dto: UpdateIncidentClaimDto,
    staffUserId?: number | bigint,
  ) {
    let where: Prisma.IncidentWhereInput = {};
    if (!isNaN(Number(idOrCode))) {
      where = { incidentId: BigInt(idOrCode) };
    } else {
      where = { incidentCode: String(idOrCode) };
    }

    const incident = await this.prisma.incident.findFirst({
      where,
      include: { booking: true },
    });

    if (!incident) {
      throw new NotFoundException('Không tìm thấy hồ sơ sự cố');
    }

    const isResolving = dto.status === 'RESOLVED' || dto.status === 'CLOSED';

    const updated = await this.prisma.incident.update({
      where: { incidentId: incident.incidentId },
      data: {
        status: dto.status || incident.status,
        insuranceClaimNumber: dto.insuranceClaimNumber ?? incident.insuranceClaimNumber,
        insurerName: dto.insurerName ?? incident.insurerName,
        insuranceAppraiser: dto.insuranceAppraiser ?? incident.insuranceAppraiser,
        insuranceContact: dto.insuranceContact ?? incident.insuranceContact,
        insuranceStatus: dto.insuranceStatus ?? incident.insuranceStatus,
        insuranceNotes: dto.insuranceNotes ?? incident.insuranceNotes,
        totalDamageCost: dto.totalDamageCost !== undefined ? dto.totalDamageCost : incident.totalDamageCost,
        insuranceCoverageAmount: dto.insuranceCoverageAmount !== undefined ? dto.insuranceCoverageAmount : incident.insuranceCoverageAmount,
        companyShareAmount: dto.companyShareAmount !== undefined ? dto.companyShareAmount : incident.companyShareAmount,
        customerShareAmount: dto.customerShareAmount !== undefined ? dto.customerShareAmount : incident.customerShareAmount,
        deductedFromDeposit: dto.deductedFromDeposit !== undefined ? dto.deductedFromDeposit : incident.deductedFromDeposit,
        customerPaymentStatus: dto.customerPaymentStatus ?? incident.customerPaymentStatus,
        liabilityParty: dto.liabilityParty ?? incident.liabilityParty,
        liabilityNotes: dto.liabilityNotes ?? incident.liabilityNotes,
        resolutionNotes: dto.resolutionNotes ?? incident.resolutionNotes,
        assignedStaffId: staffUserId ? BigInt(staffUserId) : incident.assignedStaffId,
        resolvedAt: isResolving ? new Date() : incident.resolvedAt,
      },
      include: {
        booking: true,
        vehicle: {
          include: {
            model: { include: { brand: true } },
          },
        },
        assignedStaff: true,
      },
    });

    return this.formatIncident(updated);
  }

  /**
   * Lấy danh sách sự cố theo đơn thuê xe
   */
  async getIncidentsByBooking(bookingIdOrCode: string | number) {
    let bookingWhere: Prisma.BookingWhereInput = {};
    if (!isNaN(Number(bookingIdOrCode))) {
      bookingWhere = { bookingId: Number(bookingIdOrCode) };
    } else {
      bookingWhere = { bookingCode: String(bookingIdOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      select: { bookingId: true },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    const items = await this.prisma.incident.findMany({
      where: { bookingId: booking.bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: true,
        vehicle: {
          include: {
            model: { include: { brand: true } },
          },
        },
        assignedStaff: true,
      },
    });

    return items.map((i) => this.formatIncident(i));
  }

  private formatIncident(i: any) {
    const vehicleName = i.vehicle?.model
      ? `${i.vehicle.model.brand?.name || ''} ${i.vehicle.model.name || ''}`.trim()
      : 'Xe Ô Tô';

    return {
      incidentId: Number(i.incidentId),
      incidentCode: i.incidentCode,
      bookingId: i.bookingId,
      bookingCode: i.booking?.bookingCode || '',
      customerName: i.booking?.customerName || i.reportedByName || '',
      vehicleId: Number(i.vehicleId),
      carName: vehicleName,
      licensePlate: i.vehicle?.licensePlate || '',
      incidentType: i.incidentType,
      status: i.status,
      title: i.title,
      description: i.description,
      location: i.location || '',
      occurredAt: i.occurredAt ? i.occurredAt.toISOString() : '',
      contactPhone: i.contactPhone || '',
      evidencePhotos: Array.isArray(i.evidencePhotos) ? i.evidencePhotos : [],

      // Bảo hiểm (US-19)
      insuranceClaimNumber: i.insuranceClaimNumber || '',
      insurerName: i.insurerName || '',
      insuranceAppraiser: i.insuranceAppraiser || '',
      insuranceContact: i.insuranceContact || '',
      insuranceStatus: i.insuranceStatus || 'NOT_SUBMITTED',
      insuranceNotes: i.insuranceNotes || '',

      // Phân định trách nhiệm & Chi phí (US-19)
      totalDamageCost: Number(i.totalDamageCost || 0),
      insuranceCoverageAmount: Number(i.insuranceCoverageAmount || 0),
      companyShareAmount: Number(i.companyShareAmount || 0),
      customerShareAmount: Number(i.customerShareAmount || 0),
      deductedFromDeposit: Number(i.deductedFromDeposit || 0),
      customerPaymentStatus: i.customerPaymentStatus || 'PENDING',
      liabilityParty: i.liabilityParty || 'CUSTOMER',
      liabilityNotes: i.liabilityNotes || '',
      resolutionNotes: i.resolutionNotes || '',

      reportedByName: i.reportedByName || '',
      reportedByPhone: i.reportedByPhone || '',
      reportedAt: i.reportedAt ? i.reportedAt.toISOString() : '',
      assignedStaffName: i.assignedStaff?.fullName || null,
      resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : null,
      createdAt: i.createdAt ? i.createdAt.toISOString() : '',
    };
  }
}
