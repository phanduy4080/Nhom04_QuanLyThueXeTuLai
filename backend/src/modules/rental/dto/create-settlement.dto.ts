import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({ description: 'ID hoặc Mã đơn đặt xe', example: 'DH-2610-717858' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã đơn đặt xe' })
  bookingId: string;

  @ApiPropertyOptional({ description: 'ID biên bản trả xe liên quan' })
  @IsOptional()
  @IsNumber()
  handoverId?: number;

  @ApiPropertyOptional({ description: 'Tiền bồi thường sự cố / thiệt hại sau khi trừ bảo hiểm (US-19/US-23/US-24)', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  damageCompensation?: number;

  @ApiPropertyOptional({ description: 'Phương thức thanh toán / hoàn cọc', example: 'BANK_TRANSFER' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Ghi chú quyết toán hợp đồng' })
  @IsOptional()
  @IsString()
  notes?: string;
}
