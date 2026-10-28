import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RejectBookingDto {
  @IsNotEmpty({ message: 'Vui lòng nhập lý do từ chối yêu cầu thuê xe' })
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
