export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workDays: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftDto {
  name: string;
  startTime: string;
  endTime: string;
  workDays: number[];
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {
  isActive?: boolean;
}
