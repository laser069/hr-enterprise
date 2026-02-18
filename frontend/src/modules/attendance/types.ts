// Attendance Types

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workMinutes?: number;
  lateMinutes?: number;
  overtimeMinutes?: number;
  isManualEntry: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    profilePicture?: string;
  };
}

export interface AttendanceStats {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalOnLeave: number;
  totalHalfDay: number;
  averageWorkHours: number;
  attendanceRate: number;
}

export interface CheckInDto {
  employeeId: string;
  timestamp?: string; // ISO datetime
  notes?: string;
}

export interface CheckOutDto {
  employeeId: string;
  timestamp?: string; // ISO datetime
  notes?: string;
}

export interface AttendanceListParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

export interface AttendanceListResponse {
  data: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
