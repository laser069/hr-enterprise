import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsDateString()
  @IsOptional()
  dateOfJoining?: string;

  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @IsUUID()
  @IsOptional()
  shiftId?: string;
}
