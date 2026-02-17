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
    path: '/employees',
    icon: 'Users',
    requiredPermissions: ['employee:read'],
  },
  {
    name: 'Departments',
    path: '/departments',
    icon: 'Building2',
    requiredPermissions: ['department:read'],
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: 'Clock',
    children: [
      { name: 'Dashboard', path: '/attendance', icon: '' },
      { name: 'List', path: '/attendance/list', icon: '' },
    ],
    requiredPermissions: ['attendance:read'],
  },
  {
    name: 'Leave',
    path: '/leave',
    icon: 'Calendar',
    children: [
      { name: 'Dashboard', path: '/leave', icon: '' },
      { name: 'Requests', path: '/leave/requests', icon: '' },
    ],
    requiredPermissions: ['leave:read'],
  },
  {
    name: 'Payroll',
    path: '/payroll',
    icon: 'DollarSign',
    children: [
      { name: 'Dashboard', path: '/payroll', icon: '' },
      { name: 'Runs', path: '/payroll/runs', icon: '' },
    ],
    requiredPermissions: ['payroll:read'],
  },
  {
    name: 'Performance',
    path: '/performance',
    icon: 'TrendingUp',
    children: [
      { name: 'Dashboard', path: '/performance', icon: '' },
      { name: 'Goals', path: '/performance/goals', icon: '' },
      { name: 'Reviews', path: '/performance/reviews', icon: '' },
    ],
    requiredPermissions: ['performance:read'],
  },
  {
    name: 'Recruitment',
    path: '/recruitment',
    icon: 'UserPlus',
    children: [
      { name: 'Dashboard', path: '/recruitment', icon: '' },
      { name: 'Jobs', path: '/recruitment/jobs', icon: '' },
      { name: 'Candidates', path: '/recruitment/candidates', icon: '' },
    ],
    requiredPermissions: ['recruitment:read'],
  },
  {
    name: 'Compliance',
    path: '/compliance',
    icon: 'Shield',
    children: [
      { name: 'Dashboard', path: '/compliance', icon: '' },
      { name: 'Filings', path: '/compliance/filings', icon: '' },
    ],
    requiredPermissions: ['compliance:read'],
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    children: [
      { name: 'Dashboard', path: '/analytics', icon: '' },
      { name: 'Attrition', path: '/analytics/attrition', icon: '' },
      { name: 'Departments', path: '/analytics/departments', icon: '' },
    ],
    requiredPermissions: ['analytics:read'],
  },
  {
    name: 'Approvals',
    path: '/approvals',
    icon: 'CheckCircle',
    requiredPermissions: ['workflow:approve'],
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: 'Settings',
    children: [
      { name: 'Profile', path: '/settings/profile', icon: '' },
      { name: 'Users', path: '/settings/users', icon: '' },
      { name: 'Roles', path: '/settings/roles', icon: '' },
      { name: 'Permissions', path: '/settings/permissions', icon: '' },
      { name: 'System', path: '/settings/system', icon: '' },
    ],
    requiredPermissions: ['settings:manage'],
  },
];