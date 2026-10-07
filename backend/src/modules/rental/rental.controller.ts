import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { RentalService } from './rental.service';

@Controller('rental')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Get('handovers')
  async getHandoverRecords() {
    const data = await this.rentalService.getHandoverRecords();
    return {
      statusCode: 200,
      message: 'Lấy danh sách biên bản bàn giao thành công',
      data,
    };
  }

  @Post('handovers')
  async createHandover(@Body() body: any, @Req() req: any) {
    const staffId = req.user?.userId;
    const data = await this.rentalService.createHandover(body, staffId);
    return {
      statusCode: 201,
      message: 'Lập biên bản bàn giao thành công',
      data,
    };
  }
}
