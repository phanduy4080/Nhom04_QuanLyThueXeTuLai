import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RentalService {
  constructor(private prisma: PrismaService) {}

  async getHandoverRecords() {
    const items = await this.prisma.handoverRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            vehicle: {
              include: {
                model: { include: { brand: true } },
              },
            },
          },
        },
      },
    });

    if (items.length === 0) {
      // Return sample records if empty
      return [
        {
          id: 'BB-2610-001',
          bookingCode: 'DH-2610-000041',
          customerName: 'Trần Thị Bích',
          carName: 'VinFast VF8 Plus (5 chỗ)',
          odo: 12450,
          fuel: 'Pin 95%',
          staff: 'Nguyễn Văn Phụ Trách',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'BB-2610-002',
          bookingCode: 'DH-2610-000040',
          customerName: 'Lê Hoàng Long',
          carName: 'Toyota Camry 2.5Q (5 chỗ)',
          odo: 28900,
          fuel: 'Xăng 100%',
          staff: 'Lê Văn Bàn Giao',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return items.map((r) => ({
      id: r.handoverCode,
      bookingCode: r.booking?.bookingCode || 'DH-0000',
      customerName: r.booking?.customerName || 'Khách Hàng',
      carName: r.booking?.vehicle?.model
        ? `${r.booking.vehicle.model.brand?.name || ''} ${r.booking.vehicle.model.name || ''}`
        : 'Xe Ô Tô',
      odo: r.odoMeter,
      fuel: r.fuelLevel,
      staff: 'Nhân viên trạm',
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createHandover(data: any, staffId?: number) {
    const handoverCode = `BB-${Date.now().toString().slice(-6)}`;
    const record = await this.prisma.handoverRecord.create({
      data: {
        handoverCode,
        bookingId: data.bookingId,
        vehicleId: BigInt(data.vehicleId),
        staffId: staffId ? BigInt(staffId) : null,
        type: data.type || 'CHECKOUT',
        odoMeter: Number(data.odoMeter || 0),
        fuelLevel: data.fuelLevel || '100%',
        carCondition: data.carCondition || 'Xe sạch sẽ, không trầy xước mới',
        status: 'COMPLETED',
      },
    });
    return record;
  }
}
