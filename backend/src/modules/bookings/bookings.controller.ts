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
import { VerifyDocumentsDto } from './dto/verify-documents.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';

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
   * US-08, US-09: Pre-check kiểm tra điều kiện hồ sơ khách hàng & người lái bổ sung theo thời gian thực
   */
  @Post('check-eligibility')
  async checkEligibility(@Body() payload: any) {
    const result = await this.bookingsService.checkEligibility(payload);
    return {
      statusCode: 200,
      message: 'Đối chiếu điều kiện thuê xe thành công',
      data: result,
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
   * US-07 & US-08: Khách hàng nộp hoặc cập nhật giấy tờ định danh & GPLX trực tuyến
   */
  @Post(':idOrCode/verify-documents')
  async verifyDocuments(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: VerifyDocumentsDto,
  ) {
    const data = await this.bookingsService.verifyDocuments(idOrCode, dto);
    return {
      statusCode: 200,
      message: 'Hồ sơ đã được cập nhật và hệ thống tự động đối chiếu điều kiện',
      data,
    };
  }

  /**
   * US-08: Admin / Chuyên viên xét duyệt hoặc từ chối hồ sơ định danh
   */
  @Post(':id/review-verification')
  async reviewVerification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewVerificationDto,
    @Req() req: any,
  ) {
    const staffUserId = req.user?.userId;
    const data = await this.bookingsService.reviewVerification(id, dto, staffUserId);
    return {
      statusCode: 200,
      message: 'Cập nhật kết quả xét duyệt hồ sơ thành công',
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
