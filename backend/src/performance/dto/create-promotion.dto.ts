import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreatePromotionDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsOptional()
    oldDesignation?: string;

    @IsString()
    @IsNotEmpty()
    newDesignation: string;

    @IsNumber()
    @IsOptional()
    oldSalary?: number;

    @IsNumber()
    @IsNotEmpty()
    newSalary: number;

    @IsDateString()
    @IsNotEmpty()
    effectiveDate: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
