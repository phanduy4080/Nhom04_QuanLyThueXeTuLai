import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchDto {
  @ApiProperty({ example: 'CN_SGN_03', description: 'Mã chi nhánh (duy nhất)' })
  @IsNotEmpty({ message: 'Vui lòng nhập mã chi nhánh' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Trạm Xe Quận 7 - Phú Mỹ Hưng', description: 'Tên chi nhánh / trạm xe' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên chi nhánh / trạm xe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '101 Nguyễn Lương Bằng', description: 'Địa chỉ số nhà, đường' })
  @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
  @IsString()
  addressLine: string;

  @ApiPropertyOptional({ example: 'Phường Tân Phú', description: 'Phường / Xã' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: 'Quận 7', description: 'Quận / Huyện' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Tỉnh / Thành phố' })
  @IsNotEmpty({ message: 'Vui lòng nhập Tỉnh / Thành phố' })
  @IsString()
  province: string;

  @ApiPropertyOptional({ example: 10.7285, description: 'Vĩ độ GPS (Latitude)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.7214, description: 'Kinh độ GPS (Longitude)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '02854112233', description: 'Số điện thoại liên hệ' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'q7@quickhatch.vn', description: 'Email liên hệ' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: true, description: 'Cho phép khách nhận xe tại trạm' })
  @IsOptional()
  @IsBoolean()
  isPickupPoint?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '07:00', description: 'Giờ mở cửa' })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({ example: '21:00', description: 'Giờ đóng cửa' })
  @IsOptional()
  @IsString()
  closeTime?: string;
}

