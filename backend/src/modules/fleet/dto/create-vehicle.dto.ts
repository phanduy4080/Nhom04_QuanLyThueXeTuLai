import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { TransmissionType, FuelType } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: '51K-888.88', description: 'Biển số xe (duy nhất)' })
  @IsNotEmpty({ message: 'Vui lòng nhập biển số xe' })
  @IsString()
  licensePlate: string;

  @ApiPropertyOptional({ example: 'XE-VF8-001', description: 'Mã tài sản nội bộ' })
  @IsOptional()
  @IsString()
  assetCode?: string;

  @ApiProperty({ example: 1, description: 'ID dòng xe (Model ID)' })
  @IsNotEmpty({ message: 'Vui lòng chọn dòng xe' })
  @IsNumber()
  modelId: number;

  @ApiPropertyOptional({ example: 2024, description: 'Năm sản xuất' })
  @IsOptional()
  @IsNumber()
  @Min(1990)
  @Max(2100)
  manufactureYear?: number;

  @ApiPropertyOptional({ example: 'Trắng Trân Châu', description: 'Màu sắc ngoại thất' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 5, description: 'Số chỗ ngồi' })
  @IsOptional()
  @IsNumber()
  seats?: number;

  @ApiProperty({ enum: ['MANUAL', 'AUTOMATIC'], example: 'AUTOMATIC', description: 'Hộp số' })
  @IsNotEmpty({ message: 'Vui lòng chọn loại hộp số' })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({
    enum: ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'LPG'],
    example: 'ELECTRIC',
    description: 'Loại nhiên liệu',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn loại nhiên liệu' })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ example: 1200000, description: 'Giá thuê niêm yết theo ngày (VNĐ/ngày)' })
  @IsNotEmpty({ message: 'Vui lòng nhập giá thuê ngày' })
  @IsNumber()
  @Min(0)
  listPricePerDay: number;

  @ApiProperty({ example: 10000000, description: 'Tiền thế chấp / cọc nhận xe (VNĐ)' })
  @IsNotEmpty({ message: 'Vui lòng nhập tiền cọc' })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiPropertyOptional({ example: 300, description: 'Giới hạn quãng đường km/ngày (NULL nếu không giới hạn)' })
  @IsOptional()
  @IsNumber()
  dailyKmLimit?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Phí phụ thu mỗi km vượt giới hạn (VNĐ/km)' })
  @IsOptional()
  @IsNumber()
  extraKmFee?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID Chi nhánh / Vị trí hiện tại của xe' })
  @IsOptional()
  @IsNumber()
  currentBranchId?: number;

  @ApiPropertyOptional({ example: 'Xe mới nhập 100%, bảo dưỡng định kỳ chính hãng', description: 'Ghi chú về xe' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Danh sách URL hình ảnh của xe (ảnh đầu tiên là ảnh đại diện chính)',
  })
  @IsOptional()
  images?: string[];
}
