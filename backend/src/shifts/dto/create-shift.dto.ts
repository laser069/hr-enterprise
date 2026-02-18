import { IsString, IsNotEmpty, IsArray, IsInt, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShiftDto {
    @ApiProperty({ example: 'General Shift', description: 'Name of the shift' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
    startTime: string;

    @ApiProperty({ example: '18:00', description: 'End time in HH:mm format' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
    endTime: string;

    @ApiProperty({ example: 60, description: 'Break duration in minutes', required: false })
    @IsInt()
    @IsOptional()
    breakDuration?: number;

    @ApiProperty({ example: ['MON', 'TUE', 'WED', 'THU', 'FRI'], description: 'Working days of the week' })
    @IsArray()
    @IsString({ each: true })
    workDays: string[];

    @ApiProperty({ example: true, description: 'Is shift active', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
