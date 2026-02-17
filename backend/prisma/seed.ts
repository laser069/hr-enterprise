import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// For Prisma 7.x, we need to use the driver adapter
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Configure pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. Create Departments
  // ============================================
  console.log('🏢 Creating departments...');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        description: 'Software development and technical operations',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        description: 'Employee management and recruitment',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Sales' },
      update: {},
      create: {
        name: 'Sales',
        description: 'Business development and sales operations',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: {
        name: 'Finance',
        description: 'Financial planning and accounting',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing',
        description: 'Marketing and brand management',
      },
    }),
  ]);

  console.log(`✅ Created ${departments.length} departments\n`);

  // ============================================
  // 2. Create Leave Types
  // ============================================
  console.log('🏖️ Creating leave types...');

  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({
      where: { name: 'Annual Leave' },
      update: {},
      create: {
        name: 'Annual Leave',
        description: 'Regular paid time off',
        annualLimit: 20,
        carryForwardAllowed: true,
        maxCarryForward: 5,
      },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Sick Leave' },
      update: {},
      create: {
        name: 'Sick Leave',
        description: 'Medical leave for illness',
        annualLimit: 10,
        carryForwardAllowed: false,
      },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Casual Leave' },
      update: {},
      create: {
        name: 'Casual Leave',
        description: 'Short notice personal leave',
        annualLimit: 8,
        carryForwardAllowed: false,
      },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Maternity Leave' },
      update: {},
      create: {
        name: 'Maternity Leave',
        description: 'Leave for new mothers',
        annualLimit: 180,
        carryForwardAllowed: false,
      },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Paternity Leave' },
      update: {},
      create: {
        name: 'Paternity Leave',
        description: 'Leave for new fathers',
        annualLimit: 14,
        carryForwardAllowed: false,
      },
    }),
  ]);

  console.log(`✅ Created ${leaveTypes.length} leave types\n`);

  // ============================================
  // 3. Create Default Roles and Permissions
  // ============================================
  console.log('🔐 Creating roles and permissions...');

  // Default permissions
  const defaultPermissions = [
    // User permissions
    { name: 'View Users', resource: 'users', action: 'read' },
    { name: 'Create Users', resource: 'users', action: 'create' },
    { name: 'Update Users', resource: 'users', action: 'update' },
    { name: 'Delete Users', resource: 'users', action: 'delete' },
    // Role permissions
    { name: 'View Roles', resource: 'roles', action: 'read' },
    { name: 'Create Roles', resource: 'roles', action: 'create' },
    { name: 'Update Roles', resource: 'roles', action: 'update' },
    { name: 'Delete Roles', resource: 'roles', action: 'delete' },
    // Employee permissions
    { name: 'View Employees', resource: 'employees', action: 'read' },
    { name: 'Create Employees', resource: 'employees', action: 'create' },
    { name: 'Update Employees', resource: 'employees', action: 'update' },
    { name: 'Delete Employees', resource: 'employees', action: 'delete' },
    // Department permissions
    { name: 'View Departments', resource: 'departments', action: 'read' },
    { name: 'Create Departments', resource: 'departments', action: 'create' },
    { name: 'Update Departments', resource: 'departments', action: 'update' },
    { name: 'Delete Departments', resource: 'departments', action: 'delete' },
    // Attendance permissions
    { name: 'View Attendance', resource: 'attendance', action: 'read' },
    { name: 'Create Attendance', resource: 'attendance', action: 'create' },
    { name: 'Update Attendance', resource: 'attendance', action: 'update' },
    { name: 'Delete Attendance', resource: 'attendance', action: 'delete' },
    // Leave permissions
    { name: 'View Leave', resource: 'leave', action: 'read' },
    { name: 'Create Leave', resource: 'leave', action: 'create' },
    { name: 'Approve Leave', resource: 'leave', action: 'approve' },
    { name: 'Manage Leave Types', resource: 'leave', action: 'manage' },
    // Analytics permissions
    { name: 'View Analytics', resource: 'analytics', action: 'read' },
  ];

  // Create all permissions
  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {},
      create: perm,
    });
  }

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      isSystem: true,
    },
  });

  const hrRole = await prisma.role.upsert({
    where: { name: 'hr_manager' },
    update: {},
    create: {
      name: 'hr_manager',
      description: 'HR Manager with employee management access',
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Department manager with team oversight',
      isSystem: true,
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Standard employee with limited access',
      isSystem: true,
    },
  });

  // Assign permissions to roles
  // Admin gets all permissions
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });

  // HR Manager gets HR-related permissions + analytics
  const hrPermissions = allPermissions.filter(
    (p) =>
      p.resource === 'employees' ||
      p.resource === 'attendance' ||
      p.resource === 'leave' ||
      p.resource === 'departments' ||
      p.resource === 'users' ||
      p.resource === 'analytics'
  );
  await prisma.rolePermission.deleteMany({ where: { roleId: hrRole.id } });
  await prisma.rolePermission.createMany({
    data: hrPermissions.map((p) => ({
      roleId: hrRole.id,
      permissionId: p.id,
    })),
  });

  // Manager gets read access to employees, attendance, leave, analytics
  const managerPermissions = allPermissions.filter(
    (p) =>
      (p.resource === 'employees' && p.action === 'read') ||
      (p.resource === 'attendance' && ['read', 'create', 'update'].includes(p.action)) ||
      (p.resource === 'leave' && ['read', 'create', 'approve'].includes(p.action)) ||
      (p.resource === 'departments' && p.action === 'read') ||
      (p.resource === 'analytics' && p.action === 'read')
  );
  await prisma.rolePermission.deleteMany({ where: { roleId: managerRole.id } });
  await prisma.rolePermission.createMany({
    data: managerPermissions.map((p) => ({
      roleId: managerRole.id,
      permissionId: p.id,
    })),
  });

  // Employee gets basic read and create permissions
  const employeePermissions = allPermissions.filter(
    (p) =>
      (p.resource === 'employees' && p.action === 'read') ||
      (p.resource === 'attendance' && ['read', 'create'].includes(p.action)) ||
      (p.resource === 'leave' && ['read', 'create'].includes(p.action)) ||
      (p.resource === 'departments' && p.action === 'read')
  );
  await prisma.rolePermission.deleteMany({ where: { roleId: employeeRole.id } });
  await prisma.rolePermission.createMany({
    data: employeePermissions.map((p) => ({
      roleId: employeeRole.id,
      permissionId: p.id,
    })),
  });

  console.log(`✅ Created ${allPermissions.length} permissions and 4 roles\n`);

  // ============================================
  // 4. Create Admin Employee
  // ============================================
  console.log('👤 Creating admin employee and user...');

  const adminEmployee = await prisma.employee.upsert({
    where: { employeeCode: 'EMP001' },
    update: {},
    create: {
      employeeCode: 'EMP001',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@hrenterprise.com',
      phone: '+1234567890',
      departmentId: departments[1].id, // HR department
      designation: 'System Administrator',
      dateOfJoining: new Date('2020-01-01'),
      employmentStatus: 'active',
    },
  });

  // Hash password for admin
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hrenterprise.com' },
    update: {},
    create: {
      email: 'admin@hrenterprise.com',
      passwordHash: adminPasswordHash,
      isActive: true,
      emailVerified: true,
      roleId: adminRole.id,
      employeeId: adminEmployee.id,
    },
  });

  console.log('✅ Created admin user: admin@hrenterprise.com / Admin@123\n');

  // ============================================
  // 5. Create HR Manager
  // ============================================
  console.log('👤 Creating HR manager...');

  const hrManagerEmployee = await prisma.employee.upsert({
    where: { employeeCode: 'EMP002' },
    update: {},
    create: {
      employeeCode: 'EMP002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@hrenterprise.com',
      phone: '+1234567891',
      departmentId: departments[1].id, // HR department
      designation: 'HR Manager',
      dateOfJoining: new Date('2020-03-15'),
      employmentStatus: 'active',
    },
  });

  // Make HR manager head of HR department
  await prisma.department.update({
    where: { id: departments[1].id },
    data: { headId: hrManagerEmployee.id },
  });

  const hrPasswordHash = await bcrypt.hash('HrManager@123', 12);

  const hrUser = await prisma.user.upsert({
    where: { email: 'sarah.johnson@hrenterprise.com' },
    update: {},
    create: {
      email: 'sarah.johnson@hrenterprise.com',
      passwordHash: hrPasswordHash,
      isActive: true,
      emailVerified: true,
      roleId: hrRole.id,
      employeeId: hrManagerEmployee.id,
    },
  });

  console.log('✅ Created HR manager: sarah.johnson@hrenterprise.com / HrManager@123\n');

  // ============================================
  // 6. Create Engineering Team
  // ============================================
  console.log('👥 Creating engineering team...');

  const engManager = await prisma.employee.upsert({
    where: { employeeCode: 'EMP003' },
    update: {},
    create: {
      employeeCode: 'EMP003',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@hrenterprise.com',
      phone: '+1234567892',
      departmentId: departments[0].id, // Engineering
      designation: 'Engineering Manager',
      dateOfJoining: new Date('2020-06-01'),
      employmentStatus: 'active',
    },
  });

  // Make Michael head of Engineering
  await prisma.department.update({
    where: { id: departments[0].id },
    data: { headId: engManager.id },
  });

  const engManagerUser = await prisma.user.upsert({
    where: { email: 'michael.chen@hrenterprise.com' },
    update: {},
    create: {
      email: 'michael.chen@hrenterprise.com',
      passwordHash: await bcrypt.hash('Manager@123', 12),
      isActive: true,
      emailVerified: true,
      roleId: managerRole.id,
      employeeId: engManager.id,
    },
  });

  // Create engineering team members
  const engineers = await Promise.all([
    prisma.employee.upsert({
      where: { employeeCode: 'EMP004' },
      update: {},
      create: {
        employeeCode: 'EMP004',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@hrenterprise.com',
        phone: '+1234567893',
        departmentId: departments[0].id,
        designation: 'Senior Software Engineer',
        managerId: engManager.id,
        dateOfJoining: new Date('2021-02-15'),
        employmentStatus: 'active',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP005' },
      update: {},
      create: {
        employeeCode: 'EMP005',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@hrenterprise.com',
        phone: '+1234567894',
        departmentId: departments[0].id,
        designation: 'Software Engineer',
        managerId: engManager.id,
        dateOfJoining: new Date('2021-08-20'),
        employmentStatus: 'active',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP006' },
      update: {},
      create: {
        employeeCode: 'EMP006',
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@hrenterprise.com',
        phone: '+1234567895',
        departmentId: departments[0].id,
        designation: 'DevOps Engineer',
        managerId: engManager.id,
        dateOfJoining: new Date('2022-01-10'),
        employmentStatus: 'active',
      },
    }),
  ]);

  // Create users for engineers
  for (const engineer of engineers) {
    await prisma.user.upsert({
      where: { email: engineer.email },
      update: {},
      create: {
        email: engineer.email,
        passwordHash: await bcrypt.hash('Employee@123', 12),
        isActive: true,
        emailVerified: true,
        roleId: employeeRole.id,
        employeeId: engineer.id,
      },
    });
  }

  console.log(`✅ Created engineering team with 1 manager and ${engineers.length} engineers\n`);

  // ============================================
  // 7. Create Sales Team
  // ============================================
  console.log('👥 Creating sales team...');

  const salesManager = await prisma.employee.upsert({
    where: { employeeCode: 'EMP007' },
    update: {},
    create: {
      employeeCode: 'EMP007',
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.taylor@hrenterprise.com',
      phone: '+1234567896',
      departmentId: departments[2].id, // Sales
      designation: 'Sales Director',
      dateOfJoining: new Date('2019-11-01'),
      employmentStatus: 'active',
    },
  });

  await prisma.department.update({
    where: { id: departments[2].id },
    data: { headId: salesManager.id },
  });

  await prisma.user.upsert({
    where: { email: 'robert.taylor@hrenterprise.com' },
    update: {},
    create: {
      email: 'robert.taylor@hrenterprise.com',
      passwordHash: await bcrypt.hash('Manager@123', 12),
      isActive: true,
      emailVerified: true,
      roleId: managerRole.id,
      employeeId: salesManager.id,
    },
  });

  const salesReps = await Promise.all([
    prisma.employee.upsert({
      where: { employeeCode: 'EMP008' },
      update: {},
      create: {
        employeeCode: 'EMP008',
        firstName: 'Jennifer',
        lastName: 'Brown',
        email: 'jennifer.brown@hrenterprise.com',
        phone: '+1234567897',
        departmentId: departments[2].id,
        designation: 'Senior Sales Representative',
        managerId: salesManager.id,
        dateOfJoining: new Date('2021-05-15'),
        employmentStatus: 'active',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP009' },
      update: {},
      create: {
        employeeCode: 'EMP009',
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david.martinez@hrenterprise.com',
        phone: '+1234567898',
        departmentId: departments[2].id,
        designation: 'Sales Representative',
        managerId: salesManager.id,
        dateOfJoining: new Date('2022-03-01'),
        employmentStatus: 'active',
      },
    }),
  ]);

  for (const rep of salesReps) {
    await prisma.user.upsert({
      where: { email: rep.email },
      update: {},
      create: {
        email: rep.email,
        passwordHash: await bcrypt.hash('Employee@123', 12),
        isActive: true,
        emailVerified: true,
        roleId: employeeRole.id,
        employeeId: rep.id,
      },
    });
  }

  console.log(`✅ Created sales team with 1 manager and ${salesReps.length} representatives\n`);

  // ============================================
  // 8. Create Finance & Marketing Employees
  // ============================================
  console.log('👥 Creating finance and marketing employees...');

  const financeHead = await prisma.employee.upsert({
    where: { employeeCode: 'EMP010' },
    update: {},
    create: {
      employeeCode: 'EMP010',
      firstName: 'Amanda',
      lastName: 'White',
      email: 'amanda.white@hrenterprise.com',
      phone: '+1234567899',
      departmentId: departments[3].id, // Finance
      designation: 'Finance Director',
      dateOfJoining: new Date('2019-08-01'),
      employmentStatus: 'active',
    },
  });

  await prisma.department.update({
    where: { id: departments[3].id },
    data: { headId: financeHead.id },
  });

  await prisma.user.upsert({
    where: { email: 'amanda.white@hrenterprise.com' },
    update: {},
    create: {
      email: 'amanda.white@hrenterprise.com',
      passwordHash: await bcrypt.hash('Manager@123', 12),
      isActive: true,
      emailVerified: true,
      roleId: managerRole.id,
      employeeId: financeHead.id,
    },
  });

  const marketingHead = await prisma.employee.upsert({
    where: { employeeCode: 'EMP011' },
    update: {},
    create: {
      employeeCode: 'EMP011',
      firstName: 'Kevin',
      lastName: 'Lee',
      email: 'kevin.lee@hrenterprise.com',
      phone: '+1234567900',
      departmentId: departments[4].id, // Marketing
      designation: 'Marketing Director',
      dateOfJoining: new Date('2020-02-15'),
      employmentStatus: 'active',
    },
  });

  await prisma.department.update({
    where: { id: departments[4].id },
    data: { headId: marketingHead.id },
  });

  await prisma.user.upsert({
    where: { email: 'kevin.lee@hrenterprise.com' },
    update: {},
    create: {
      email: 'kevin.lee@hrenterprise.com',
      passwordHash: await bcrypt.hash('Manager@123', 12),
      isActive: true,
      emailVerified: true,
      roleId: managerRole.id,
      employeeId: marketingHead.id,
    },
  });

  console.log('✅ Created finance and marketing department heads\n');

  // ============================================
  // 9. Create Sample Attendance Records
  // ============================================
  console.log('📊 Creating sample attendance records...');

  const today = new Date();
  const employees = await prisma.employee.findMany({
    where: { employmentStatus: 'active' },
    take: 5,
  });

  for (const employee of employees) {
    // Create attendance for the last 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const checkIn = new Date(date);
      checkIn.setHours(9, Math.floor(Math.random() * 30), 0, 0);

      const checkOut = new Date(date);
      checkOut.setHours(17, 30 + Math.floor(Math.random() * 30), 0, 0);

      const workMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
      const lateMinutes = checkIn.getHours() >= 9 && checkIn.getMinutes() > 15 ?
        (checkIn.getHours() - 9) * 60 + checkIn.getMinutes() - 15 : 0;

      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: new Date(date.toISOString().split('T')[0]),
          },
        },
        update: {},
        create: {
          employeeId: employee.id,
          date: new Date(date.toISOString().split('T')[0]),
          checkIn,
          checkOut,
          status: lateMinutes > 0 ? 'late' : 'present',
          lateMinutes,
          workMinutes,
          overtimeMinutes: workMinutes > 480 ? workMinutes - 480 : 0,
        },
      });
    }
  }

  console.log(`✅ Created attendance records for ${employees.length} employees\n`);

  // ============================================
  // 10. Create Sample Leave Balances
  // ============================================
  console.log('🏖️ Creating leave balances...');

  const year = today.getFullYear();
  const allEmployees = await prisma.employee.findMany({
    where: { employmentStatus: 'active' },
  });

  for (const employee of allEmployees) {
    for (const leaveType of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year,
          },
        },
        update: {},
        create: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year,
          totalDays: leaveType.annualLimit,
          remainingDays: leaveType.annualLimit,
          usedDays: 0,
          pendingDays: 0,
          carriedForward: 0,
        },
      });
    }
  }

  console.log(`✅ Created leave balances for ${allEmployees.length} employees\n`);

  // ============================================
  // 11. Create Sample Leave Requests
  // ============================================
  console.log('📝 Creating sample leave requests...');

  const leaveRequests = await Promise.all([
    prisma.leaveRequest.create({
      data: {
        employeeId: engineers[0].id,
        leaveTypeId: leaveTypes[0].id, // Annual Leave
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
        days: 3,
        reason: 'Family vacation',
        status: 'pending',
      },
    }),
    prisma.leaveRequest.create({
      data: {
        employeeId: engineers[1].id,
        leaveTypeId: leaveTypes[1].id, // Sick Leave
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        days: 2,
        reason: 'Flu',
        status: 'approved',
        approvedBy: engManager.id,
        approvedAt: new Date(),
      },
    }),
    prisma.leaveRequest.create({
      data: {
        employeeId: salesReps[0].id,
        leaveTypeId: leaveTypes[2].id, // Casual Leave
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        days: 1,
        reason: 'Personal work',
        status: 'pending',
      },
    }),
  ]);

  // Update leave balances for approved requests
  const approvedRequest = leaveRequests.find(r => r.status === 'approved');
  if (approvedRequest) {
    await prisma.leaveBalance.update({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: approvedRequest.employeeId,
          leaveTypeId: approvedRequest.leaveTypeId,
          year,
        },
      },
      data: {
        remainingDays: { decrement: approvedRequest.days },
        usedDays: { increment: approvedRequest.days },
      },
    });
  }

  console.log(`✅ Created ${leaveRequests.length} leave requests\n`);

  // ============================================
  // Summary
  // ============================================
  console.log('🎉 Seed completed successfully!\n');
  console.log('=================================');
  console.log('📊 Database Summary:');
  console.log('=================================');
  console.log(`• Departments: ${await prisma.department.count()}`);
  console.log(`• Leave Types: ${await prisma.leaveType.count()}`);
  console.log(`• Roles: ${await prisma.role.count()}`);
  console.log(`• Permissions: ${await prisma.permission.count()}`);
  console.log(`• Employees: ${await prisma.employee.count()}`);
  console.log(`• Users: ${await prisma.user.count()}`);
  console.log(`• Attendance Records: ${await prisma.attendance.count()}`);
  console.log(`• Leave Requests: ${await prisma.leaveRequest.count()}`);
  console.log('=================================\n');

  console.log('🔑 Login Credentials:');
  console.log('---------------------------------');
  console.log('Admin: admin@hrenterprise.com / Admin@123');
  console.log('HR Manager: sarah.johnson@hrenterprise.com / HrManager@123');
  console.log('Manager: michael.chen@hrenterprise.com / Manager@123');
  console.log('Employees: <email> / Employee@123');
  console.log('---------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
