import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CalculateRentalPriceDto {
  @ApiProperty({ example: '1', description: 'ID của xe' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp ID xe' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: '2026-10-15T08:00:00.000Z', description: 'Thời gian bắt đầu nhận xe' })
  @IsNotEmpty({ message: 'Vui lòng chọn thời gian nhận xe' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-18T20:00:00.000Z', description: 'Thời gian trả xe' })
  @IsNotEmpty({ message: 'Vui lòng chọn thời gian trả xe' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 1, description: 'ID gói bảo hiểm lựa chọn' })
  @IsOptional()
  @IsNumber()
  insurancePackageId?: number;

  @ApiPropertyOptional({ example: [1, 2], description: 'Danh sách ID dịch vụ gia tăng (ghế trẻ em, camera...)' })
  @IsOptional()
  @IsArray()
  extraIds?: number[];

  @ApiPropertyOptional({ example: 'QUICKHATCH10', description: 'Mã giảm giá (khuyến mãi)' })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
