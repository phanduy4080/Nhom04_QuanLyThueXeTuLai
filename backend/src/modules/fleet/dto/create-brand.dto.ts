import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'VinFast', description: 'Tên hãng xe' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên hãng xe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Việt Nam', description: 'Quốc gia xuất xứ' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'URL ảnh logo hãng xe' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
