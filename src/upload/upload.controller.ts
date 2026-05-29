import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('product-images')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    }),
  )
  uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const received = files?.filter((f) => f?.size > 0) ?? [];
    if (!received.length) {
      const contentType = req.headers['content-type'] ?? '';
      throw new BadRequestException(
        contentType.includes('multipart')
          ? 'No image files received. Try again or use JPG/PNG/WebP.'
          : 'Invalid upload request. Use the image picker (multipart form).',
      );
    }
    return this.uploadService.uploadProductImages(received);
  }
}
