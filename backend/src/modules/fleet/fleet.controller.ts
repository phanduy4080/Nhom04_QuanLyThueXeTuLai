import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateVehicleStatusDto } from './dto/update-status.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Fleet (Quản Lý Xe & Tìm Kiếm Xe - Sprint 1 & 2)')
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('vehicles')
  @ApiOperation({ summary: 'US-04: Tìm kiếm xe & Lọc theo tiêu chí (Hãng, Số chỗ, Giá, Ngày thuê, Chi nhánh)' })
  async getVehicles(@Query() query: QueryVehiclesDto) {
    const result = await this.fleetService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách xe thành công',
      data: result.vehicles,
      meta: result.meta,
    };
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'US-06: Xem thông tin chi tiết xe và chính sách thuê minh bạch' })
  async getVehicleById(@Param('id') id: string) {
    const result = await this.fleetService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết xe thành công',
      data: result,
    };
  }

  @Get('vehicles/:id/availability')
  @ApiOperation({ summary: 'US-05: Kiểm tra tự động tính sẵn sàng của xe theo khoảng ngày' })
  async checkAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.fleetService.checkAvailability(id, startDate, endDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Kiểm tra lịch xe thành công',
      data: result,
    };
  }

  @Post('vehicles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'US-01 (Admin/Staff): Thêm xe mới vào hệ thống' })
  async createVehicle(
    @Body() dto: CreateVehicleDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.fleetService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo xe mới thành công',
      data: result,
    };
  }

  @Put('vehicles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'US-01 (Admin/Staff): Cập nhật thông tin chi tiết xe' })
  async updateVehicle(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const result = await this.fleetService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật xe thành công',
      data: result,
    };
  }

  @Patch('vehicles/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'US-02 (Admin/Staff): Cập nhật trạng thái xe & lưu lịch sử' })
  async updateVehicleStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.fleetService.updateStatus(id, dto, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật trạng thái xe thành công',
      data: result,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách các phân khúc xe (Sedan, SUV, MPV, EV...)' })
  async getCategories() {
    const data = await this.fleetService.getCategories();
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('brands')
  @ApiOperation({ summary: 'Lấy danh sách các hãng xe (VinFast, Toyota, Mazda...)' })
  async getBrands() {
    const data = await this.fleetService.getBrands();
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('models')
  @ApiOperation({ summary: 'Lấy danh sách dòng xe' })
  async getModels(
    @Query('brandId') brandId?: number,
    @Query('categoryId') categoryId?: number,
  ) {
    const data = await this.fleetService.getModels(brandId, categoryId);
    return { statusCode: HttpStatus.OK, data };
  }
}
