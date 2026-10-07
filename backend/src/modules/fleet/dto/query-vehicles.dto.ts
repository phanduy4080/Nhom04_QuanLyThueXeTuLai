import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransmissionType, FuelType, VehicleStatus } from '@prisma/client';

export class QueryVehiclesDto {
  @ApiPropertyOptional({ example: 'VinFast', description: 'Từ khóa tìm kiếm (tên xe, hãng, biển số)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ID chi nhánh' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ID danh mục xe (Sedan, SUV, MPV, EV...)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ID hãng xe' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ example: 5, description: 'Lọc theo số chỗ ngồi' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seats?: number;

  @ApiPropertyOptional({ enum: ['MANUAL', 'AUTOMATIC'], description: 'Lọc theo hộp số' })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiPropertyOptional({
    enum: ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'LPG'],
    description: 'Lọc theo loại nhiên liệu',
  })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({ example: 'AVAILABLE', description: 'Lọc theo trạng thái xe' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ example: 500000, description: 'Giá thuê tối thiểu (VNĐ/ngày)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 2000000, description: 'Giá thuê tối đa (VNĐ/ngày)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: '2026-10-15T08:00:00.000Z', description: 'Thời gian bắt đầu thuê (US-04 & US-05)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-18T20:00:00.000Z', description: 'Thời gian kết thúc thuê (US-04 & US-05)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
