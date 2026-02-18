import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['it_support', 'hr_query', 'payroll_issue', 'other'])
  category: string;

  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;
}
