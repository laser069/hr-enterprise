export interface NavItem {
  name: string;
  path: string;
  icon: string;
  children?: NavItem[];
  requiredPermissions?: string[];
}

export const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Employees',
    path: '/employees-root',
    icon: 'Users',
    requiredPermissions: ['employees:read'],
    children: [
      { name: 'All Employees', path: '/employees', icon: '' },
      { name: 'Add Employee', path: '/employees/new', requiredPermissions: ['employees:create'], icon: '' },
      { name: 'Departments', path: '/departments', requiredPermissions: ['departments:read'], icon: '' },
    ],
  },
  {
    name: 'Attendance',
    path: '/attendance-root',
    icon: 'Clock',
    requiredPermissions: ['attendance:read'],
    children: [
      { name: 'Dashboard', path: '/attendance', icon: '' },
      { name: 'Records', path: '/attendance/list', icon: '' },
    ],
  },
  {
    name: 'Leave',
    path: '/leave-root',
    icon: 'Calendar',
    requiredPermissions: ['leave:read'],
    children: [
      { name: 'Dashboard', path: '/leave', icon: '' },
      { name: 'All Requests', path: '/leave/requests', requiredPermissions: ['leave:approve'], icon: '' },
    ],
  },
  {
    name: 'Payroll',
    path: '/payroll-root',
    icon: 'DollarSign',
    requiredPermissions: ['payroll:read'],
    children: [
      { name: 'Dashboard', path: '/payroll', icon: '' },
      { name: 'My Payslips', path: '/payroll/my-payslips', icon: '' },
      { name: 'Payroll Runs', path: '/payroll/runs', requiredPermissions: ['payroll:manage'], icon: '' },
      { name: 'Salary Structures', path: '/payroll/structures', requiredPermissions: ['payroll:manage'], icon: '' },
    ],
  },
  {
    name: 'Performance',
    path: '/performance-root',
    icon: 'TrendingUp',
    children: [
      { name: 'Dashboard', path: '/performance', icon: '' },
      { name: 'Goals', path: '/performance/goals', icon: '' },
      { name: 'Reviews', path: '/performance/reviews', icon: '' },
    ],
  },
  {
    name: 'Recruitment',
    path: '/recruitment-root',
    icon: 'UserPlus',
    requiredPermissions: ['recruitment:read'],
    children: [
      { name: 'Dashboard', path: '/recruitment', icon: '' },
      { name: 'Jobs', path: '/recruitment/jobs', icon: '' },
      { name: 'Candidates', path: '/recruitment/candidates', icon: '' },
    ],
  },
  {
    name: 'Compliance',
    path: '/compliance-root',
    icon: 'Shield',
    requiredPermissions: ['compliance:read'],
    children: [
      { name: 'Dashboard', path: '/compliance', icon: '' },
      { name: 'Filings', path: '/compliance/filings', icon: '' },
    ],
  },
  {
    name: 'Approvals',
    path: '/approvals',
    icon: 'CheckCircle',
  },
  {
    name: 'Analytics',
    path: '/analytics-root',
    icon: 'BarChart3',
    requiredPermissions: ['analytics:read'],
    children: [
      { name: 'Executive Summary', path: '/analytics', icon: '' },
      { name: 'Attrition', path: '/analytics/attrition', icon: '' },
      { name: 'Departments', path: '/analytics/departments', icon: '' },
    ],
  },
  {
    name: 'Settings',
    path: '/settings-root',
    icon: 'Settings',
    children: [
      { name: 'Profile', icon: 'User', path: '/settings/profile' },
      { name: 'Roles', icon: 'ShieldCheck', path: '/settings/roles', requiredPermissions: ['roles:read'] },
      { name: 'Permissions', icon: 'Lock', path: '/settings/permissions', requiredPermissions: ['permissions:read'] },
      { name: 'Users', icon: 'UserPlus', path: '/settings/users', requiredPermissions: ['users:read'] },
      { name: 'Shifts', icon: 'Clock', path: '/settings/shifts', requiredPermissions: ['shifts:read'] },
      { name: 'Holidays', icon: 'Calendar', path: '/settings/holidays', requiredPermissions: ['holidays:read'] },
      { name: 'System Settings', icon: 'Settings', path: '/settings/system', requiredPermissions: ['settings:read'] },
    ],
  },
];
