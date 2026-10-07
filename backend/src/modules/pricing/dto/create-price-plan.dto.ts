import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PricePlanType, PriceScope } from '@prisma/client';

export class PriceTierDto {
  @ApiProperty({ example: 1, description: 'Số ngày tối thiểu áp dụng bậc giá này' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  minDays: number;

  @ApiPropertyOptional({ example: 7, description: 'Số ngày tối đa (NULL nếu không giới hạn)' })
  @IsOptional()
  @IsNumber()
  maxDays?: number;

  @ApiProperty({ example: 1000000, description: 'Đơn giá thuê theo ngày cho bậc này (VNĐ/ngày)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pricePerDay: number;
}

export class CreatePricePlanDto {
  @ApiProperty({ example: 'Bảng giá xe VinFast VF8 theo ngày 2026', description: 'Tên bảng giá' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên bảng giá' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['DAILY', 'PERIOD'], example: 'DAILY', description: 'Loại bảng giá' })
  @IsNotEmpty()
  @IsEnum(PricePlanType)
  planType: PricePlanType;

  @ApiProperty({ enum: ['VEHICLE', 'MODEL', 'CATEGORY'], example: 'MODEL', description: 'Phạm vi áp dụng' })
  @IsNotEmpty()
  @IsEnum(PriceScope)
  scope: PriceScope;

  @ApiPropertyOptional({ example: 1, description: 'Model ID nếu scope là MODEL' })
  @IsOptional()
  @IsNumber()
  modelId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Category ID nếu scope là CATEGORY' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: '1', description: 'Vehicle ID nếu scope là VEHICLE' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Chi nhánh áp dụng (NULL = toàn quốc)' })
  @IsOptional()
  @IsNumber()
  branchId?: number;

  @ApiProperty({ type: [PriceTierDto], description: 'Danh sách các bậc giá theo số ngày thuê' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTierDto)
  tiers: PriceTierDto[];
}
