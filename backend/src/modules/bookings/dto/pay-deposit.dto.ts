import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class PayDepositDto {
  @IsNotEmpty({ message: 'Vui lòng chọn phương thức thanh toán' })
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
