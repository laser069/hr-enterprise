// Executive Dashboard Types

export interface ExecutiveSummary {
  totalEmployees: number;
  activeEmployees: number;
  newJoinings: number;
  attritionCount: number;
  departmentBreakdown: DepartmentStat[];
  attendanceSummary: AttendanceStat;
  pendingLeaveRequests: number;
  pendingApprovals: number;
}

export interface DepartmentStat {
  department: string;
  count: number;
  percentage: number;
}

export interface AttendanceStat {
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  totalEmployees: number;
}