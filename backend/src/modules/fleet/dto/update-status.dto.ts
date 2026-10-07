import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class UpdateVehicleStatusDto {
  @ApiProperty({
    enum: [
      'AVAILABLE',
      'HELD',
      'BOOKED',
      'RENTED',
      'INSPECTING',
      'MAINTENANCE',
      'REPAIRING',
      'SUSPENDED',
    ],
    example: 'MAINTENANCE',
    description: 'Trạng thái mới của xe',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái mới' })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;

  @ApiPropertyOptional({ example: 'Đưa vào xưởng bảo dưỡng mốc 15,000 km', description: 'Lý do thay đổi trạng thái' })
  @IsOptional()
  @IsString()
  reason?: string;
}
