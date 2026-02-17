export const ROUTES = {
  // Auth
  LOGIN: '/login',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEE_DETAILS: '/employees/:id',
  
  // Departments
  DEPARTMENTS: '/departments',
  
  // Attendance
  ATTENDANCE: '/attendance',
  ATTENDANCE_LIST: '/attendance/list',
  
  // Leave
  LEAVE: '/leave',
  LEAVE_REQUESTS: '/leave/requests',
  
  // Payroll
  PAYROLL: '/payroll',
  PAYROLL_RUNS: '/payroll/runs',
  PAYROLL_RUN_DETAILS: '/payroll/runs/:id',
  
  // Performance
  PERFORMANCE: '/performance',
  GOALS: '/performance/goals',
  REVIEWS: '/performance/reviews',
  
  // Recruitment
  RECRUITMENT: '/recruitment',
  JOBS: '/recruitment/jobs',
  CANDIDATES: '/recruitment/candidates',
  
  // Compliance
  COMPLIANCE: '/compliance',
  FILINGS: '/compliance/filings',
  
  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_ATTRITION: '/analytics/attrition',
  ANALYTICS_DEPARTMENTS: '/analytics/departments',
  
  // Workflow
  APPROVALS: '/approvals',
  
  // Settings
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_PERMISSIONS: '/settings/permissions',
  SETTINGS_SYSTEM: '/settings/system',
  SETTINGS_PROFILE: '/settings/profile',
} as const;

export type AppRoutes = typeof ROUTES;