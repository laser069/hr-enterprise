# HR Enterprise - RBAC System Documentation

## Overview

The HR Enterprise application uses a **Permission-Based Access Control (PBAC)** system rather than role-based. While users have roles (admin, hr_manager, manager, employee), access to pages and features is controlled through granular permissions.

---

## Role Hierarchy

### 1. **Admin** (`admin`)
- **Full system access**
- All 25 permissions including analytics, user management, system settings
- Can create/edit/delete employees, departments, roles
- Access to all reports and analytics

### 2. **HR Manager** (`hr_manager`)
- **HR operations access**
- Permissions: employees, attendance, leave, departments, users, analytics
- Can manage employee records, process payroll, approve leave
- Can view analytics and generate reports

### 3. **Manager** (`manager`)
- **Team oversight access**
- Permissions: employees (read), attendance (read/create/update), leave (read/create/approve), departments (read), analytics (read)
- Can view team attendance, approve team leave requests
- Can view analytics for their department

### 4. **Employee** (`employee`)
- **Self-service access**
- Permissions: employees (read own), attendance (read/create), leave (read/create), departments (read)
- Can view own profile, mark attendance, request leave
- Cannot view other employees' data or analytics

---

## Permission Structure

Permissions follow the format: `{resource}:{action}`

### Available Resources & Actions:

| Resource | Actions | Description |
|----------|---------|-------------|
| `users` | read, create, update, delete | User management |
| `roles` | read, create, update, delete | Role management |
| `employees` | read, create, update, delete | Employee records |
| `departments` | read, create, update, delete | Department management |
| `attendance` | read, create, update, delete | Attendance tracking |
| `leave` | read, create, approve, manage | Leave management |
| `payroll` | read, process, manage | Payroll processing |
| `analytics` | read | View reports & dashboards |

---

## Page Access Control Matrix

### Public Pages (No Authentication)
- `/login` - Login page
- `/register` - Registration page
- `/auth/reset-password` - Password reset

### Protected Pages (Require Authentication)

#### **Dashboard** (`/dashboard`)
- **Required Permission**: `analytics:read`
- **Access**: Admin, HR Manager, Manager
- **Description**: Executive summary with key metrics

#### **Employees Module** (`/employees/*`)

| Page | Route | Permission | Roles |
|------|-------|------------|-------|
| Employee List | `/employees` | `employees:read` | All |
| Create Employee | `/employees/new` | `employees:create` | Admin, HR Manager |
| Employee Detail | `/employees/:id` | `employees:read` | All |
| Edit Employee | `/employees/:id/edit` | `employees:update` | Admin, HR Manager |

#### **Departments** (`/departments`)
- **Required Permission**: `departments:read`
- **Access**: All roles
- **Create/Edit**: `departments:create/update` - Admin, HR Manager only

#### **Attendance Module** (`/attendance/*`)

| Page | Route | Permission | Roles |
|------|-------|------------|-------|
| Dashboard | `/attendance` | `attendance:read` | All |
| Attendance List | `/attendance/list` | `attendance:read` | Admin, HR Manager, Manager |
| Mark Attendance | Check-in/out | `attendance:create` | All |
| Edit Attendance | `/attendance/:id/edit` | `attendance:update` | Admin, HR Manager, Manager |

**Attendance Status Display:**
- ✅ **Present** - Employees who checked in on time
- ⚠️ **Late** - Employees who checked in after 9:15 AM
- 🏖️ **On Leave** - Employees with approved leave requests
- ❌ **Absent** - Employees who didn't check in (auto-marked at end of day)

#### **Leave Module** (`/leave/*`)

| Page | Route | Permission | Roles |
|------|-------|------------|-------|
| Leave Dashboard | `/leave` | `leave:read` | All |
| Leave Requests | `/leave/requests` | `leave:read` | All |
| Request Leave | Create form | `leave:create` | All |
| Approve Leave | Approve action | `leave:approve` | Manager, HR Manager |

#### **Payroll** (`/payroll/*`)
- **Required Permission**: `payroll:read`
- **Access**: Admin, HR Manager
- **Routes**:
  - `/payroll` - Dashboard
  - `/payroll/runs` - Payroll runs
  - `/payroll/runs/:id` - Run details

#### **Performance** (`/performance/*`)
- **Required Permission**: `employees:read`
- **Access**: Admin, HR Manager, Manager
- **Routes**:
  - `/performance` - Dashboard
  - `/performance/goals` - Goals management
  - `/performance/reviews` - Performance reviews

#### **Recruitment** (`/recruitment/*`)
- **Required Permission**: `employees:create`
- **Access**: Admin, HR Manager
- **Routes**:
  - `/recruitment` - Dashboard
  - `/recruitment/jobs` - Job postings
  - `/recruitment/candidates` - Candidate management

