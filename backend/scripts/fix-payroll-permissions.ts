import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔐 Adding missing payroll permissions...');

  const payrollPermissions = [
    { name: 'View Payroll', resource: 'payroll', action: 'read' },
    { name: 'Create Payroll', resource: 'payroll', action: 'create' },
    { name: 'Update Payroll', resource: 'payroll', action: 'update' },
    { name: 'Delete Payroll', resource: 'payroll', action: 'delete' },
    { name: 'Manage Payroll', resource: 'payroll', action: 'manage' },
  ];

  for (const perm of payrollPermissions) {
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

  const allPayrollPerms = await prisma.permission.findMany({
    where: { resource: 'payroll' },
  });

  // Assign to admin role
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (adminRole) {
    for (const perm of allPayrollPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }
    console.log('✅ Payroll permissions assigned to admin role');
  }

  // Assign read/manage to hr_manager role
  const hrRole = await prisma.role.findUnique({ where: { name: 'hr_manager' } });
  if (hrRole) {
    for (const perm of allPayrollPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: hrRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: hrRole.id,
          permissionId: perm.id,
        },
      });
    }
    console.log('✅ Payroll permissions assigned to hr_manager role');
  }

  console.log('✨ All done!');
}

main()
  .catch((e) => {
    console.error('❌ Failed to fix permissions:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
