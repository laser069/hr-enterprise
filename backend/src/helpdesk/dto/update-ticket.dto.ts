import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(['open', 'in_progress', 'resolved', 'closed'])
  status: string;
}

export class AssignTicketDto {
  @IsNotEmpty()
  @IsString()
  assignedTo: string;
}
