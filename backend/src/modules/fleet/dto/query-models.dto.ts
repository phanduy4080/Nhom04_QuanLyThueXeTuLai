import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryModelsDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên model, hãng, biến thể)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ID hãng xe' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo ID phân khúc' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: true, description: 'Bao gồm cả các dòng xe ngưng kích hoạt' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;
}

