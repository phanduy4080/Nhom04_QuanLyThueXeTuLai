import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái mới' })
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
