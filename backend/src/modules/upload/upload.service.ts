import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async saveUploadedFile(file: Express.Multer.File, userId?: string) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file hình ảnh hợp lệ');
    }

    const relativeUrl = `http://localhost:5001/uploads/vehicles/${file.filename}`;
    const userBigInt = userId ? BigInt(userId) : undefined;

    const fileRecord = await this.prisma.file.create({
      data: {
        storageProvider: 'LOCAL',
        bucket: 'vehicle-photos',
        objectKey: relativeUrl,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        isPrivate: false,
        uploadedBy: userBigInt,
      },
    });

    return {
      fileId: fileRecord.fileId.toString(),
      url: relativeUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: Number(file.size),
    };
  }

  async saveUploadedFiles(files: Express.Multer.File[], userId?: string) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được tải lên');
    }

    const results = await Promise.all(
      files.map((file) => this.saveUploadedFile(file, userId)),
    );

    return results;
  }
}
