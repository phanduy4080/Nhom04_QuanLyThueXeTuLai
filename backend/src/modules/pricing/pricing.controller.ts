import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CalculateRentalPriceDto } from './dto/calculate-price.dto';
import { CreatePricePlanDto } from './dto/create-price-plan.dto';
import { CreateRentalPolicyDto } from './dto/create-rental-policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pricing & Policies (Bảng Giá & Chính Sách Thuê Minh Bạch - Sprint 1 & 2)')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'US-06: Báo giá chi tiết, phí dịch vụ, cọc và minh bạch điều kiện thuê' })
  async calculatePrice(@Body() dto: CalculateRentalPriceDto) {
    const data = await this.pricingService.calculateRentalPrice(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tính giá thuê và chính sách thành công',
      data,
    };
  }

  @Get('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'US-03 (Admin/Staff): Lấy danh sách bảng giá theo bậc' })
  async getPricePlans() {
    const data = await this.pricingService.getPricePlans();
    return { statusCode: HttpStatus.OK, data };
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'US-03 (Admin): Thiết lập bảng giá thuê theo ngày / bậc giá' })
  async createPricePlan(
    @Body() dto: CreatePricePlanDto,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.pricingService.createPricePlan(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo bảng giá thành công',
      data,
    };
  }

  @Get('policies')
  @ApiOperation({ summary: 'US-06: Lấy danh sách các chính sách thuê xe' })
  async getPolicies() {
    const data = await this.pricingService.getRentalPolicies();
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Lấy chi tiết chính sách thuê' })
  async getPolicyById(@Param('id') id: number) {
    const data = await this.pricingService.getRentalPolicyById(Number(id));
    return { statusCode: HttpStatus.OK, data };
  }

  @Post('policies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo chính sách thuê xe mới (Admin)' })
  async createPolicy(@Body() dto: CreateRentalPolicyDto) {
    const data = await this.pricingService.createRentalPolicy(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo chính sách thành công',
      data,
    };
  }

  @Get('insurance-packages')
  @ApiOperation({ summary: 'Lấy danh sách các gói bảo hiểm thuê xe' })
  async getInsurancePackages() {
    const data = await this.pricingService.getInsurancePackages();
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('extras')
  @ApiOperation({ summary: 'Lấy danh sách các dịch vụ gia tăng' })
  async getExtras() {
    const data = await this.pricingService.getExtras();
    return { statusCode: HttpStatus.OK, data };
  }
}
