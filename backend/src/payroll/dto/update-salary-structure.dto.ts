import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class UpdateSalaryStructureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  basic?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  da?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hra?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  conveyance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  medicalAllowance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  specialAllowance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  professionalTax?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pf?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  esi?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  overtimeRate?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
