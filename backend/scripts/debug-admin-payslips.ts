import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hrenterprise.com' },
      include: {
        employee: true
      }
    });

    if (!user) {
      console.log('User admin@hrenterprise.com not found');
      return;
    }

    console.log(`User: ${user.email}`);
    console.log(`Employee Linked: ${user.employee ? 'YES' : 'NO'}`);
    
    if (user.employee) {
      const employeeId = user.employee.id;
      console.log(`Employee ID: ${employeeId}`);
      
      const entries = await prisma.payrollEntry.findMany({
        where: { employeeId: employeeId },
        include: {
          payrollRun: true
        }
      });
      
      console.log(`Total Payroll Entries found: ${entries.length}`);
      entries.forEach(e => {
        console.log(` - Run: ${e.payrollRun.month}/${e.payrollRun.year}, Status: ${e.payrollRun.status}, Net: ${e.netSalary}`);
      });
    } else {
      // Find any employee with this email
      const empByEmail = await prisma.employee.findUnique({
          where: { email: 'admin@hrenterprise.com' }
      });
      if (empByEmail) {
          console.log(`Employee found by email but NOT linked to User: ${empByEmail.id}`);
          // Check if userId is set on this employee
          console.log(`Employee.userId: ${empByEmail.userId}`);
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
