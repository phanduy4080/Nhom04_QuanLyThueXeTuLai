import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewVerificationDto {
  @IsNotEmpty({ message: 'Vui lòng cung cấp trạng thái xét duyệt' })
  @IsIn(['APPROVED', 'REJECTED', 'REQUIRES_REVIEW'], {
    message: 'Trạng thái phải là APPROVED, REJECTED, hoặc REQUIRES_REVIEW',
  })
  verificationStatus: 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW';

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

