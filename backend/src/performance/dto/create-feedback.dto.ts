import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
    @IsString()
    @IsNotEmpty()
    employeeId: string;

    @IsString()
    @IsNotEmpty()
    requesterId: string;

    @IsString()
    @IsNotEmpty()
    reviewerId: string;

    @IsString()
    @IsOptional()
    message?: string;
}

export class SubmitFeedbackDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsNotEmpty()
    comments: string;
}
