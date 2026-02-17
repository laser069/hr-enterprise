
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = "postgresql://postgres:kaviraja6002@localhost:5432/hr_enterprise";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    const toIST = (date: Date) => new Date(date.getTime() + IST_OFFSET);
    const getDateString = (date: Date) => {
        const ist = toIST(date);
        return ist.toISOString().split('T')[0];
    };

    const todayStr = getDateString(new Date());
    console.log('Today (IST String):', todayStr);

    const todayDate = new Date(todayStr); // UTC Midnight
    console.log('Today (Date Obj UTC):', todayDate.toISOString());

    // Check active employees
    const employeeCount = await prisma.employee.count({
        where: { employmentStatus: 'active' }
    });
    console.log('Active Employees:', employeeCount);

    // Check attendance for today
    const attendanceCount = await prisma.attendance.count({
        where: { date: todayDate }
    });
    console.log('Attendance Records for today:', attendanceCount);

    // Get raw records
    const records = await prisma.attendance.findMany({
        where: { date: todayDate },
        take: 5
    });
    console.log('Sample Records:', JSON.stringify(records, null, 2));

    // Group by status
    const stats = await prisma.attendance.groupBy({
        by: ['status'],
        where: {
            date: todayDate,
        },
        _count: {
            status: true,
        },
    });
    console.log('Stats Group By:', JSON.stringify(stats, null, 2));

    // Check if any records exist at all (sanity check)
    const anyRecord = await prisma.attendance.findFirst();
    if (anyRecord) {
        console.log('First random record date:', anyRecord.date.toISOString());
    } else {
        console.log('Database is empty for attendance');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
