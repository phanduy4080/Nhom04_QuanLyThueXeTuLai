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
import { RejectBookingDto } from './dto/reject-booking.dto';
import { PayDepositDto } from './dto/pay-deposit.dto';

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
   * US-10: Nhân viên duyệt yêu cầu thuê xe của khách hàng
   */
  @Post(':id/approve')
  async approveBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body('notes') notes?: string,
    @Req() req?: any,
  ) {
    const staffUserId = req?.user?.userId;
    const data = await this.bookingsService.approveBooking(id, notes, staffUserId);
    return {
      statusCode: 200,
      message: 'Đã phê duyệt yêu cầu thuê xe thành công',
      data,
    };
  }

  /**
   * US-10: Nhân viên từ chối yêu cầu thuê xe của khách hàng kèm lý do
   */
  @Post(':id/reject')
  async rejectBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectBookingDto,
    @Req() req?: any,
  ) {
    const staffUserId = req?.user?.userId;
    const data = await this.bookingsService.rejectBooking(id, dto, staffUserId);
    return {
      statusCode: 200,
      message: 'Đã từ chối yêu cầu thuê xe và giải phóng xe thành công',
      data,
    };
  }

  /**
   * US-11: Khách hàng thanh toán tiền cọc/tạm ứng để xác nhận giữ xe
   */
  @Post(':idOrCode/pay-deposit')
  async payDeposit(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: PayDepositDto,
  ) {
    const data = await this.bookingsService.payDeposit(idOrCode, dto);
    return {
      statusCode: 200,
      message: 'Thanh toán tiền cọc thành công! Xe đã được giữ và hợp đồng điện tử đã được khởi tạo.',
      data,
    };
  }

  /**
   * US-11: Lấy thông tin thanh toán tiền cọc (VietQR ngân hàng, nội dung chuyển khoản)
   */
  @Get(':idOrCode/deposit-info')
  async getDepositInfo(@Param('idOrCode') idOrCode: string) {
    const data = await this.bookingsService.getDepositInfo(idOrCode);
    return {
      statusCode: 200,
      message: 'Lấy thông tin thanh toán tiền cọc thành công',
      data,
    };
  }

  /**
   * US-12: Xem chi tiết Hợp đồng thuê xe điện tử
   */
  @Get(':idOrCode/contract')
  async getRentalContract(@Param('idOrCode') idOrCode: string) {
    const data = await this.bookingsService.getRentalContract(idOrCode);
    return {
      statusCode: 200,
      message: 'Lấy hợp đồng thuê xe điện tử thành công',
      data,
    };
  }

  /**
   * US-12: Tự động khởi tạo / tái tạo Hợp đồng thuê xe điện tử
   */
  @Post(':idOrCode/generate-contract')
  async generateRentalContract(@Param('idOrCode') idOrCode: string) {
    const data = await this.bookingsService.generateRentalContract(idOrCode);
    return {
      statusCode: 201,
      message: 'Khởi tạo hợp đồng thuê xe điện tử thành công',
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
