import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { IncidentStatus, IncidentType } from '@prisma/client';

export class QueryIncidentDto {
  @ApiPropertyOptional({ enum: IncidentStatus })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @ApiPropertyOptional({ enum: IncidentType })
  @IsOptional()
  @IsEnum(IncidentType)
  incidentType?: IncidentType;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo mã đơn, biển số xe, tên khách hàng hoặc mã sự cố' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID đơn đặt xe' })
  @IsOptional()
  bookingId?: number;
}
