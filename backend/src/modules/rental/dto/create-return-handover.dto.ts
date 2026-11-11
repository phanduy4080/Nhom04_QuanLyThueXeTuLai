import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';

export class CreateReturnHandoverDto {
  @ApiProperty({ description: 'ID hoặc Mã đơn đặt xe', example: 'DH-2610-717858' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã đơn đặt xe' })
  bookingId: string;

  @ApiProperty({ description: 'Số km đồng hồ ODO khi khách trả xe', example: 10450 })
  @IsNotEmpty({ message: 'Vui lòng nhập số ODO khi trả xe' })
  @IsNumber()
  @Min(0)
  returnOdo: number;

  @ApiProperty({ description: 'Mức nhiên liệu / Pin khi trả xe (%)', example: 90 })
  @IsNotEmpty({ message: 'Vui lòng nhập mức nhiên liệu khi trả xe' })
  @IsNumber()
  returnFuelPercent: number;

  @ApiPropertyOptional({ description: 'Thời điểm trả xe thực tế (ISO 8601)' })
  @IsOptional()
  @IsString()
  actualReturnTime?: string;

  @ApiPropertyOptional({ description: 'Nội thất có bẩn hoặc có mùi thuốc lá cần phụ phí vệ sinh', example: false })
  @IsOptional()
  @IsBoolean()
  isInteriorDirty?: boolean;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết hư hỏng mới phát sinh (nếu có)' })
  @IsOptional()
  @IsString()
  newDamages?: string;

  @ApiPropertyOptional({ description: 'Chi phí ước tính sửa chữa hư hỏng mới (VNĐ)', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  newDamagesFee?: number;

  @ApiPropertyOptional({ description: 'Chuyển sang quy trình thẩm định thiệt hại & tranh chấp (US-23)', example: false })
  @IsOptional()
  @IsBoolean()
  isDisputed?: boolean;

  @ApiPropertyOptional({ description: 'Lý do khiếu nại / tranh chấp' })
  @IsOptional()
  @IsString()
  disputeReason?: string;

  @ApiPropertyOptional({ description: 'Danh sách ảnh chụp kiểm tra xe khi trả (Base64 hoặc URL)', type: [String] })
  @IsOptional()
  @IsArray()
  inspectionPhotos?: string[];

  @ApiPropertyOptional({ description: 'Ghi chú tổng thể tình trạng xe khi hoàn trả' })
  @IsOptional()
  @IsString()
  carCondition?: string;

  @ApiPropertyOptional({ description: 'Họ tên nhân viên phụ trách kiểm tra' })
  @IsOptional()
  @IsString()
  staffName?: string;
}
