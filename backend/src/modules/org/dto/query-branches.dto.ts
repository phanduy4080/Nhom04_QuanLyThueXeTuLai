import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBranchesDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (tên, mã, địa chỉ, tỉnh/thành phố)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo Tỉnh / Thành phố' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: true, description: 'Bao gồm cả các chi nhánh ngưng hoạt động' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;
}

