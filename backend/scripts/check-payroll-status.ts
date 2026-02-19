import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const run = await prisma.payrollRun.findUnique({
      where: {
        month_year: {
          month: 2,
          year: 2026
        }
      },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    });

    if (run) {
      console.log('--- PAYROLL RUN FOUND ---');
      console.log(`ID: ${run.id}`);
      console.log(`Period: ${run.month}/${run.year}`);
      console.log(`Status: ${run.status}`);
      console.log(`Entries Count: ${run._count.entries}`);
    } else {
      console.log('--- NO RUN FOUND FOR FEB 2026 ---');
    }

    const admin = await prisma.user.findUnique({
      where: { email: 'admin@hrenterprise.com' },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (admin) {
      console.log('\n--- ADMIN PERMISSIONS ---');
      const payrollPerms = admin.role.permissions.filter(p => p.permission.resource === 'payroll');
      console.log(`Payroll Permissions Count: ${payrollPerms.length}`);
      payrollPerms.forEach(p => console.log(` - ${p.permission.name} (${p.permission.action})`));
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
