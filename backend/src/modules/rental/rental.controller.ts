import { Controller, Get, Post, Patch, Body, Param, Query, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RentalService } from './rental.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { CreateReturnHandoverDto } from './dto/create-return-handover.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { QueryHandoversDto } from './dto/query-handovers.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Rental & Handover & Settlement (Sprint 5, 8, 9, 10, 11)')
@Controller('rental')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Get('handovers')
  @ApiOperation({ summary: 'Lấy danh sách các biên bản bàn giao xe (Check-in / Check-out)' })
  async getHandoverRecords(@Query() query: QueryHandoversDto) {
    const data = await this.rentalService.getHandoverRecords(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách biên bản bàn giao thành công',
      data,
    };
  }

  @Get('handovers/:idOrCode')
  @ApiOperation({ summary: 'US-14: Lấy chi tiết Biên bản bàn giao xe theo ID hoặc Mã biên bản để in/xem' })
  async getHandoverByIdOrCode(@Param('idOrCode') idOrCode: string) {
    const data = await this.rentalService.getHandoverByIdOrCode(idOrCode);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết biên bản bàn giao xe thành công',
      data,
    };
  }

  @Get('handovers/booking/:bookingIdOrCode')
  @ApiOperation({ summary: 'US-14: Lấy biên bản bàn giao xe liên kết với một đơn đặt xe cụ thể' })
  async getHandoverByBooking(@Param('bookingIdOrCode') bookingIdOrCode: string) {
    const data = await this.rentalService.getHandoverByBooking(bookingIdOrCode);
    return {
      statusCode: HttpStatus.OK,
      message: data ? 'Tìm thấy biên bản bàn giao của đơn' : 'Đơn chưa có biên bản bàn giao',
      data,
    };
  }

  @Post('handovers')
  @ApiOperation({ summary: 'US-13, US-14, US-15: Lập Biên bản bàn giao xe & tự động chuyển trạng thái xe sang RENTED' })
  async createHandover(
    @Body() dto: CreateHandoverDto,
    @CurrentUser('userId') userId?: string,
    @Req() req?: any,
  ) {
    const effectiveStaffId = userId || req?.user?.userId;
    const data = await this.rentalService.createHandover(dto, effectiveStaffId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Lập biên bản bàn giao và chuyển trạng thái xe sang Đang Cho Thuê thành công!',
      data,
    };
  }

  // --- SPRINT 8 & 9 (US-20, US-21, US-22, US-23) ---

  @Post('return/preview')
  @ApiOperation({ summary: 'US-20 & US-22: Đối chiếu số km, nhiên liệu và tính trước các khoản phạt vi phạm' })
  async calculateReturnInspection(@Body() dto: CreateReturnHandoverDto) {
    const data = await this.rentalService.calculateReturnInspection(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tính toán đối chiếu trả xe và phí phạt thành công',
      data,
    };
  }

  @Post('return')
  @ApiOperation({ summary: 'US-20, US-21, US-22, US-23, US-26: Lập Biên bản hoàn trả xe (CHECKIN), phạt vi phạm & chuyển xe sang INSPECTING' })
  async createReturnHandover(
    @Body() dto: CreateReturnHandoverDto,
    @CurrentUser('userId') userId?: string,
    @Req() req?: any,
  ) {
    const effectiveStaffId = userId || req?.user?.userId;
    const data = await this.rentalService.createReturnHandover(dto, effectiveStaffId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Lập biên bản hoàn trả xe thành công! Xe đã chuyển sang trạng thái chờ vệ sinh & kiểm tra kỹ thuật.',
      data,
    };
  }

  // --- SPRINT 10 (US-24, US-25, US-26) ---

  @Post('settlement')
  @ApiOperation({ summary: 'US-24 & US-25: Quyết toán hợp đồng, cấn trừ cọc và kết thúc hợp đồng (COMPLETED)' })
  async createSettlement(
    @Body() dto: CreateSettlementDto,
    @CurrentUser('userId') userId?: string,
    @Req() req?: any,
  ) {
    const effectiveStaffId = userId || req?.user?.userId;
    const data = await this.rentalService.createSettlement(dto, effectiveStaffId);
    return {
      statusCode: HttpStatus.CREATED,
      message: data.message,
      data,
    };
  }

  @Get('settlement/booking/:bookingIdOrCode')
  @ApiOperation({ summary: 'Lấy thông tin quyết toán hợp đồng của một đơn thuê xe' })
  async getSettlementByBooking(@Param('bookingIdOrCode') bookingIdOrCode: string) {
    const data = await this.rentalService.getSettlementByBooking(bookingIdOrCode);
    return {
      statusCode: HttpStatus.OK,
      message: data ? 'Tìm thấy bảng quyết toán hợp đồng' : 'Chưa có thông tin quyết toán',
      data,
    };
  }

  @Patch('vehicle/:vehicleId/ready')
  @ApiOperation({ summary: 'US-26: Xác nhận xe đã hoàn tất vệ sinh/kỹ thuật và sẵn sàng cho thuê (AVAILABLE)' })
  async markVehicleReady(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser('userId') userId?: string,
    @Req() req?: any,
  ) {
    const effectiveStaffId = userId || req?.user?.userId;
    const data = await this.rentalService.markVehicleReady(Number(vehicleId), effectiveStaffId);
    return {
      statusCode: HttpStatus.OK,
      message: data.message,
      data,
    };
  }

  // --- SPRINT 11 (US-27, US-28) ---

  @Get('analytics/maintenance')
  @ApiOperation({ summary: 'US-27: Quản lý hạn bảo hiểm, đăng kiểm & bảo dưỡng định kỳ với cảnh báo tự động' })
  async getMaintenanceAlerts() {
    const data = await this.rentalService.getMaintenanceAndInsuranceAlerts();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách cảnh báo bảo hiểm & bảo dưỡng thành công',
      data,
    };
  }

  @Get('analytics/executive-report')
  @ApiOperation({ summary: 'US-28: Báo cáo thống kê toàn diện cho Quản lý (Doanh thu, tỷ lệ khai thác, hủy/gia hạn, sự cố, top xe)' })
  async getExecutiveReports() {
    const data = await this.rentalService.getExecutiveReports();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy báo cáo thống kê quản trị thành công',
      data,
    };
  }
}
