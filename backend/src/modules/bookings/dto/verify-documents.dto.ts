import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export class VerifyDocumentsDto {
  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

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

  // Additional driver
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
}
