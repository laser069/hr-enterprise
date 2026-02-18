import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../core/auth/protected-route';
import { DashboardLayout } from '../core/layout/DashboardLayout';
import { lazy } from 'react';
import { SuspenseWrapper } from './components/loading-components';
import PublicRoute from './components/public-route';
import { ErrorBoundary } from '../shared/components/ui/ErrorBoundary';

// Lazy load modules
const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../modules/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../modules/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../modules/auth/pages/VerifyEmailPage'));
const ExecutiveDashboard = lazy(() => import('../modules/executive/pages/ExecutiveDashboard'));
const EmployeeListPage = lazy(() => import('../modules/employees/pages/EmployeeListPage'));
const NewEmployeePage = lazy(() => import('../modules/employees/pages/NewEmployeePage'));
const EmployeeDetailPage = lazy(() => import('../modules/employees/pages/EmployeeDetailPage'));
const DepartmentListPage = lazy(() => import('../modules/departments/pages/DepartmentListPage'));
const DepartmentDetailPage = lazy(() => import('../modules/departments/pages/DepartmentDetailPage'));
const AttendanceDashboard = lazy(() => import('../modules/attendance/pages/AttendanceDashboard'));
const AttendanceList = lazy(() => import('../modules/attendance/pages/AttendanceList'));
const LeaveDashboard = lazy(() => import('../modules/leave/pages/LeaveDashboard'));
const LeaveRequests = lazy(() => import('../modules/leave/pages/LeaveRequests'));
const PayrollDashboard = lazy(() => import('../modules/payroll/pages/PayrollDashboard'));
const PayrollRuns = lazy(() => import('../modules/payroll/pages/PayrollRuns'));
const PayrollRunDetails = lazy(() => import('../modules/payroll/pages/PayrollRunDetails'));
const SalaryStructuresPage = lazy(() => import('../modules/payroll/pages/SalaryStructuresPage'));
const PerformanceDashboard = lazy(() => import('../modules/performance/pages/PerformanceDashboard'));
const GoalsPage = lazy(() => import('../modules/performance/pages/GoalsPage'));
const ReviewsPage = lazy(() => import('../modules/performance/pages/ReviewsPage'));
const RecruitmentDashboard = lazy(() => import('../modules/recruitment/pages/RecruitmentDashboard'));
const JobsPage = lazy(() => import('../modules/recruitment/pages/JobsPage'));
const CandidatesPage = lazy(() => import('../modules/recruitment/pages/CandidatesPage'));
const ComplianceDashboard = lazy(() => import('../modules/compliance/pages/ComplianceDashboard'));
const FilingsPage = lazy(() => import('../modules/compliance/pages/FilingsPage'));
const AttritionAnalytics = lazy(() => import('../modules/analytics/pages/AttritionAnalytics'));
const DepartmentAnalytics = lazy(() => import('../modules/analytics/pages/DepartmentAnalytics'));
const AnalyticsDashboard = lazy(() => import('../modules/analytics/pages/AnalyticsDashboard'));
const ApprovalsPage = lazy(() => import('../modules/workflow/pages/ApprovalsPage'));
const RolesPage = lazy(() => import('../modules/settings/pages/RolesPage'));
const PermissionsPage = lazy(() => import('../modules/settings/pages/PermissionsPage'));
const SystemSettings = lazy(() => import('../modules/settings/pages/SystemSettings'));
const ProfilePage = lazy(() => import('../modules/settings/pages/ProfilePage'));
const UsersPage = lazy(() => import('../modules/users/pages/UsersPage'));
const NotificationsPage = lazy(() => import('../modules/notifications/pages/NotificationsPage'));
const ShiftsPage = lazy(() => import('../modules/shifts/pages/ShiftsPage'));
const HolidaysPage = lazy(() => import('../modules/holidays/pages/HolidaysPage'));
const HelpdeskDashboard = lazy(() => import('../modules/helpdesk/pages/HelpdeskDashboard'));
const TicketListPage = lazy(() => import('../modules/helpdesk/pages/TicketListPage'));
const TicketDetailPage = lazy(() => import('../modules/helpdesk/pages/TicketDetailPage'));
const OrgChartPage = lazy(() => import('../modules/employees/pages/OrgChartPage'));
const MyPayslipsPage = lazy(() => import('../modules/payroll/pages/MyPayslipsPage'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <LoginPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <RegisterPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <ForgotPasswordPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <ResetPasswordPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <VerifyEmailPage />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <ExecutiveDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'employees',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <EmployeeListPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'new',
            element: (
              <SuspenseWrapper>
                <NewEmployeePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <SuspenseWrapper>
                <EmployeeDetailPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'org-chart',
            element: (
              <SuspenseWrapper>
                <OrgChartPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'departments',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <DepartmentListPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <SuspenseWrapper>
                <DepartmentDetailPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'attendance',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <AttendanceDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'list',
            element: (
              <SuspenseWrapper>
                <AttendanceList />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'leave',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <LeaveDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'requests',
            element: (
              <SuspenseWrapper>
                <LeaveRequests />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'payroll',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <PayrollDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'runs',
            element: (
              <SuspenseWrapper>
                <PayrollRuns />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'runs/:id',
            element: (
              <SuspenseWrapper>
                <PayrollRunDetails />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'structures',
            element: (
              <SuspenseWrapper>
                <SalaryStructuresPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'my-payslips',
            element: (
              <SuspenseWrapper>
                <MyPayslipsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'performance',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <PerformanceDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'goals',
            element: (
              <SuspenseWrapper>
                <GoalsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'reviews',
            element: (
              <SuspenseWrapper>
                <ReviewsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'recruitment',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <RecruitmentDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs',
            element: (
              <SuspenseWrapper>
                <JobsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'candidates',
            element: (
              <SuspenseWrapper>
                <CandidatesPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'compliance',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <ComplianceDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'filings',
            element: (
              <SuspenseWrapper>
                <FilingsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <AnalyticsDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'attrition',
            element: (
              <SuspenseWrapper>
                <AttritionAnalytics />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'departments',
            element: (
              <SuspenseWrapper>
                <DepartmentAnalytics />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'notifications',
        element: (
          <SuspenseWrapper>
            <NotificationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'workflow',
        children: [
          {
            path: 'approvals',
            element: (
              <SuspenseWrapper>
                <ApprovalsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'approvals',
        element: (
          <SuspenseWrapper>
            <ApprovalsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'helpdesk',
        children: [
          {
            index: true,
            element: <Navigate to="/helpdesk/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <SuspenseWrapper>
                <HelpdeskDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'tickets',
            element: (
              <SuspenseWrapper>
                <TicketListPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'tickets/:id',
            element: (
              <SuspenseWrapper>
                <TicketDetailPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'roles',
            element: (
              <SuspenseWrapper>
                <RolesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'permissions',
            element: (
              <SuspenseWrapper>
                <PermissionsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'system',
            element: (
              <SuspenseWrapper>
                <SystemSettings />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'profile',
            element: (
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'users',
            element: (
              <SuspenseWrapper>
                <UsersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'shifts',
            element: (
              <SuspenseWrapper>
                <ShiftsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'holidays',
            element: (
              <SuspenseWrapper>
                <HolidaysPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);
