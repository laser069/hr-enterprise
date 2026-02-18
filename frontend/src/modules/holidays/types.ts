export type HolidayType = 'PUBLIC' | 'COMPANY' | 'OPTIONAL';

export const HolidayTypes = {
  PUBLIC: 'PUBLIC' as HolidayType,
  COMPANY: 'COMPANY' as HolidayType,
  OPTIONAL: 'OPTIONAL' as HolidayType,
};

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayDto {
  name: string;
  date: string;
  type: HolidayType;
  description?: string;
  isRecurring: boolean;
}

export interface UpdateHolidayDto extends Partial<CreateHolidayDto> {
  id?: string;
}
