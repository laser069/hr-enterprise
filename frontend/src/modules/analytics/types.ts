// Analytics Types

export interface AttendanceMetrics {
  presentPercentage: number;
  latePercentage: number;
  absentPercentage: number;
  onLeavePercentage: number;
  averageWorkHours: number;
  trend: 'up' | 'down' | 'stable';
}

export interface LeaveMetrics {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  averageLeaveDays: number;
  mostUsedLeaveType: string;
}

export interface PayrollMetrics {
  totalPayroll: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
  totalDeductions: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AttritionAnalysis {
  startingHeadcount: number;
  newHires: number;
  terminations: number;
  attritionRate: number;
  voluntaryExits: number;
  involuntaryExits: number;
  endingHeadcount: number;
  monthlyData: MonthlyAttritionData[];
  byDepartment: DepartmentAttrition[];
  trend: 'up' | 'down' | 'stable';
}

export interface MonthlyAttritionData {
  month: number;
  hires: number;
  exits: number;
  netChange: number;
}

export interface DepartmentAttrition {
  department: string;
  attritionCount: number;
  attritionRate: number;
}

export interface DepartmentAnalytics {
  id: string;
  name: string;
  totalEmployees: number;
  employeeCount: number;
  activeEmployees: number;
  openPositions: number;
  averageSalary: number;
  averageTenure: number;
  attendanceRate: number;
  attritionRate: number;
  managerName?: string;
  totalPayroll: number;
}

export interface TodayAttendanceSummary {
  date: string;
  totalEmployees: number;
  total: number; // Alias for totalEmployees
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  notMarked: number;
  attendanceRate: number | string;
}
