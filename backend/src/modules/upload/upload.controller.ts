import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const multerDiskStorage = diskStorage({
  destination: './uploads/vehicles',
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    callback(null, `car-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/i)) {
    return callback(
      new BadRequestException('Chỉ chấp nhận các định dạng ảnh: JPG, JPEG, PNG, WEBP, GIF'),
      false,
    );
  }
  callback(null, true);
};

@ApiTags('Upload - Tải Lên Tệp & Ảnh')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiOperation({ summary: 'Tải lên 1 file hình ảnh từ máy tính' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerDiskStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: imageFileFilter,
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId?: string,
  ) {
    const data = await this.uploadService.saveUploadedFile(file, userId);
    return {
      statusCode: 201,
      message: 'Tải ảnh lên thành công',
      data,
    };
  }

  @Post('files')
  @ApiOperation({ summary: 'Tải lên nhiều file hình ảnh cùng lúc từ máy tính' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 15, {
      storage: multerDiskStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('userId') userId?: string,
  ) {
    const data = await this.uploadService.saveUploadedFiles(files, userId);
    return {
      statusCode: 201,
      message: `Tải lên ${data.length} ảnh thành công`,
      data,
    };
  }
}
