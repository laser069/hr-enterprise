import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiProperty } from '@nestjs/swagger';
import { UploadService, FileUploadResult } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators';
import { PrismaService } from '../../database/prisma.service';

class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload' })
  file: any;

  @ApiProperty({ example: 'resume', description: 'Upload category', enum: ['contract', 'id_proof', 'resume', 'payslip', 'policy', 'certificate', 'compliance', 'other'] })
  category: string;

  @ApiProperty({ example: 'John Doe Resume', description: 'Document description', required: false })
  description?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Employee ID (if document belongs to an employee)', required: false })
  employeeId?: string;
}

@ApiTags('Files')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
    @Body('description') description: string,
    @Body('employeeId') employeeId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string; data: any }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate category
    const validCategories = ['contract', 'id_proof', 'resume', 'payslip', 'policy', 'certificate', 'compliance', 'other'];
    if (!validCategories.includes(category)) {
      throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Determine folder based on category
    const folderMap: Record<string, string> = {
      contract: 'contracts',
      id_proof: 'documents',
      resume: 'recruitment/resumes',
      payslip: 'payroll/payslips',
      policy: 'policies',
      certificate: 'documents',
      compliance: 'compliance',
      other: 'misc',
    };

    const folder = folderMap[category] || 'misc';

    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    // Upload file
    const result: FileUploadResult = await this.uploadService.uploadFile(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      folder,
      allowedTypes,
      10 * 1024 * 1024, // 10MB
    );

    // Save to database
    const document = await (this.prisma as any).document.create({
      data: {
        employeeId: employeeId || null,
        uploadedBy: user.userId,
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: result.url,
        key: result.key,
        category: category.toUpperCase(),
        description: description || null,
      },
    });

    return {
      message: 'File uploaded successfully',
      data: {
        id: document.id,
        url: result.url,
        originalName: result.originalName,
        size: result.size,
        category,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    const document = await (this.prisma as any).document.findFirst({
      where: {
        id,
        uploadedBy: user.userId,
      },
    });

    if (!document) {
      throw new BadRequestException('File not found or access denied');
    }

    // Delete from S3
    await this.uploadService.deleteFile(document.key);

    // Delete from database
    await (this.prisma as any).document.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }
}
