import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsDateString,
  Matches,
  Length,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @Matches(/^EMP\d{3,5}$/, {
    message: 'Employee code must be in format EMP followed by 3-5 digits',
  })
  employeeCode: string;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEmail()
  email: string;

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
  dateOfJoining: string;

  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @IsUUID()
  @IsOptional()
  shiftId?: string;
}
