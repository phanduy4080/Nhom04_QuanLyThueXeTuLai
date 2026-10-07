import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrgService } from './org.service';

@ApiTags('Org (Chi Nhánh & Điểm Giao Nhận Xe)')
@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get('branches')
  @ApiOperation({ summary: 'Lấy danh sách các chi nhánh / điểm giao nhận xe' })
  async getBranches() {
    const data = await this.orgService.getBranches();
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }
}
