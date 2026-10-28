import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail, IsDateString, IsBoolean } from 'class-validator';

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

  // US-07: Hồ sơ định danh & GPLX người thuê chính
  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  driverDob?: string;

  @IsOptional()
  @IsString()
  licenseClass?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày hết hạn GPLX không hợp lệ' })
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  idCardFront?: string;

  @IsOptional()
  @IsString()
  idCardBack?: string;

  @IsOptional()
  @IsString()
  licenseFront?: string;

  @IsOptional()
  @IsString()
  licenseBack?: string;

  // US-09: Thông tin người lái bổ sung (Additional Driver)
  @IsOptional()
  @IsBoolean()
  hasAdditionalDriver?: boolean;

  @IsOptional()
  @IsString()
  additionalDriverName?: string;

  @IsOptional()
  @IsString()
  additionalDriverPhone?: string;

  @IsOptional()
  @IsString()
  additionalDriverEmail?: string;

  @IsOptional()
  @IsString()
  additionalDriverIdNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh người lái phụ không hợp lệ' })
  additionalDriverDob?: string;

  @IsOptional()
  @IsString()
  additionalDriverLicenseNumber?: string;

  @IsOptional()
  @IsString()
  additionalDriverLicenseClass?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Hạn GPLX người lái phụ không hợp lệ' })
  additionalDriverLicenseExpiry?: string;

  @IsOptional()
  @IsString()
  additionalDriverLicenseFront?: string;

  @IsOptional()
  @IsString()
  additionalDriverLicenseBack?: string;

  @IsOptional()
  @IsNumber()
  additionalDriverFee?: number;

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
