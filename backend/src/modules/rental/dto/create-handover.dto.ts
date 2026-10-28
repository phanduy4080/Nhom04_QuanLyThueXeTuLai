import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsObject, Min } from 'class-validator';

export class DamageItemDto {
  @ApiProperty({ example: 'Cản trước bên phụ', description: 'Vị trí vết xước hoặc hư hỏng' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ example: 'Vết xước dài 5cm, trầy sơn nhẹ', description: 'Mô tả chi tiết hư hỏng' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'LOW', enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'Mức độ nghiêm trọng' })
  @IsOptional()
  @IsString()
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class CreateHandoverDto {
  @ApiProperty({ example: 1, description: 'ID đơn đặt xe (hoặc có thể dùng bookingCode)' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp bookingId hoặc bookingCode' })
  bookingId: number | string;

  @ApiPropertyOptional({ example: 1, description: 'ID xe bàn giao (nếu không truyền sẽ lấy từ booking)' })
  @IsOptional()
  vehicleId?: number | string;

  @ApiPropertyOptional({ example: 'CHECKOUT', enum: ['CHECKOUT', 'CHECKIN'], description: 'Loại biên bản: CHECKOUT (Giao xe) hoặc CHECKIN (Nhận xe)' })
  @IsOptional()
  @IsString()
  type?: 'CHECKOUT' | 'CHECKIN';

  @ApiProperty({ example: 12500, description: 'Số km thực tế trên đồng hồ (ODO) lúc bàn giao xe' })
  @IsNotEmpty({ message: 'Vui lòng nhập số km (ODO) hiện tại' })
  @IsNumber()
  @Min(0, { message: 'Số km ODO không thể âm' })
  odoMeter: number;

  @ApiProperty({ example: 'Pin 95% (hoặc Xăng 8/8 vạch)', description: 'Mức nhiên liệu hoặc pin lúc bàn giao' })
  @IsNotEmpty({ message: 'Vui lòng ghi nhận mức nhiên liệu/pin' })
  @IsString()
  fuelLevel: string;

  @ApiPropertyOptional({ example: 'Xe sạch sẽ, hoạt động bình thường, ghi nhận 1 vết xước cản trước', description: 'Đánh giá chung hiện trạng xe' })
  @IsOptional()
  @IsString()
  carCondition?: string;

  @ApiPropertyOptional({
    description: 'Danh sách kiểm tra các hạng mục nội ngoại thất & phụ kiện giấy tờ',
    example: {
      exterior: { bodyClean: true, lightsOk: true, mirrorsOk: true, tiresOk: true, windshieldOk: true },
      interior: { seatsClean: true, steeringWheelOk: true, acOk: true, odorFree: true, matsOk: true },
      accessories: { registrationDoc: true, insuranceCert: true, spareTire: true, toolKit: true, dashcam: true },
    },
  })
  @IsOptional()
  @IsObject()
  checklist?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Danh sách các vết trầy xước, móp méo hoặc hư hỏng cũ có sẵn trước khi giao',
    type: [DamageItemDto],
  })
  @IsOptional()
  @IsArray()
  damages?: DamageItemDto[];

  @ApiPropertyOptional({
    description: 'Danh sách URL ảnh chụp thực tế hiện trạng xe (4 góc xe, ODO, nội thất, vết xước)',
    example: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    ],
  })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional({
    description: 'Thông tin chữ ký hoặc xác nhận số của nhân viên và khách thuê',
    example: {
      staffSignature: 'Nguyễn Văn Phụ Trách',
      customerSignature: 'Trần Thị Bích',
    },
  })
  @IsOptional()
  @IsObject()
  signatures?: {
    staffSignature?: string;
    customerSignature?: string;
  };

  @ApiPropertyOptional({ example: 'Nguyễn Văn Phụ Trách', description: 'Họ tên nhân viên phụ trách giao xe' })
  @IsOptional()
  @IsString()
  staffName?: string;

  @ApiPropertyOptional({ example: 'Khách hàng yêu cầu kiểm tra kỹ lốp dự phòng', description: 'Ghi chú thêm' })
  @IsOptional()
  @IsString()
  notes?: string;
}
