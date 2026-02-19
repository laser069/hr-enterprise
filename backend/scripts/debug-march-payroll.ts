import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const employees = await prisma.employee.findMany({
      where: {
        salaryStructureId: { not: null }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        salaryStructure: true
      }
    });

    console.log(`Found ${employees.length} employees with salary structures.`);
    employees.forEach(e => {
      console.log(` - ${e.firstName} ${e.lastName}: Structure ID ${e.salaryStructure?.id}`);
    });

    const run = await prisma.payrollRun.findUnique({
        where: { month_year: { month: 3, year: 2026 } },
        include: { entries: true }
    });

    if (run) {
        console.log(`\nMarch 2026 Run Status: ${run.status}`);
        console.log(`Entries Count: ${run.entries.length}`);
    } else {
        console.log('\nMarch 2026 Run not found.');
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
