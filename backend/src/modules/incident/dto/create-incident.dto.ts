import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { IncidentType } from '@prisma/client';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Mã đơn hoặc ID đơn thuê xe liên quan', example: 'DH-2610-717858' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã hoặc ID đơn thuê xe' })
  bookingIdOrCode: string;

  @ApiProperty({
    enum: IncidentType,
    description: 'Loại sự cố: BREAKDOWN, ACCIDENT, LOST_ACCESSORY, THEFT, TRAFFIC_VIOLATION, OTHER',
    example: 'ACCIDENT',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn loại sự cố' })
  @IsEnum(IncidentType, { message: 'Loại sự cố không hợp lệ' })
  incidentType: IncidentType;

  @ApiProperty({ description: 'Tiêu đề tóm tắt sự cố', example: 'Va quẹt nhẹ gương chiếu hậu bên phụ' })
  @IsNotEmpty({ message: 'Vui lòng nhập tiêu đề sự cố' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mô tả chi tiết diễn biến sự cố', example: 'Khi lùi xe thì va quẹt vào chướng ngại vật...' })
  @IsNotEmpty({ message: 'Vui lòng mô tả chi tiết sự cố' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Địa điểm xảy ra sự cố', example: 'TP. Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Thời điểm xảy ra sự cố (ISO 8601)', example: '2026-12-10T14:30:00.000Z' })
  @IsOptional()
  @IsString()
  occurredAt?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ khẩn cấp', example: '0901234567' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Danh sách hình ảnh minh chứng', type: [String] })
  @IsOptional()
  @IsArray()
  evidencePhotos?: string[];
}

