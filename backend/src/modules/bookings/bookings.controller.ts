import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Khách hàng tạo đơn đặt xe & cọc
   */
  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    const userId = req.user?.userId;
    const booking = await this.bookingsService.createBooking(dto, userId);
    return {
      statusCode: 201,
      message: 'Tạo đơn đặt xe thành công',
      data: booking,
    };
  }

  /**
   * Danh sách đơn đặt xe (Dành cho Admin / Staff)
   */
  @Get()
  async findAll(@Query() query: QueryBookingsDto) {
    const res = await this.bookingsService.findAll(query);
    return {
      statusCode: 200,
      message: 'Lấy danh sách đơn đặt xe thành công',
      ...res,
    };
  }

  /**
   * KPI Thống kê nhanh cho Dashboard
   */
  @Get('dashboard/kpi')
  async getDashboardKpi() {
    const data = await this.bookingsService.getDashboardStats();
    return {
      statusCode: 200,
      message: 'Lấy dữ liệu thống kê KPI thành công',
      data,
    };
  }

  /**
   * Đơn đặt xe của tôi (Khách hàng xem lịch sử đơn)
   */
  @Get('my-bookings')
  async getMyBookings(@Query('email') email?: string, @Query('phone') phone?: string, @Req() req?: any) {
    const userId = req?.user?.userId;
    const data = await this.bookingsService.getMyBookings(userId, email, phone);
    return {
      statusCode: 200,
      message: 'Lấy danh sách đơn đặt xe của tôi thành công',
      data,
    };
  }

  /**
   * Xem chi tiết 1 đơn đặt xe
   */
  @Get(':idOrCode')
  async findOne(@Param('idOrCode') idOrCode: string) {
    const data = await this.bookingsService.findOne(idOrCode);
    return {
      statusCode: 200,
      message: 'Lấy chi tiết đơn đặt xe thành công',
      data,
    };
  }

  /**
   * Admin / Nhân viên duyệt cọc hoặc cập nhật trạng thái đơn
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
    @Req() req: any,
  ) {
    const staffUserId = req.user?.userId;
    const data = await this.bookingsService.updateStatus(id, dto, staffUserId);
    return {
      statusCode: 200,
      message: 'Cập nhật trạng thái đơn đặt xe thành công',
      data,
    };
  }
}
