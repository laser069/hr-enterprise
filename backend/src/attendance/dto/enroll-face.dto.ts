import { IsUUID, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber } from 'class-validator';

export class EnrollFaceDto {
    @IsUUID()
    employeeId: string;

    @IsArray()
    @ArrayMinSize(128)
    @ArrayMaxSize(128)
    @IsNumber({}, { each: true })
    faceDescriptor: number[];
}
