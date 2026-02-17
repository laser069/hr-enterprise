import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileUploadResult {
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'hr-enterprise-uploads';
  }

  async uploadFile(
    file: UploadedFile,
    folder: string,
    allowedTypes?: string[],
    maxSize?: number,
  ): Promise<FileUploadResult> {
    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname);
    const key = `${folder}/${timestamp}-${randomString}${extension}`;

    try {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
      });

      await this.s3Client.send(command);

      // Generate signed URL (valid for 7 days)
      const url = await this.getSignedUrl(key, 7 * 24 * 60 * 60);

      this.logger.log(`File uploaded: ${key}`);

      return {
        url,
        key,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error: any) {
      this.logger.error(`Failed to upload file: ${error?.message || 'Unknown error'}`, error?.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${key}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error?.message || 'Unknown error'}`, error?.stack);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: any) {
      this.logger.error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`, error?.stack);
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  // Helper method to validate file extensions
  validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Helper method to get mime type from extension
  getMimeTypeFromExtension(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }
}
