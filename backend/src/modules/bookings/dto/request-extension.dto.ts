import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestExtensionDto {
  @ApiProperty({
    example: '2026-11-15T18:00:00.000Z',
    description: 'Thời gian trả xe mới mong muốn gia hạn (phải sau thời gian trả xe hiện tại)',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn thời gian trả xe mới' })
  @IsDateString({}, { message: 'Định dạng ngày giờ không hợp lệ (ISO 8601)' })
  newEndDate: string;

  @ApiPropertyOptional({
    example: 'Tôi có việc đột xuất và muốn trải nghiệm thêm 2 ngày du lịch',
    description: 'Lý do xin gia hạn thời gian thuê xe',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
