import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
    @ApiProperty({ example: 'New Year', description: 'Name of the holiday' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '2024-01-01', description: 'Date of the holiday (ISO format)' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ default: false, description: 'Repeats every year' })
    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;
}
