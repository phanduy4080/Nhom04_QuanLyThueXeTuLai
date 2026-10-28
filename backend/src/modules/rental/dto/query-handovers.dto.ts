import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryHandoversDto {
  @ApiPropertyOptional({ example: 'CHECKOUT', description: 'Loại biên bản (CHECKOUT: giao xe, CHECKIN: nhận xe)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'COMPLETED', description: 'Trạng thái biên bản' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'DH-2610', description: 'Từ khóa tìm kiếm (Mã biên bản, mã đơn, tên khách, biển số)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'DH-2610-000041', description: 'Lọc theo mã đơn đặt xe' })
  @IsOptional()
  @IsString()
  bookingCode?: string;
}

