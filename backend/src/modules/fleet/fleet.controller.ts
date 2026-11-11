import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateVehicleStatusDto } from './dto/update-status.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { QueryModelsDto } from './dto/query-models.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BannerConfigDto } from './dto/banner-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Fleet (Quản Lý Xe & Tìm Kiếm Xe - Sprint 1 & 2)')
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('banner')
  @ApiOperation({ summary: 'Lấy cấu hình Hero Banner 3D trang chủ' })
  async getBannerConfig() {
    const data = await this.fleetService.getBannerConfig();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy cấu hình banner thành công',
      data,
    };
  }

  @Put('banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật cấu hình Hero Banner 3D trang chủ (Admin/Staff)' })
  async updateBannerConfig(@Body() body: BannerConfigDto, @CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.fleetService.updateBannerConfig(body, userId ? String(userId) : undefined);
  }

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
  @ApiOperation({ summary: 'US-01 (Admin/Staff): Thêm xe mới vào hệ thống' })
  async createVehicle(
    @Body() dto: CreateVehicleDto,
    @CurrentUser('userId') userId?: string,
  ) {
    const result = await this.fleetService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo xe mới thành công',
      data: result,
    };
  }

  @Put('vehicles/:id')
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
  @ApiOperation({ summary: 'US-02 (Admin/Staff): Cập nhật trạng thái xe & lưu lịch sử' })
  async updateVehicleStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleStatusDto,
    @CurrentUser('userId') userId?: string,
  ) {
    const result = await this.fleetService.updateStatus(id, dto, userId || '1');
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật trạng thái xe thành công',
      data: result,
    };
  }

  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Admin/Staff: Xóa xe khỏi hệ thống (soft delete)' })
  async deleteVehicle(@Param('id') id: string) {
    const result = await this.fleetService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
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
  async getBrands(@Query('includeInactive') includeInactive?: string) {
    const data = await this.fleetService.getBrands(includeInactive === 'true');
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('brands/:id')
  @ApiOperation({ summary: 'Lấy chi tiết một hãng xe' })
  async getBrandById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.fleetService.getBrandById(id);
    return { statusCode: HttpStatus.OK, data };
  }

  @Post('brands')
  @ApiOperation({ summary: 'Admin/Staff: Thêm hãng xe mới' })
  async createBrand(@Body() dto: CreateBrandDto) {
    const data = await this.fleetService.createBrand(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo hãng xe mới thành công',
      data,
    };
  }

  @Put('brands/:id')
  @ApiOperation({ summary: 'Admin/Staff: Cập nhật thông tin hãng xe' })
  async updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
  ) {
    const data = await this.fleetService.updateBrand(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật hãng xe thành công',
      data,
    };
  }

  @Delete('brands/:id')
  @ApiOperation({ summary: 'Admin/Staff: Xóa hoặc ngưng hoạt động hãng xe' })
  async deleteBrand(@Param('id', ParseIntPipe) id: number) {
    const result = await this.fleetService.deleteBrand(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }

  @Get('models')
  @ApiOperation({ summary: 'Lấy danh sách dòng xe' })
  async getModels(@Query() query: QueryModelsDto) {
    const data = await this.fleetService.getModels(
      query.brandId,
      query.categoryId,
      query.includeInactive,
      query.search,
    );
    return { statusCode: HttpStatus.OK, data };
  }

  @Get('models/:id')
  @ApiOperation({ summary: 'Xem thông tin chi tiết một dòng xe' })
  async getModelById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.fleetService.getModelById(id);
    return { statusCode: HttpStatus.OK, data };
  }

  @Post('models')
  @ApiOperation({ summary: 'Admin/Staff: Thêm dòng xe mới vào hệ thống' })
  async createModel(@Body() dto: CreateModelDto) {
    const data = await this.fleetService.createModel(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo dòng xe mới thành công',
      data,
    };
  }

  @Put('models/:id')
  @ApiOperation({ summary: 'Admin/Staff: Cập nhật thông tin dòng xe' })
  async updateModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModelDto,
  ) {
    const data = await this.fleetService.updateModel(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật dòng xe thành công',
      data,
    };
  }

  @Delete('models/:id')
  @ApiOperation({ summary: 'Admin/Staff: Xóa hoặc ngưng hoạt động dòng xe' })
  async deleteModel(@Param('id', ParseIntPipe) id: number) {
    const result = await this.fleetService.deleteModel(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }
}
