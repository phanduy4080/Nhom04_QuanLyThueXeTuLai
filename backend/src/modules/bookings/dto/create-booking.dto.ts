import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'Vui lòng cung cấp ID xe' })
  vehicleId: number;

  @IsNotEmpty({ message: 'Vui lòng cung cấp ngày nhận xe' })
  @IsDateString({}, { message: 'Ngày nhận xe không hợp lệ' })
  startDate: string;

  @IsNotEmpty({ message: 'Vui lòng cung cấp ngày trả xe' })
  @IsDateString({}, { message: 'Ngày trả xe không hợp lệ' })
  endDate: string;

  @IsNotEmpty({ message: 'Vui lòng nhập họ tên khách hàng' })
  @IsString()
  customerName: string;

  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsNumber()
  pickupBranchId?: number;

  @IsOptional()
  @IsNumber()
  returnBranchId?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
