import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateSalaryStructureDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  basic: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  da?: number;

  @IsNumber()
  @Min(0)
  hra: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  conveyance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  medicalAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specialAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalTax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pf?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esi?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
