import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { IncidentStatus, LiableParty } from '@prisma/client';

export class UpdateIncidentClaimDto {
  @ApiPropertyOptional({ enum: IncidentStatus, description: 'Trạng thái xử lý sự cố' })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  // Bảo hiểm (US-19)
  @ApiPropertyOptional({ description: 'Số hồ sơ khiếu nại bảo hiểm', example: 'BH-2026-PTI-88992' })
  @IsOptional()
  @IsString()
  insuranceClaimNumber?: string;

  @ApiPropertyOptional({ description: 'Tên đơn vị bảo hiểm', example: 'Bảo hiểm Quân Đội (MIC) / PVI' })
  @IsOptional()
  @IsString()
  insurerName?: string;

  @ApiPropertyOptional({ description: 'Họ tên giám định viên bảo hiểm', example: 'Trần Văn Giám Định' })
  @IsOptional()
  @IsString()
  insuranceAppraiser?: string;

  @ApiPropertyOptional({ description: 'SĐT giám định viên', example: '0988776655' })
  @IsOptional()
  @IsString()
  insuranceContact?: string;

  @ApiPropertyOptional({ description: 'Trạng thái duyệt bảo hiểm', example: 'APPROVED' })
  @IsOptional()
  @IsString()
  insuranceStatus?: string;

  @ApiPropertyOptional({ description: 'Ghi chú quá trình làm việc bảo hiểm' })
  @IsOptional()
  @IsString()
  insuranceNotes?: string;

  // Phân định trách nhiệm & Chi phí (US-19)
  @ApiPropertyOptional({ description: 'Tổng chi phí sửa chữa / thiệt hại (VNĐ)', example: 5000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDamageCost?: number;

  @ApiPropertyOptional({ description: 'Số tiền bảo hiểm chi trả (VNĐ)', example: 3500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceCoverageAmount?: number;

  @ApiPropertyOptional({ description: 'Số tiền công ty hỗ trợ / miễn thường (VNĐ)', example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  companyShareAmount?: number;

  @ApiPropertyOptional({ description: 'Số tiền khách hàng chịu trách nhiệm bồi thường (VNĐ)', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customerShareAmount?: number;

  @ApiPropertyOptional({ description: 'Số tiền cấn trừ từ tiền cọc của khách hàng (VNĐ)', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductedFromDeposit?: number;

  @ApiPropertyOptional({ description: 'Trạng thái thanh toán của khách', example: 'DEDUCTED_FROM_DEPOSIT' })
  @IsOptional()
  @IsString()
  customerPaymentStatus?: string;

  @ApiPropertyOptional({ enum: LiableParty, description: 'Bên chịu trách nhiệm chính' })
  @IsOptional()
  @IsEnum(LiableParty)
  liabilityParty?: LiableParty;

  @ApiPropertyOptional({ description: 'Biên bản phân định trách nhiệm' })
  @IsOptional()
  @IsString()
  liabilityNotes?: string;

  @ApiPropertyOptional({ description: 'Kết luận và thỏa thuận bồi thường' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}

