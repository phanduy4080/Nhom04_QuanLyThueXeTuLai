import { Controller, Get, Post, Body, Param, Query, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RentalService } from './rental.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { QueryHandoversDto } from './dto/query-handovers.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Rental & Handover (Biên Bản Bàn Giao Xe - Sprint 5)')
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
}
