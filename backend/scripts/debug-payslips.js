require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hrenterprise.com' },
      include: {
        employee: true,
      },
    });

    if (!user) {
      console.log('User admin@hrenterprise.com not found');
      return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`User Email: ${user.email}`);
    console.log(`User employeeId field: ${user.employeeId}`);

    if (user.employee) {
      console.log(
        `Employee Name: ${user.employee.firstName} ${user.employee.lastName}`,
      );
      console.log(`Employee ID: ${user.employee.id}`);

      const entries = await prisma.payrollEntry.findMany({
        where: { employeeId: user.employee.id },
        include: {
          payrollRun: true,
        },
      });

      console.log(`Total Payroll Entries: ${entries.length}`);
      entries.forEach((e) => {
        console.log(
          ` - Run: ${e.payrollRun.month}/${e.payrollRun.year}, RunStatus: ${e.payrollRun.status}, EntryNet: ${e.netSalary}`,
        );
      });
    } else {
      console.log(
        'NO employee record linked to this user in the users.employee_id field.',
      );

      // Try to find employee by email
      const employees = await prisma.employee.findMany({
        where: { email: 'admin@hrenterprise.com' },
      });
      console.log(
        `Found ${employees.length} employees with email admin@hrenterprise.com`,
      );
      employees.forEach((emp) => {
        console.log(
          ` - Emp ID: ${emp.id}, Name: ${emp.firstName} ${emp.lastName}`,
        );
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
