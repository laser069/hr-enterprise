import { IsUUID, IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  faceDescriptor?: number[];
}
