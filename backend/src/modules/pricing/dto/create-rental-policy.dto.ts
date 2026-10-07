import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateRentalPolicyDto {
  @ApiProperty({ example: 'POLICY_VIP_2026', description: 'Mã chính sách' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Chính Sách Thuê Xe VIP & Luxury', description: 'Tên chính sách' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Áp dụng cho các dòng xe sang Mercedes, BMW...', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 23, description: 'Độ tuổi người lái tối thiểu' })
  @IsNumber()
  @Min(18)
  @Max(80)
  minDriverAge: number;

  @ApiProperty({ example: 2.0, description: 'Số năm có bằng lái tối thiểu' })
  @IsNumber()
  @Min(0)
  minLicenseYears: number;

  @ApiProperty({ example: 15.0, description: 'Phí trả trễ theo giờ (% giá thuê ngày/giờ)' })
  @IsNumber()
  @Min(0)
  lateFeePercentPerHour: number;

  @ApiProperty({ example: 8000, description: 'Phí vượt km (VNĐ/km)' })
  @IsNumber()
  @Min(0)
  extraKmFee: number;

  @ApiProperty({ example: 300000, description: 'Phí rửa / vệ sinh xe nếu dơ (VNĐ)' })
  @IsNumber()
  @Min(0)
  cleaningFee: number;

  @ApiPropertyOptional({ description: 'Văn bản điều khoản hợp đồng' })
  @IsOptional()
  @IsString()
  termsText?: string;
}
