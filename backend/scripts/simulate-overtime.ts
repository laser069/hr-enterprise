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
  const email = process.argv[2] || 'admin@hrenterprise.com';
  console.log(`\n🚀 Simulating overtime protocol for: ${email}`);

  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    console.error(`❌ Error: Employee with email "${email}" not found.`);
    return;
  }

  // Define times for "Today"
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const date = new Date(dateStr);

  // Set 9:00 AM IST Check-in
  const checkIn = new Date(date);
  checkIn.setHours(9, 0, 0, 0);

  // Set 7:00 PM IST Check-out (10 hours shift)
  const checkOut = new Date(date);
  checkOut.setHours(19, 0, 0, 0);

  const workMinutes = 600; // 10 hours
  const overtimeMinutes = 120; // 600 - 480 (8 hours)

  await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date,
      },
    },
    update: {
      checkIn,
      checkOut,
      workMinutes,
      overtimeMinutes,
      status: 'present',
      notes: 'Simulated Overtime (Protocol Override)',
    },
    create: {
      employeeId: employee.id,
      date,
      checkIn,
      checkOut,
      workMinutes,
      overtimeMinutes,
      status: 'present',
      notes: 'Simulated Overtime (Protocol Override)',
    },
  });

  console.log('✅ Overtime simulated successfully!');
  console.log('------------------------------------');
  console.log(`📅 Date: ${dateStr}`);
  console.log(`🕒 In:   09:00 AM`);
  console.log(`🕒 Out:  07:00 PM (10 hours)`);
  console.log(`⚡ OT:   120 minutes (2 hours)`);
  console.log('------------------------------------\n');
  console.log('Now navigate to "Payroll Runs" and calculate the payroll for this month.');
}

main()
  .catch((e) => {
    console.error('❌ Simulation Failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