#### **Analytics** (`/analytics/*`)
- **Required Permission**: `analytics:read`
- **Access**: Admin, HR Manager, Manager
- **Routes**:
  - `/analytics/attrition` - Attrition analysis
  - `/analytics/departments` - Department metrics

#### **Settings** (`/settings/*`)
- **Required Permission**: `roles:read`
- **Access**: Admin only (full access), HR Manager (read)
- **Routes**:
  - `/settings/roles` - Role management
  - `/settings/permissions` - Permission management
  - `/settings/system` - System settings (Admin only)

---

## API Endpoint Permissions

### Authentication
- `POST /auth/login` - Public
- `POST /auth/logout` - Any authenticated user
- `POST /auth/refresh` - Public (with valid refresh token)
- `GET /auth/me` - Any authenticated user

### Analytics
- `GET /analytics/executive-summary` - `analytics:read`
- `GET /analytics/attendance/today` - `attendance:read`
- `GET /analytics/attendance/metrics` - `analytics:read`
- `GET /analytics/leave/metrics` - `analytics:read`
- `GET /analytics/payroll/metrics` - `analytics:read`
- `GET /analytics/attrition` - `analytics:read`
- `GET /analytics/departments` - `analytics:read`

### Attendance
- `GET /attendance` - `attendance:read`
- `POST /attendance` - `attendance:create`
- `POST /attendance/check-in` - `attendance:create`
- `POST /attendance/check-out` - `attendance:create`
- `GET /attendance/today-stats` - `attendance:read`
- `GET /attendance/my` - Any authenticated user
- `GET /attendance/:id` - `attendance:read`
- `PATCH /attendance/:id` - `attendance:update`
- `DELETE /attendance/:id` - `attendance:delete`

### Employees
- `GET /employees` - `employees:read`
- `POST /employees` - `employees:create`
- `GET /employees/:id` - `employees:read`
- `PATCH /employees/:id` - `employees:update`
- `DELETE /employees/:id` - `employees:delete`
- `GET /employees/statistics` - `employees:read`

### Leave
- `GET /leave/requests` - `leave:read`
- `POST /leave/requests` - `leave:create`
- `GET /leave/requests/:id` - `leave:read`
- `PATCH /leave/requests/:id/approve` - `leave:approve`
- `GET /leave/balances` - `leave:read`

---

## Frontend Implementation

### Route Guards

All protected routes use the `ProtectedRoute` component which:
1. Checks for valid JWT token
2. Fetches user profile and permissions
3. Redirects to login if not authenticated

### Permission Checks in Components

```tsx
// Using the useAuth hook
const { hasPermission, hasAnyPermission } = useAuth();

// Check single permission
if (hasPermission('employees:create')) {
  // Show create button
}

// Check any of multiple permissions
if (hasAnyPermission(['employees:update', 'employees:delete'])) {
  // Show edit/delete options
}
```

### Button/Action Visibility

Components should conditionally render actions based on permissions:

```tsx
{hasPermission('employees:create') && (
  <Link to="/employees/new">
    <Button>Create Employee</Button>
  </Link>
)}
```

---

## Testing Access Control

### Test Credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrenterprise.com | Admin@123 |
| HR Manager | sarah.johnson@hrenterprise.com | HrManager@123 |
| Manager | michael.chen@hrenterprise.com | Manager@123 |
| Employee | james.wilson@hrenterprise.com | Employee@123 |

### Expected Behavior:

1. **Admin**: Can access all pages and perform all actions
2. **HR Manager**: Can access employees, attendance, leave, payroll, analytics
3. **Manager**: Can view team data, approve leave, view analytics
4. **Employee**: Can only view own data, mark attendance, request leave

---

## Troubleshooting

### 403 Forbidden Errors
If you see "Request failed with status code 403":
1. Check that your user has the required permission
2. Verify the JWT token includes the permission in the payload
3. Re-login to refresh permissions from the database

### Permission Not Working
1. Check that the permission exists in the database
2. Verify the role has the permission assigned
3. Clear browser storage and re-login
4. Check the JWT payload at https://jwt.io

### Adding New Permissions
1. Add permission to `prisma/seed.ts` in `defaultPermissions` array
2. Assign to appropriate roles
3. Run `pnpm db:seed` to update database
4. Re-login to get updated permissions in JWT

---

## Security Best Practices

1. **Always check permissions on backend** - Frontend checks are for UX only
2. **Use specific permissions** - Prefer `employees:create` over broad `admin` role
3. **Principle of least privilege** - Give minimum permissions needed
4. **Regular audits** - Review role permissions quarterly
5. **Token expiration** - JWT tokens expire in 15 minutes, refresh tokens in 7 days

---

## Recent Fixes Applied

✅ **Logout Fixed** - Made refreshToken optional in logout endpoint
✅ **Analytics Access** - Changed from role-based to permission-based (`analytics:read`)
✅ **Permissions Added** - Added `analytics:read` permission to HR Manager and Manager roles
✅ **Database Reseeded** - Updated with 25 permissions including analytics
