import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TransmissionType, FuelType } from '@prisma/client';

export class CreateModelDto {
  @ApiProperty({ example: 1, description: 'ID Hãng xe (Brand ID)' })
  @IsNotEmpty({ message: 'Vui lòng chọn hãng xe' })
  @Type(() => Number)
  @IsNumber()
  brandId: number;

  @ApiProperty({ example: 1, description: 'ID Phân khúc xe (Category ID)' })
  @IsNotEmpty({ message: 'Vui lòng chọn phân khúc xe' })
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 'VF 8', description: 'Tên dòng xe' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên dòng xe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Plus 2024', description: 'Phiên bản / Biến thể xe' })
  @IsOptional()
  @IsString()
  variant?: string;

  @ApiProperty({ example: 5, description: 'Số chỗ ngồi' })
  @IsNotEmpty({ message: 'Vui lòng nhập số chỗ ngồi' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(60)
  seats: number;

  @ApiPropertyOptional({ example: 5, description: 'Số cửa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  doors?: number;

  @ApiProperty({ enum: TransmissionType, example: 'AUTOMATIC', description: 'Loại hộp số' })
  @IsNotEmpty({ message: 'Vui lòng chọn loại hộp số' })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({ enum: FuelType, example: 'ELECTRIC', description: 'Loại nhiên liệu' })
  @IsNotEmpty({ message: 'Vui lòng chọn loại nhiên liệu' })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiPropertyOptional({ example: 1999, description: 'Dung tích xi lanh (cc)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  engineCc?: number;

  @ApiPropertyOptional({ example: 402, description: 'Công suất động cơ (mã lực HP)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  powerHp?: number;

  @ApiPropertyOptional({ example: 50, description: 'Dung tích bình nhiên liệu (Lít)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fuelTankLiters?: number;

  @ApiPropertyOptional({ example: 87.7, description: 'Dung lượng pin (kWh)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  batteryKwh?: number;

  @ApiPropertyOptional({ example: 471, description: 'Quãng đường di chuyển thuần điện (km)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  evRangeKm?: number;

  @ApiPropertyOptional({ example: 500, description: 'Thể tích khoang hành lý (Lít)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  trunkLiters?: number;

  @ApiPropertyOptional({ example: 7.2, description: 'Mức tiêu hao nhiên liệu (L/100km)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fuelConsumptionL100km?: number;

  @ApiPropertyOptional({ example: 2024, description: 'Năm ra mắt / Phiên bản năm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  launchYear?: number;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

