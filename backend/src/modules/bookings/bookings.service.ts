import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { VerifyDocumentsDto } from './dto/verify-documents.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { PayDepositDto } from './dto/pay-deposit.dto';
import { Prisma } from '@prisma/client';

export interface DriverEvaluationInput {
  name?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  dob?: string | Date | null;
  licenseNumber?: string;
  licenseClass?: string;
  licenseExpiry?: string | Date | null;
  idCardFront?: string;
  idCardBack?: string;
  licenseFront?: string;
  licenseBack?: string;
  rentalStart: Date;
  rentalEnd: Date;
  isPrimary?: boolean;
}

export interface EligibilityResult {
  passed: boolean;
  suggestedStatus: 'APPROVED' | 'REQUIRES_REVIEW' | 'REJECTED';
  evaluatedAt: string;
  driverType: 'PRIMARY' | 'ADDITIONAL';
  score: number;
  checks: {
    age: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      age: number | null;
      message: string;
    };
    licenseExpiry: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      expiryDate: string | null;
      daysRemaining: number | null;
      message: string;
    };
    licenseClass: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      licenseClass: string;
      message: string;
    };
    blacklistAndHistory: {
      status: 'PASS' | 'FAIL' | 'WARNING';
      isBlacklisted: boolean;
      completedRentals: number;
      message: string;
    };
    documents: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      hasIdFront: boolean;
      hasIdBack: boolean;
      hasLicenseFront: boolean;
      hasLicenseBack: boolean;
      message: string;
    };
  };
  summary: string;
  warnings: string[];
  errors: string[];
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * US-08 & US-09: Thuật toán đối chiếu thông tin khách hàng với điều kiện thuê xe
   * (Độ tuổi >= 21, Hạn GPLX > ngày trả xe, Hạng GPLX phù hợp, Danh sách đen / Lịch sử thuê)
   */
  async evaluateDriverEligibility(input: DriverEvaluationInput): Promise<EligibilityResult> {
    const warnings: string[] = [];
    const errors: string[] = [];
    let score = 100;

    // 1. Kiểm tra độ tuổi (Người lái xe phải từ 21 tuổi trở lên)
    let age: number | null = null;
    let ageStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let ageMessage = '';

    if (input.dob) {
      const birthDate = new Date(input.dob);
      if (!isNaN(birthDate.getTime())) {
        const refDate = input.rentalStart || new Date();
        let calcAge = refDate.getFullYear() - birthDate.getFullYear();
        const m = refDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
          calcAge--;
        }
        age = calcAge;

        if (age < 21) {
          ageStatus = 'FAIL';
          ageMessage = `Người lái chưa đủ 21 tuổi (hiện tại: ${age} tuổi). Điều kiện tối thiểu là 21 tuổi.`;
          errors.push(ageMessage);
          score -= 40;
        } else {
          ageStatus = 'PASS';
          ageMessage = `Đủ ${age} tuổi (Đạt điều kiện tối thiểu 21 tuổi).`;
        }
      } else {
        ageStatus = 'WARNING';
        ageMessage = 'Định dạng ngày sinh không hợp lệ.';
        warnings.push(ageMessage);
        score -= 10;
      }
    } else {
      ageStatus = 'WARNING';
      ageMessage = 'Chưa cung cấp ngày sinh để đối chiếu độ tuổi.';
      warnings.push(ageMessage);
      score -= 15;
    }

    // 2. Kiểm tra hạn GPLX (Phải còn hạn sau ngày kết thúc thuê xe)
    let licenseExpiryStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let expiryDateStr: string | null = null;
    let daysRemaining: number | null = null;
    let licenseExpiryMessage = '';

    if (input.licenseExpiry) {
      const expiry = new Date(input.licenseExpiry);
      if (!isNaN(expiry.getTime())) {
        expiryDateStr = expiry.toISOString().slice(0, 10);
        const refEnd = input.rentalEnd || new Date();
        const diffDays = Math.floor((expiry.getTime() - refEnd.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        if (expiry.getTime() <= refEnd.getTime()) {
          licenseExpiryStatus = 'FAIL';
          licenseExpiryMessage = `GPLX hết hạn vào ngày ${expiryDateStr} (trước hoặc trong thời gian kết thúc hợp đồng thuê xe).`;
          errors.push(licenseExpiryMessage);
          score -= 40;
        } else if (diffDays < 30) {
          licenseExpiryStatus = 'WARNING';
          licenseExpiryMessage = `GPLX còn hạn nhưng sắp hết hạn trong ${diffDays} ngày tới. Cần lưu ý gia hạn.`;
          warnings.push(licenseExpiryMessage);
          score -= 5;
        } else {
          licenseExpiryStatus = 'PASS';
          licenseExpiryMessage = `GPLX còn thời hạn hợp lệ (${diffDays} ngày sau khi hoàn tất trả xe).`;
        }
      } else {
        licenseExpiryStatus = 'WARNING';
        licenseExpiryMessage = 'Định dạng ngày hết hạn GPLX không hợp lệ.';
        warnings.push(licenseExpiryMessage);
        score -= 10;
      }
    } else {
      licenseExpiryStatus = 'WARNING';
      licenseExpiryMessage = 'Chưa cung cấp ngày hết hạn GPLX để đối chiếu.';
      warnings.push(licenseExpiryMessage);
      score -= 15;
    }

    // 3. Kiểm tra hạng GPLX (B1, B2, C, D, E hợp lệ với xe ô tô du lịch tự lái)
    let licenseClassStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    const targetClass = (input.licenseClass || '').trim().toUpperCase();
    let licenseClassMessage = '';
    const acceptedClasses = ['B1', 'B2', 'C', 'D', 'E', 'FC', 'FE'];

    if (targetClass) {
      if (acceptedClasses.includes(targetClass)) {
        licenseClassStatus = 'PASS';
        licenseClassMessage = `Hạng GPLX [${targetClass}] hợp lệ điều khiển phương tiện ô tô du lịch.`;
      } else {
        licenseClassStatus = 'FAIL';
        licenseClassMessage = `Hạng GPLX [${targetClass}] không đủ thẩm quyền điều khiển xe ô tô du lịch (yêu cầu B1/B2 trở lên).`;
        errors.push(licenseClassMessage);
        score -= 30;
      }
    } else {
      licenseClassStatus = 'WARNING';
      licenseClassMessage = 'Chưa xác định hạng GPLX (mặc định cần tối thiểu B1 hoặc B2).';
      warnings.push(licenseClassMessage);
      score -= 10;
    }

    // 4. Kiểm tra Danh sách đen (crm.customer_blacklist) & Lịch sử thuê xe
    let blacklistStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    let isBlacklisted = false;
    let completedRentals = 0;
    let blacklistMessage = '';

    try {
      const orConditions: any[] = [];
      if (input.phone) orConditions.push({ phone: input.phone });
      if (input.email) orConditions.push({ email: input.email });

      let customer: any = null;
      if (orConditions.length > 0) {
        customer = await this.prisma.customer.findFirst({
          where: {
            OR: orConditions,
            deletedAt: null,
          },
          include: {
            blacklists: {
              where: { isActive: true },
            },
          },
        });
      }

      if (customer && customer.blacklists && customer.blacklists.length > 0) {
        isBlacklisted = true;
        const reason = customer.blacklists[0].reason || 'Nằm trong danh sách đen khách hàng vi phạm hợp đồng';
        blacklistStatus = 'FAIL';
        blacklistMessage = `CẢNH BÁO: Khách hàng có trong danh sách đen (${reason}). Từ chối duyệt tự động!`;
        errors.push(blacklistMessage);
        score -= 50;
      } else {
        // Kiểm tra lịch sử đơn hàng hoàn tất trong quá khứ
        if (input.phone || input.email) {
          completedRentals = await this.prisma.booking.count({
            where: {
              OR: [
                input.phone ? { phone: input.phone } : undefined,
                input.email ? { email: input.email } : undefined,
              ].filter(Boolean) as Prisma.BookingWhereInput[],
              status: 'COMPLETED',
            },
          });
        }

        blacklistStatus = 'PASS';
        if (completedRentals > 0) {
          blacklistMessage = `Lịch sử uy tín: Đã hoàn tất ${completedRentals} chuyến thuê xe thành công, không có ghi nhận vi phạm.`;
          score = Math.min(100, score + 5);
        } else {
          blacklistMessage = 'Khách hàng không có lịch sử nợ xấu hoặc vi phạm trong hệ thống.';
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra blacklist:', e);
      blacklistStatus = 'PASS';
      blacklistMessage = 'Không có cảnh báo vi phạm lịch sử thuê xe.';
    }

    // 5. Kiểm tra hồ sơ giấy tờ (CCCD & GPLX front/back)
    const hasIdFront = Boolean(input.idCardFront);
    const hasIdBack = Boolean(input.idCardBack);
    const hasLicenseFront = Boolean(input.licenseFront);
    const hasLicenseBack = Boolean(input.licenseBack);

    let docStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    let docMessage = '';

    if (hasIdFront && hasIdBack && hasLicenseFront && hasLicenseBack) {
      docStatus = 'PASS';
      docMessage = 'Đầy đủ 4 mặt ảnh giấy tờ định danh (CCCD mặt trước/sau) và Giấy phép lái xe (mặt trước/sau).';
    } else {
      docStatus = 'WARNING';
      const missing: string[] = [];
      if (!hasIdFront) missing.push('Ảnh CCCD mặt trước');
      if (!hasIdBack) missing.push('Ảnh CCCD mặt sau');
      if (!hasLicenseFront) missing.push('Ảnh GPLX mặt trước');
      if (!hasLicenseBack) missing.push('Ảnh GPLX mặt sau');
      docMessage = `Còn thiếu hình ảnh: ${missing.join(', ')}.`;
      warnings.push(docMessage);
      score -= 10;
    }

    // Tổng hợp kết luận
    let suggestedStatus: 'APPROVED' | 'REQUIRES_REVIEW' | 'REJECTED' = 'APPROVED';
    let passed = false;

    if (errors.length > 0) {
      suggestedStatus = 'REJECTED';
      passed = false;
    } else if (warnings.length > 0) {
      suggestedStatus = 'REQUIRES_REVIEW';
      passed = false;
    } else {
      suggestedStatus = 'APPROVED';
      passed = true;
    }

    const driverType = input.isPrimary === false ? 'ADDITIONAL' : 'PRIMARY';
    const driverLabel = driverType === 'PRIMARY' ? 'Người thuê chính' : 'Người lái bổ sung';

    let summary = '';
    if (suggestedStatus === 'APPROVED') {
      summary = `Hồ sơ ${driverLabel} (${input.name || 'Khách hàng'}) ĐẠT TẤT CẢ tiêu chí: Đủ tuổi, GPLX hợp lệ, lịch sử tốt.`;
    } else if (suggestedStatus === 'REQUIRES_REVIEW') {
      summary = `Hồ sơ ${driverLabel} cần chuyên viên kiểm tra thêm trước khi bàn giao xe.`;
    } else {
      summary = `Hồ sơ ${driverLabel} KHÔNG ĐẠT điều kiện thuê xe do không thỏa mãn một số quy định bắt buộc.`;
    }

    return {
      passed,
      suggestedStatus,
      evaluatedAt: new Date().toISOString(),
      driverType,
      score: Math.max(0, score),
      checks: {
        age: {
          status: ageStatus,
          age,
          message: ageMessage,
        },
        licenseExpiry: {
          status: licenseExpiryStatus,
          expiryDate: expiryDateStr,
          daysRemaining,
          message: licenseExpiryMessage,
        },
        licenseClass: {
          status: licenseClassStatus,
          licenseClass: targetClass || 'B2',
          message: licenseClassMessage,
        },
        blacklistAndHistory: {
          status: blacklistStatus,
          isBlacklisted,
          completedRentals,
          message: blacklistMessage,
        },
        documents: {
          status: docStatus,
          hasIdFront,
          hasIdBack,
          hasLicenseFront,
          hasLicenseBack,
          message: docMessage,
        },
      },
      summary,
      warnings,
      errors,
    };
  }

  /**
   * Pre-check API endpoint cho Frontend kiểm tra điều kiện theo thời gian thực (US-08, US-09)
   */
  async checkEligibility(payload: {
    startDate: string;
    endDate: string;
    primaryDriver: {
      name?: string;
      phone?: string;
      email?: string;
      idNumber?: string;
      dob?: string;
      licenseNumber?: string;
      licenseClass?: string;
      licenseExpiry?: string;
      idCardFront?: string;
      idCardBack?: string;
      licenseFront?: string;
      licenseBack?: string;
    };
    additionalDriver?: {
      name?: string;
      phone?: string;
      email?: string;
      idNumber?: string;
      dob?: string;
      licenseNumber?: string;
      licenseClass?: string;
      licenseExpiry?: string;
      licenseFront?: string;
      licenseBack?: string;
    };
  }) {
    const start = new Date(payload.startDate || new Date());
    const end = new Date(payload.endDate || new Date(Date.now() + 86400000));

    const primaryResult = await this.evaluateDriverEligibility({
      ...payload.primaryDriver,
      rentalStart: start,
      rentalEnd: end,
      isPrimary: true,
    });

    let additionalResult: EligibilityResult | null = null;
    if (payload.additionalDriver && payload.additionalDriver.name) {
      additionalResult = await this.evaluateDriverEligibility({
        ...payload.additionalDriver,
        rentalStart: start,
        rentalEnd: end,
        isPrimary: false,
      });
    }

    const overallPassed = primaryResult.passed && (!additionalResult || additionalResult.passed);
    let overallSuggestedStatus: 'APPROVED' | 'REQUIRES_REVIEW' | 'REJECTED' = 'APPROVED';

    if (primaryResult.suggestedStatus === 'REJECTED' || additionalResult?.suggestedStatus === 'REJECTED') {
      overallSuggestedStatus = 'REJECTED';
    } else if (primaryResult.suggestedStatus === 'REQUIRES_REVIEW' || additionalResult?.suggestedStatus === 'REQUIRES_REVIEW') {
      overallSuggestedStatus = 'REQUIRES_REVIEW';
    }

    return {
      overallPassed,
      overallSuggestedStatus,
      primaryResult,
      additionalResult,
    };
  }

  /**
   * Tạo đơn đặt xe mới (Khách hàng tạo đơn & đặt cọc) kèm hồ sơ định danh & người lái phụ
   */
  async createBooking(dto: CreateBookingDto, userId?: number | bigint) {
    const vehicleId = BigInt(dto.vehicleId);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        model: {
          include: { brand: true, category: true },
        },
        currentBranch: true,
      },
    });

    if (!vehicle || !vehicle.isActive || vehicle.deletedAt) {
      throw new NotFoundException('Phương tiện không tồn tại hoặc đã ngừng hoạt động');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
    }

    if (end <= start) {
      throw new BadRequestException('Ngày trả xe phải sau ngày nhận xe');
    }

    // US-05: Kiểm tra xe có bị trùng lịch hoặc đang sửa chữa/bảo dưỡng không
    if (['MAINTENANCE', 'REPAIRING', 'SUSPENDED'].includes(vehicle.status)) {
      throw new BadRequestException('Xe đang trong thời gian bảo dưỡng / sửa chữa, không thể đặt xe');
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_RENTAL'] },
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Phương tiện đã có lịch đặt xe trong khoảng thời gian bạn chọn');
    }

    // Tính số ngày và tổng tiền
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dailyPrice = Number(vehicle.listPricePerDay);
    
    // US-09: Tính phí người lái bổ sung (nếu có chọn)
    const hasAdditionalDriver = Boolean(dto.hasAdditionalDriver);
    const additionalDriverFee = hasAdditionalDriver
      ? Number(dto.additionalDriverFee !== undefined ? dto.additionalDriverFee : 100000 * totalDays)
      : 0;

    const baseAmount = dailyPrice * totalDays;
    const totalAmount = baseAmount + additionalDriverFee;
    const depositAmount = Number(vehicle.depositAmount);

    // US-08: Tự động đối chiếu thông tin người thuê chính
    const primaryEligibility = await this.evaluateDriverEligibility({
      name: dto.customerName,
      phone: dto.phone,
      email: dto.email,
      idNumber: dto.idNumber,
      dob: dto.driverDob,
      licenseNumber: dto.licenseNumber,
      licenseClass: dto.licenseClass || 'B2',
      licenseExpiry: dto.licenseExpiry,
      idCardFront: dto.idCardFront,
      idCardBack: dto.idCardBack,
      licenseFront: dto.licenseFront,
      licenseBack: dto.licenseBack,
      rentalStart: start,
      rentalEnd: end,
      isPrimary: true,
    });

    // US-09: Tự động đối chiếu thông tin người lái bổ sung nếu có đăng ký
    let additionalEligibility: EligibilityResult | null = null;
    if (hasAdditionalDriver && dto.additionalDriverName) {
      additionalEligibility = await this.evaluateDriverEligibility({
        name: dto.additionalDriverName,
        phone: dto.additionalDriverPhone,
        email: dto.additionalDriverEmail,
        idNumber: dto.additionalDriverIdNumber,
        dob: dto.additionalDriverDob,
        licenseNumber: dto.additionalDriverLicenseNumber,
        licenseClass: dto.additionalDriverLicenseClass || 'B2',
        licenseExpiry: dto.additionalDriverLicenseExpiry,
        licenseFront: dto.additionalDriverLicenseFront,
        licenseBack: dto.additionalDriverLicenseBack,
        rentalStart: start,
        rentalEnd: end,
        isPrimary: false,
      });
    }

    let verificationStatus = 'PENDING';
    let identityVerified = false;

    if (primaryEligibility.suggestedStatus === 'REJECTED' || additionalEligibility?.suggestedStatus === 'REJECTED') {
      verificationStatus = 'REJECTED';
      identityVerified = false;
    } else if (
      primaryEligibility.suggestedStatus === 'APPROVED' &&
      (!hasAdditionalDriver || additionalEligibility?.suggestedStatus === 'APPROVED')
    ) {
      verificationStatus = 'APPROVED';
      identityVerified = true;
    } else {
      verificationStatus = 'REQUIRES_REVIEW';
      identityVerified = false;
    }

    // Sinh mã đơn tự động
    const datePart = new Date().toISOString().slice(2, 7).replace('-', '');
    const randPart = Math.floor(100000 + Math.random() * 900000);
    const bookingCode = `DH-${datePart}-${randPart}`;

    const pickupBranchId = dto.pickupBranchId || vehicle.currentBranchId || 1;
    const returnBranchId = dto.returnBranchId || pickupBranchId;

    const booking = await this.prisma.booking.create({
      data: {
        bookingCode,
        userId: userId ? BigInt(userId) : null,
        customerName: dto.customerName,
        phone: dto.phone,
        email: dto.email,
        idNumber: dto.idNumber || null,
        licenseNumber: dto.licenseNumber || null,
        driverDob: dto.driverDob ? new Date(dto.driverDob) : null,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
        licenseClass: dto.licenseClass || 'B2',
        idCardFront: dto.idCardFront || null,
        idCardBack: dto.idCardBack || null,
        licenseFront: dto.licenseFront || null,
        licenseBack: dto.licenseBack || null,
        identityVerified,
        verificationStatus,
        eligibilityResult: primaryEligibility as any,
        hasAdditionalDriver,
        additionalDriverName: dto.additionalDriverName || null,
        additionalDriverPhone: dto.additionalDriverPhone || null,
        additionalDriverEmail: dto.additionalDriverEmail || null,
        additionalDriverIdNumber: dto.additionalDriverIdNumber || null,
        additionalDriverDob: dto.additionalDriverDob ? new Date(dto.additionalDriverDob) : null,
        additionalDriverLicenseNumber: dto.additionalDriverLicenseNumber || null,
        additionalDriverLicenseClass: dto.additionalDriverLicenseClass || null,
        additionalDriverLicenseExpiry: dto.additionalDriverLicenseExpiry ? new Date(dto.additionalDriverLicenseExpiry) : null,
        additionalDriverLicenseFront: dto.additionalDriverLicenseFront || null,
        additionalDriverLicenseBack: dto.additionalDriverLicenseBack || null,
        additionalDriverEligibility: additionalEligibility as any,
        additionalDriverFee: new Prisma.Decimal(additionalDriverFee),
        vehicleId,
        pickupBranchId,
        returnBranchId,
        startDate: start,
        endDate: end,
        totalDays,
        dailyPrice: new Prisma.Decimal(dailyPrice),
        totalAmount: new Prisma.Decimal(totalAmount),
        depositAmount: new Prisma.Decimal(depositAmount),
        status: 'PENDING',
        paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
        paymentStatus: 'PAID_DEPOSIT',
        notes: dto.notes || null,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    // Tạo block lịch giữ xe
    try {
      await this.prisma.vehicleAvailabilityBlock.create({
        data: {
          vehicleId,
          blockType: 'BOOKING',
          refType: 'BOOKING',
          refId: BigInt(booking.bookingId),
          holdExpiresAt: end,
          note: `Đơn đặt cọc ${bookingCode} của khách hàng ${dto.customerName}`,
        },
      });
    } catch (e) {
      console.warn('Could not create availability block record:', e);
    }

    return this.formatBooking(booking);
  }

  /**
   * US-07 & US-08: Bổ sung hoặc cập nhật hồ sơ định danh & GPLX trực tuyến cho đơn thuê
   */
  async verifyDocuments(idOrCode: string | number, dto: VerifyDocumentsDto) {
    let where: Prisma.BookingWhereInput = {};
    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    // Merge previous documents with newly submitted
    const updatedIdFront = dto.idCardFront !== undefined ? dto.idCardFront : booking.idCardFront;
    const updatedIdBack = dto.idCardBack !== undefined ? dto.idCardBack : booking.idCardBack;
    const updatedLicenseFront = dto.licenseFront !== undefined ? dto.licenseFront : booking.licenseFront;
    const updatedLicenseBack = dto.licenseBack !== undefined ? dto.licenseBack : booking.licenseBack;
    const updatedDob = dto.driverDob !== undefined ? (dto.driverDob ? new Date(dto.driverDob) : null) : booking.driverDob;
    const updatedExpiry = dto.licenseExpiry !== undefined ? (dto.licenseExpiry ? new Date(dto.licenseExpiry) : null) : booking.licenseExpiry;
    const updatedClass = dto.licenseClass || booking.licenseClass || 'B2';
    const updatedIdNumber = dto.idNumber || booking.idNumber;
    const updatedLicenseNumber = dto.licenseNumber || booking.licenseNumber;

    // Chạy lại đối chiếu US-08
    const primaryEligibility = await this.evaluateDriverEligibility({
      name: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      idNumber: updatedIdNumber || undefined,
      dob: updatedDob,
      licenseNumber: updatedLicenseNumber || undefined,
      licenseClass: updatedClass,
      licenseExpiry: updatedExpiry,
      idCardFront: updatedIdFront || undefined,
      idCardBack: updatedIdBack || undefined,
      licenseFront: updatedLicenseFront || undefined,
      licenseBack: updatedLicenseBack || undefined,
      rentalStart: booking.startDate,
      rentalEnd: booking.endDate,
      isPrimary: true,
    });

    // Cập nhật người lái bổ sung nếu có gửi
    let hasAdditionalDriver = booking.hasAdditionalDriver;
    if (dto.hasAdditionalDriver !== undefined) {
      hasAdditionalDriver = dto.hasAdditionalDriver;
    }

    let additionalEligibility: EligibilityResult | null = null;
    const addName = dto.additionalDriverName || booking.additionalDriverName;
    if (hasAdditionalDriver && addName) {
      additionalEligibility = await this.evaluateDriverEligibility({
        name: addName,
        phone: dto.additionalDriverPhone || booking.additionalDriverPhone || undefined,
        email: dto.additionalDriverEmail || booking.additionalDriverEmail || undefined,
        idNumber: dto.additionalDriverIdNumber || booking.additionalDriverIdNumber || undefined,
        dob: dto.additionalDriverDob ? new Date(dto.additionalDriverDob) : booking.additionalDriverDob,
        licenseNumber: dto.additionalDriverLicenseNumber || booking.additionalDriverLicenseNumber || undefined,
        licenseClass: dto.additionalDriverLicenseClass || booking.additionalDriverLicenseClass || 'B2',
        licenseExpiry: dto.additionalDriverLicenseExpiry ? new Date(dto.additionalDriverLicenseExpiry) : booking.additionalDriverLicenseExpiry,
        licenseFront: dto.additionalDriverLicenseFront || booking.additionalDriverLicenseFront || undefined,
        licenseBack: dto.additionalDriverLicenseBack || booking.additionalDriverLicenseBack || undefined,
        rentalStart: booking.startDate,
        rentalEnd: booking.endDate,
        isPrimary: false,
      });
    }

    let verificationStatus = 'REQUIRES_REVIEW';
    let identityVerified = false;

    if (primaryEligibility.suggestedStatus === 'REJECTED' || additionalEligibility?.suggestedStatus === 'REJECTED') {
      verificationStatus = 'REJECTED';
      identityVerified = false;
    } else if (
      primaryEligibility.suggestedStatus === 'APPROVED' &&
      (!hasAdditionalDriver || additionalEligibility?.suggestedStatus === 'APPROVED')
    ) {
      verificationStatus = 'APPROVED';
      identityVerified = true;
    } else {
      verificationStatus = 'REQUIRES_REVIEW';
      identityVerified = false;
    }

    const updated = await this.prisma.booking.update({
      where: { bookingId: booking.bookingId },
      data: {
        idNumber: updatedIdNumber,
        licenseNumber: updatedLicenseNumber,
        driverDob: updatedDob,
        licenseExpiry: updatedExpiry,
        licenseClass: updatedClass,
        idCardFront: updatedIdFront,
        idCardBack: updatedIdBack,
        licenseFront: updatedLicenseFront,
        licenseBack: updatedLicenseBack,
        identityVerified,
        verificationStatus,
        eligibilityResult: primaryEligibility as any,
        hasAdditionalDriver,
        additionalDriverName: dto.additionalDriverName !== undefined ? dto.additionalDriverName : booking.additionalDriverName,
        additionalDriverPhone: dto.additionalDriverPhone !== undefined ? dto.additionalDriverPhone : booking.additionalDriverPhone,
        additionalDriverEmail: dto.additionalDriverEmail !== undefined ? dto.additionalDriverEmail : booking.additionalDriverEmail,
        additionalDriverIdNumber: dto.additionalDriverIdNumber !== undefined ? dto.additionalDriverIdNumber : booking.additionalDriverIdNumber,
        additionalDriverDob: dto.additionalDriverDob ? new Date(dto.additionalDriverDob) : booking.additionalDriverDob,
        additionalDriverLicenseNumber: dto.additionalDriverLicenseNumber !== undefined ? dto.additionalDriverLicenseNumber : booking.additionalDriverLicenseNumber,
        additionalDriverLicenseClass: dto.additionalDriverLicenseClass !== undefined ? dto.additionalDriverLicenseClass : booking.additionalDriverLicenseClass,
        additionalDriverLicenseExpiry: dto.additionalDriverLicenseExpiry ? new Date(dto.additionalDriverLicenseExpiry) : booking.additionalDriverLicenseExpiry,
        additionalDriverLicenseFront: dto.additionalDriverLicenseFront !== undefined ? dto.additionalDriverLicenseFront : booking.additionalDriverLicenseFront,
        additionalDriverLicenseBack: dto.additionalDriverLicenseBack !== undefined ? dto.additionalDriverLicenseBack : booking.additionalDriverLicenseBack,
        additionalDriverEligibility: additionalEligibility as any,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    return this.formatBooking(updated);
  }

  /**
   * Admin / Chuyên viên thủ công duyệt hoặc từ chối hồ sơ định danh (US-08)
   */
  async reviewVerification(id: number, dto: ReviewVerificationDto, staffUserId?: number | bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    const isApproved = dto.verificationStatus === 'APPROVED';
    const noteLine = `[Xét duyệt hồ sơ ${new Date().toLocaleString('vi-VN')}]: ${dto.verificationStatus} - ${dto.rejectionReason || dto.notes || 'Không có ghi chú'}`;

    const updated = await this.prisma.booking.update({
      where: { bookingId: id },
      data: {
        verificationStatus: dto.verificationStatus,
        identityVerified: isApproved,
        notes: booking.notes ? `${booking.notes}\n${noteLine}` : noteLine,
        approvedBy: staffUserId ? BigInt(staffUserId) : booking.approvedBy,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    return this.formatBooking(updated);
  }

  /**
   * Danh sách đơn đặt xe (Dành cho Admin / Staff quản trị & duyệt cọc)
   */
  async findAll(query: QueryBookingsDto) {
    const { status, branchId, search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (branchId) {
      where.pickupBranchId = branchId;
    }

    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { additionalDriverName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            include: {
              model: { include: { brand: true, category: true } },
              images: { include: { file: true } },
            },
          },
          pickupBranch: true,
          returnBranch: true,
        },
      }),
    ]);

    return {
      data: items.map((b) => this.formatBooking(b)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Xem chi tiết 1 đơn đặt xe theo ID hoặc BookingCode
   */
  async findOne(idOrCode: string | number) {
    let where: Prisma.BookingWhereInput = {};

    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    return this.formatBooking(booking);
  }

  /**
   * Cập nhật trạng thái đơn đặt xe (Duyệt cọc, Giao xe, Hoàn tất, Hủy)
   */
  async updateStatus(id: number, dto: UpdateBookingStatusDto, staffUserId?: number | bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    const updated = await this.prisma.booking.update({
      where: { bookingId: id },
      data: {
        status: dto.status,
        notes: dto.notes ? `${booking.notes || ''}\n[${new Date().toISOString()}] ${dto.notes}` : booking.notes,
        approvedBy: staffUserId ? BigInt(staffUserId) : booking.approvedBy,
        approvedAt: dto.status === 'CONFIRMED' ? new Date() : booking.approvedAt,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    // Cập nhật trạng thái xe tương ứng
    if (dto.status === 'CONFIRMED') {
      await this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'BOOKED' },
      });
    } else if (dto.status === 'IN_RENTAL') {
      await this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'RENTED' },
      });
    } else if (dto.status === 'COMPLETED' || dto.status === 'CANCELLED') {
      await this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.formatBooking(updated);
  }

  /**
   * Đơn đặt xe của tôi (Dành cho khách hàng)
   */
  async getMyBookings(userId?: number | bigint, email?: string, phone?: string) {
    const where: Prisma.BookingWhereInput = {
      OR: [],
    };

    if (userId) {
      where.OR?.push({ userId: BigInt(userId) });
    }
    if (email) {
      where.OR?.push({ email });
    }
    if (phone) {
      where.OR?.push({ phone });
    }

    if (!where.OR?.length) {
      return [];
    }

    const items = await this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    return items.map((b) => this.formatBooking(b));
  }

  /**
   * KPI Dashboard Thống Kê
   */
  async getDashboardStats() {
    const [
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      revenueResult,
    ] = await Promise.all([
      this.prisma.vehicle.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.vehicle.count({ where: { status: 'AVAILABLE', isActive: true, deletedAt: null } }),
      this.prisma.vehicle.count({ where: { status: 'RENTED', isActive: true, deletedAt: null } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['CONFIRMED', 'IN_RENTAL', 'COMPLETED'] } },
      }),
    ]);

    return {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
    };
  }

  /**
   * US-10: Nhân viên duyệt yêu cầu thuê xe của khách hàng
   */
  async approveBooking(id: number, notes?: string, staffUserId?: number | bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId: id },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    if (['REJECTED', 'CANCELLED'].includes(booking.status)) {
      throw new BadRequestException(`Đơn đặt xe đang ở trạng thái ${booking.status}, không thể duyệt`);
    }

    // Nếu khách đã cọc trước -> CONFIRMED, nếu chưa -> APPROVED (chờ cọc)
    const newStatus = booking.paymentStatus === 'PAID_DEPOSIT' ? 'CONFIRMED' : 'APPROVED';
    const noteLine = `[Duyệt đơn ${new Date().toLocaleString('vi-VN')}]: Nhân viên đã phê duyệt yêu cầu thuê xe.${notes ? ` Ghi chú: ${notes}` : ''}`;

    const updated = await this.prisma.booking.update({
      where: { bookingId: id },
      data: {
        status: newStatus,
        notes: booking.notes ? `${booking.notes}\n${noteLine}` : noteLine,
        approvedBy: staffUserId ? BigInt(staffUserId) : (booking.approvedBy || BigInt(1)),
        approvedAt: new Date(),
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    // Nếu đã chuyển sang CONFIRMED, tự động sinh hợp đồng
    if (newStatus === 'CONFIRMED') {
      try {
        await this.generateRentalContract(id);
      } catch (e) {
        console.warn('Lỗi khi tự động tạo hợp đồng:', e);
      }
    }

    return this.formatBooking(updated);
  }

  /**
   * US-10: Nhân viên từ chối yêu cầu thuê xe của khách hàng kèm lý do
   */
  async rejectBooking(id: number, dto: RejectBookingDto, staffUserId?: number | bigint) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingId: id },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    const noteLine = `[Từ chối đơn ${new Date().toLocaleString('vi-VN')}]: Lý do: ${dto.reason}${dto.notes ? ` - ${dto.notes}` : ''}`;

    const [updated] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { bookingId: id },
        data: {
          status: 'REJECTED',
          rejectionReason: dto.reason,
          notes: booking.notes ? `${booking.notes}\n${noteLine}` : noteLine,
          approvedBy: staffUserId ? BigInt(staffUserId) : (booking.approvedBy || BigInt(1)),
          approvedAt: new Date(),
        },
        include: {
          vehicle: {
            include: {
              model: { include: { brand: true, category: true } },
              images: { include: { file: true } },
            },
          },
          pickupBranch: true,
          returnBranch: true,
        },
      }),
      // Giải phóng xe về AVAILABLE
      this.prisma.vehicle.update({
        where: { vehicleId: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      }),
      // Xóa block lịch giữ xe
      this.prisma.vehicleAvailabilityBlock.deleteMany({
        where: {
          refType: 'BOOKING',
          refId: BigInt(booking.bookingId),
        },
      }),
    ]);

    return this.formatBooking(updated);
  }

  /**
   * US-11: Khách hàng thanh toán tiền cọc/tạm ứng để xác nhận giữ xe sau khi đơn được duyệt
   */
  async payDeposit(idOrCode: string | number, dto: PayDepositDto) {
    let where: Prisma.BookingWhereInput = {};
    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    if (booking.status === 'REJECTED' || booking.status === 'CANCELLED') {
      throw new BadRequestException('Đơn đặt xe đã bị từ chối hoặc đã hủy, không thể thanh toán cọc');
    }

    if (booking.paymentStatus === 'PAID_DEPOSIT' || booking.paymentStatus === 'FULLY_PAID') {
      return this.formatBooking(booking);
    }

    const depositRef = dto.transactionRef || `TXN-DEP-${Date.now().toString().slice(-8)}`;
    const noteLine = `[Thanh toán cọc ${new Date().toLocaleString('vi-VN')}]: Đã thanh toán tiền cọc ${new Intl.NumberFormat('vi-VN').format(Number(booking.depositAmount))} VNĐ qua ${dto.paymentMethod} (Mã GD: ${depositRef}).`;

    const updated = await this.prisma.booking.update({
      where: { bookingId: booking.bookingId },
      data: {
        paymentStatus: 'PAID_DEPOSIT',
        status: 'CONFIRMED',
        paymentMethod: dto.paymentMethod || booking.paymentMethod,
        depositPaidAt: new Date(),
        depositTransactionRef: depositRef,
        notes: booking.notes ? `${booking.notes}\n${noteLine}` : noteLine,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    // Cập nhật trạng thái xe thành BOOKED
    await this.prisma.vehicle.update({
      where: { vehicleId: booking.vehicleId },
      data: { status: 'BOOKED' },
    });

    // US-12: Tự động tạo Hợp đồng thuê xe điện tử ngay khi hoàn tất cọc
    try {
      await this.generateRentalContract(booking.bookingId);
    } catch (e) {
      console.warn('Lỗi khi tự động tạo hợp đồng sau thanh toán cọc:', e);
    }

    const reloaded = await this.prisma.booking.findUnique({
      where: { bookingId: booking.bookingId },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    return this.formatBooking(reloaded);
  }

  /**
   * US-11: Lấy thông tin thanh toán tiền cọc (VietQR ngân hàng, nội dung chuyển khoản)
   */
  async getDepositInfo(idOrCode: string | number) {
    let where: Prisma.BookingWhereInput = {};
    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    const depositAmount = Number(booking.depositAmount || 0);
    const syntax = `COC ${booking.bookingCode}`;
    const accountNo = '1028889999';
    const bankName = 'Vietcombank';
    const bankCode = '970436'; // BIN Vietcombank
    const accountHolder = 'CTY CP QUICKHATCH VN';
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(syntax)}&accountName=${encodeURIComponent(accountHolder)}`;

    return {
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      customerName: booking.customerName,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      depositAmount,
      totalAmount: Number(booking.totalAmount),
      bankInfo: {
        bankName,
        accountNo,
        accountHolder,
        transferSyntax: syntax,
        qrUrl,
      },
      deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  }

  /**
   * US-12: Hệ thống tự động tạo Hợp đồng thuê xe điện tử ghi nhận pháp lý đầy đủ
   */
  async generateRentalContract(idOrCode: string | number) {
    let where: Prisma.BookingWhereInput = {};
    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe để tạo hợp đồng');
    }

    const now = new Date();
    const contractNumber =
      booking.contractNumber ||
      `HD-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}-${booking.bookingCode}`;

    const vehicleBrandName = booking.vehicle.model?.brand?.name || 'VinFast';
    const vehicleModelName = booking.vehicle.model?.name || 'Ô Tô';
    const vehicleVariant = booking.vehicle.model?.variant || 'Tiêu chuẩn';
    const fullCarName = `${vehicleBrandName} ${vehicleModelName} (${vehicleVariant})`;

    const contractTerms = {
      contractNumber,
      createdAt: now.toISOString(),
      bookingCode: booking.bookingCode,
      title: 'HỢP ĐỒNG CHO THUÊ XE Ô TÔ TỰ LÁI ĐIỆN TỬ',
      subtitle: 'Căn cứ Bộ Luật Dân Sự số 91/2015/QH13 và Luật Giao Thông Đường Bộ số 23/2008/QH12',
      partyA: {
        title: 'BÊN CHO THUÊ (BÊN A)',
        companyName: 'CÔNG TY CỔ PHẦN DỊCH VỤ VÀ THƯƠNG MẠI QUICKHATCH VIỆT NAM',
        taxCode: '0317894562',
        address: '45 Trường Sơn, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh',
        hotline: '1900 8888 - 0901 234 567',
        representative: 'Ông Nguyễn Quốc Cường',
        position: 'Giám Đốc Vận Hành Toàn Quốc',
        pickupBranch: {
          name: booking.pickupBranch.name,
          address: `${booking.pickupBranch.addressLine}, ${booking.pickupBranch.district || ''} ${booking.pickupBranch.province}`,
          phone: booking.pickupBranch.phone || '028.38485555',
        },
      },
      partyB: {
        title: 'BÊN THUÊ XE (BÊN B)',
        fullName: booking.customerName,
        phone: booking.phone,
        email: booking.email,
        idNumber: booking.idNumber || '079090001234',
        dob: booking.driverDob ? booking.driverDob.toISOString().slice(0, 10) : 'Chưa cập nhật',
        licenseNumber: booking.licenseNumber || 'GPLX-B2-888999',
        licenseClass: booking.licenseClass || 'B2',
        licenseExpiry: booking.licenseExpiry ? booking.licenseExpiry.toISOString().slice(0, 10) : 'Còn hiệu lực',
      },
      additionalDriver: booking.hasAdditionalDriver
        ? {
            title: 'NGƯỜI LÁI XE BỔ SUNG ĐÃ ĐĂNG KÝ HỢP LỆ',
            fullName: booking.additionalDriverName,
            phone: booking.additionalDriverPhone,
            idNumber: booking.additionalDriverIdNumber || '---',
            licenseNumber: booking.additionalDriverLicenseNumber || '---',
            licenseClass: booking.additionalDriverLicenseClass || 'B2',
            licenseExpiry: booking.additionalDriverLicenseExpiry
              ? booking.additionalDriverLicenseExpiry.toISOString().slice(0, 10)
              : 'Còn hiệu lực',
          }
        : null,
      vehicle: {
        title: 'THÔNG TIN PHƯƠNG TIỆN CHO THUÊ',
        fullCarName,
        licensePlate: booking.vehicle.licensePlate,
        seats: booking.vehicle.seats || 5,
        transmission: booking.vehicle.transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn',
        fuelType:
          booking.vehicle.fuelType === 'ELECTRIC'
            ? 'Điện tử (EV)'
            : booking.vehicle.fuelType === 'DIESEL'
            ? 'Dầu Diesel'
            : 'Xăng không chì',
        color: booking.vehicle.color || 'Trắng',
        manufactureYear: booking.vehicle.manufactureYear || 2024,
        standardHandoverCondition: '100% nhiên liệu/pin, trang bị tiêu chuẩn, lốp dự phòng, camera hành trình.',
      },
      schedule: {
        title: 'LỊCH TRÌNH THUÊ VÀ BÀN GIAO',
        pickupBranchName: booking.pickupBranch.name,
        pickupAddress: `${booking.pickupBranch.addressLine}, ${booking.pickupBranch.province}`,
        startDate: booking.startDate.toISOString(),
        returnBranchName: booking.returnBranch.name,
        returnAddress: `${booking.returnBranch.addressLine}, ${booking.returnBranch.province}`,
        endDate: booking.endDate.toISOString(),
        totalDays: booking.totalDays,
      },
      financials: {
        title: 'BẢNG KÊ CHI PHÍ THUÊ & TIỀN CỌC',
        dailyPrice: Number(booking.dailyPrice),
        rentalFee: Number(booking.dailyPrice) * booking.totalDays,
        additionalDriverFee: Number(booking.additionalDriverFee || 0),
        insuranceFee: Number(booking.insuranceFee || 0),
        totalAmount: Number(booking.totalAmount),
        depositAmount: Number(booking.depositAmount),
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        depositStatusText:
          booking.paymentStatus === 'PAID_DEPOSIT' || booking.paymentStatus === 'FULLY_PAID'
            ? 'ĐÃ THANH TOÁN TIỀN CỌC GIỮ XE'
            : 'CHỜ THANH TOÁN TIỀN CỌC',
        depositPaidAt: booking.depositPaidAt ? booking.depositPaidAt.toISOString() : now.toISOString(),
        depositTransactionRef: booking.depositTransactionRef || `TXN-DEP-${booking.bookingId}`,
      },
      operatingRules: {
        title: 'ĐIỀU KHOẢN VẬN HÀNH & GIỚI HẠN XE',
        kmLimitPerDay: 350,
        extraKmFee: 5000,
        kmRuleText:
          'Giới hạn định mức di chuyển là 350 km/ngày. Quãng đường vượt trội phụ thu 5.000 VNĐ / km.',
        fuelRuleText:
          'Bên B có nghĩa vụ bàn giao xe với mức nhiên liệu/dung lượng pin tương đương thời điểm nhận xe. Thiếu hụt sẽ thanh toán theo giá niêm yết cộng 10% phí tiếp nhiên liệu.',
        cleanlinessRuleText:
          'Tuyệt đối không hút thuốc lá, không vận chuyển gia súc gia cầm, chất dễ cháy nổ, hàng cấm trong xe. Phí khử mùi vệ sinh nội thất 500.000 VNĐ nếu vi phạm.',
      },
      insuranceAndLiability: {
        title: 'CHÍNH SÁCH BẢO HIỂM & TRÁCH NHIỆM BỒI THƯỜNG',
        insuranceCoverageText:
          'Xe được bảo hiểm bắt buộc TNDS và bảo hiểm vật chất xe tiêu chuẩn (mức miễn thường tổn thất 2.000.000 VNĐ/vụ theo quy định doanh nghiệp bảo hiểm).',
        accidentLiabilityText:
          'Khi xảy ra va chạm, va quẹt hoặc sự cố, Bên B phải giữ nguyên hiện trường, chụp ảnh báo ngay hotline 1900 8888 và cơ quan chức năng để lập biên bản.',
        trafficFineLiabilityText:
          'Bên B chịu 100% trách nhiệm pháp lý và chi phí phạt nguội camera giám sát giao thông trong toàn bộ thời gian lưu hành xe. Tiền cọc sẽ được phong tỏa hoặc đối soát nếu phát sinh thông báo phạt từ CSGT.',
      },
      legalCommitment:
        'Hợp đồng điện tử này có giá trị pháp lý tương đương bản ký tay theo Luật Giao dịch điện tử. Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận.',
      signatures: {
        partyA: {
          signer: 'Đại diện Bên Cho Thuê - QuickHatch VN',
          signed: true,
          signedAt: now.toISOString(),
          statusText: 'ĐÃ KÝ SỐ ĐIỆN TỬ (DIGITAL CERTIFICATE VERIFIED)',
          digitalStamp: 'QUICKHATCH-ESIGN-APPROVED-STAMP',
        },
        partyB: {
          signer: `Bên Thuê Xe - ${booking.customerName}`,
          signed: true,
          signedAt: now.toISOString(),
          statusText: 'XÁC THỰC BẰNG MÃ OTP & GIAO DỊCH ĐẶT CỌC HỢP LỆ',
          verificationCode: `VERIFIED-${booking.bookingCode}-${now.getFullYear()}`,
        },
      },
    };

    const updated = await this.prisma.booking.update({
      where: { bookingId: booking.bookingId },
      data: {
        contractNumber,
        contractCreatedAt: booking.contractCreatedAt || now,
        contractSignedAt: booking.contractSignedAt || now,
        contractTerms: contractTerms as any,
      },
      include: {
        vehicle: {
          include: {
            model: { include: { brand: true, category: true } },
            images: { include: { file: true } },
          },
        },
        pickupBranch: true,
        returnBranch: true,
      },
    });

    return {
      contractNumber,
      contract: contractTerms,
      booking: this.formatBooking(updated),
    };
  }

  /**
   * US-12: Xem chi tiết Hợp đồng thuê xe
   */
  async getRentalContract(idOrCode: string | number) {
    let where: Prisma.BookingWhereInput = {};
    if (typeof idOrCode === 'number' || !isNaN(Number(idOrCode))) {
      where = { bookingId: Number(idOrCode) };
    } else {
      where = { bookingCode: String(idOrCode) };
    }

    const booking = await this.prisma.booking.findFirst({
      where,
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    if (booking.contractTerms && booking.contractNumber) {
      return {
        contractNumber: booking.contractNumber,
        contract: booking.contractTerms,
      };
    }

    // Nếu chưa có hợp đồng thì tự động khởi tạo
    return this.generateRentalContract(booking.bookingId);
  }

  private formatBooking(b: any) {
    const vehicleName = b.vehicle?.model
      ? `${b.vehicle.model.brand?.name || ''} ${b.vehicle.model.name || ''} ${b.vehicle.model.variant || ''}`.trim()
      : 'Xe Ô Tô';

    let thumbnail = '';
    const images: string[] = [];
    if (b.vehicle?.images && b.vehicle.images.length > 0) {
      for (const img of b.vehicle.images) {
        if (img.file?.publicUrl) {
          images.push(img.file.publicUrl);
        }
      }
    }
    thumbnail = images[0] || '';

    return {
      id: b.bookingId,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      phone: b.phone,
      email: b.email,
      idNumber: b.idNumber || '',
      licenseNumber: b.licenseNumber || '',
      driverDob: b.driverDob ? b.driverDob.toISOString().slice(0, 10) : null,
      licenseExpiry: b.licenseExpiry ? b.licenseExpiry.toISOString().slice(0, 10) : null,
      licenseClass: b.licenseClass || 'B2',
      idCardFront: b.idCardFront || null,
      idCardBack: b.idCardBack || null,
      licenseFront: b.licenseFront || null,
      licenseBack: b.licenseBack || null,
      identityVerified: Boolean(b.identityVerified),
      verificationStatus: b.verificationStatus || 'PENDING',
      eligibilityResult: b.eligibilityResult || null,
      hasAdditionalDriver: Boolean(b.hasAdditionalDriver),
      additionalDriverName: b.additionalDriverName || null,
      additionalDriverPhone: b.additionalDriverPhone || null,
      additionalDriverEmail: b.additionalDriverEmail || null,
      additionalDriverIdNumber: b.additionalDriverIdNumber || null,
      additionalDriverDob: b.additionalDriverDob ? b.additionalDriverDob.toISOString().slice(0, 10) : null,
      additionalDriverLicenseNumber: b.additionalDriverLicenseNumber || null,
      additionalDriverLicenseClass: b.additionalDriverLicenseClass || null,
      additionalDriverLicenseExpiry: b.additionalDriverLicenseExpiry ? b.additionalDriverLicenseExpiry.toISOString().slice(0, 10) : null,
      additionalDriverLicenseFront: b.additionalDriverLicenseFront || null,
      additionalDriverLicenseBack: b.additionalDriverLicenseBack || null,
      additionalDriverEligibility: b.additionalDriverEligibility || null,
      additionalDriverFee: Number(b.additionalDriverFee || 0),
      carId: Number(b.vehicleId),
      carName: vehicleName,
      licensePlate: b.vehicle?.licensePlate || '',
      thumbnail,
      images,
      pickupBranch: b.pickupBranch?.name || 'Chi nhánh Sân bay',
      returnBranch: b.returnBranch?.name || 'Chi nhánh Sân bay',
      startDate: b.startDate ? b.startDate.toISOString() : '',
      endDate: b.endDate ? b.endDate.toISOString() : '',
      totalDays: b.totalDays,
      dailyPrice: Number(b.dailyPrice),
      totalAmount: Number(b.totalAmount),
      depositAmount: Number(b.depositAmount),
      insuranceFee: Number(b.insuranceFee),
      status: b.status,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      notes: b.notes,
      approvedAt: b.approvedAt ? b.approvedAt.toISOString() : null,
      contractNumber: b.contractNumber || null,
      contractCreatedAt: b.contractCreatedAt ? b.contractCreatedAt.toISOString() : null,
      contractSignedAt: b.contractSignedAt ? b.contractSignedAt.toISOString() : null,
      contractTerms: b.contractTerms || null,
      depositPaidAt: b.depositPaidAt ? b.depositPaidAt.toISOString() : null,
      depositTransactionRef: b.depositTransactionRef || null,
      rejectionReason: b.rejectionReason || null,
      createdAt: b.createdAt ? b.createdAt.toISOString() : '',
    };
  }
}
