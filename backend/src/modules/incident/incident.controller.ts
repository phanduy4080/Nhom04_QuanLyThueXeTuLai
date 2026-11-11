import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { IncidentService } from './incident.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentClaimDto } from './dto/update-incident-claim.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';

@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  /**
   * US-18: Khách hàng thông báo sự cố (hỏng hóc, tai nạn, mất phụ kiện) kèm mô tả và hình ảnh minh chứng
   */
  @Post()
  async createIncident(@Body() dto: CreateIncidentDto, @Req() req: any) {
    const userId = req.user?.userId;
    const data = await this.incidentService.createIncident(dto, userId);
    return {
      statusCode: 201,
      message: 'Thông báo sự cố đã được ghi nhận thành công. Chuyên viên sẽ liên hệ hỗ trợ bạn ngay lập tức!',
      data,
    };
  }

  /**
   * US-19: Danh sách hồ sơ sự cố (Dành cho Nhân viên / Admin)
   */
  @Get()
  async findAll(@Query() query: QueryIncidentDto) {
    const data = await this.incidentService.findAll(query);
    return {
      statusCode: 200,
      message: 'Lấy danh sách hồ sơ sự cố thành công',
      data,
    };
  }

  /**
   * Lấy danh sách sự cố của một đơn thuê xe cụ thể
   */
  @Get('booking/:bookingIdOrCode')
  async getByBooking(@Param('bookingIdOrCode') bookingIdOrCode: string) {
    const data = await this.incidentService.getIncidentsByBooking(bookingIdOrCode);
    return {
      statusCode: 200,
      message: 'Lấy danh sách sự cố của đơn đặt xe thành công',
      data,
    };
  }

  /**
   * Xem chi tiết 1 hồ sơ sự cố
   */
  @Get(':idOrCode')
  async findOne(@Param('idOrCode') idOrCode: string) {
    const data = await this.incidentService.findOne(idOrCode);
    return {
      statusCode: 200,
      message: 'Lấy chi tiết hồ sơ sự cố thành công',
      data,
    };
  }

  /**
   * US-19: Nhân viên lập hồ sơ, làm việc với bảo hiểm và phân định trách nhiệm chi phí
   */
  @Patch(':idOrCode/claim')
  async updateClaimAndLiability(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: UpdateIncidentClaimDto,
    @Req() req: any,
  ) {
    const staffUserId = req.user?.userId;
    const data = await this.incidentService.updateClaimAndLiability(idOrCode, dto, staffUserId);
    return {
      statusCode: 200,
      message: 'Cập nhật hồ sơ sự cố, tiến độ bảo hiểm và phân định chi phí thành công!',
      data,
    };
  }
}

