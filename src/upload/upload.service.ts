import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const MAX_PRODUCT_IMAGES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    const cloudinaryUrl = this.config.get<string>('CLOUDINARY_URL');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    } else if (cloudinaryUrl) {
      const parsed = this.parseCloudinaryUrl(cloudinaryUrl);
      if (parsed) {
        cloudinary.config({ ...parsed, secure: true });
      } else {
        process.env.CLOUDINARY_URL = cloudinaryUrl;
        cloudinary.config(true);
      }
    }

    const cfg = cloudinary.config();
    if (cfg.cloud_name) {
      this.logger.log(`Cloudinary ready (cloud: ${cfg.cloud_name})`);
    } else {
      this.logger.warn('Cloudinary not configured — image uploads will fail');
    }
  }

  private parseCloudinaryUrl(url: string): {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  } | null {
    const match = url.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/);
    if (!match) return null;
    return {
      api_key: decodeURIComponent(match[1]),
      api_secret: decodeURIComponent(match[2]),
      cloud_name: match[3],
    };
  }

  private ensureConfigured() {
    const cfg = cloudinary.config();
    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
      throw new BadRequestException(
        'Cloudinary is not configured. Add CLOUDINARY_URL to backend/.env and restart the API.',
      );
    }
  }

  private normalizeMime(mimetype: string, originalname: string): string {
    if (mimetype && ALLOWED_MIME.has(mimetype)) return mimetype;
    const ext = originalname.split('.').pop()?.toLowerCase();
    const byExt: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return byExt[ext ?? ''] ?? mimetype;
  }

  private uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result?.secure_url) {
            reject(new Error('Upload failed: no URL returned'));
            return;
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.on('error', reject);
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async uploadProductImages(files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    this.ensureConfigured();

    if (!files?.length) {
      throw new BadRequestException('Select at least one image');
    }
    if (files.length > MAX_PRODUCT_IMAGES) {
      throw new BadRequestException(`Maximum ${MAX_PRODUCT_IMAGES} images per upload`);
    }

    const urls: string[] = [];

    for (const file of files) {
      const mime = this.normalizeMime(file.mimetype, file.originalname);
      if (!ALLOWED_MIME.has(mime)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype || file.originalname}. Use JPG, PNG, WebP or GIF.`,
        );
      }
      if (!file.buffer?.length) {
        throw new BadRequestException(`File is empty: ${file.originalname}`);
      }
      if (file.size > MAX_FILE_BYTES) {
        throw new BadRequestException('Each image must be 5 MB or less');
      }

      try {
        const url = await this.uploadBuffer(file.buffer, 'ecommerce/products');
        urls.push(url);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Cloudinary upload failed';
        this.logger.error(`Upload failed for ${file.originalname}: ${msg}`);
        throw new BadRequestException(`Upload failed: ${msg}`);
      }
    }

    return { urls };
  }
}
