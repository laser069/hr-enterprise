
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
    const dateObj = new Date(todayStr); // UTC Midnight
    console.log('Processing date:', dateObj.toISOString());

    // Get all active employees
    const activeEmployees = await prisma.employee.findMany({
        where: {
            employmentStatus: 'active',
        },
        select: {
            id: true,
        },
    });
    console.log(`Found ${activeEmployees.length} active employees`);

    // Get employees who already have attendance records
    const existingAttendance = await prisma.attendance.findMany({
        where: {
            date: dateObj,
        },
        select: {
            employeeId: true,
        },
    });
    console.log(`Found ${existingAttendance.length} existing attendance records for today`);

    const existingEmployeeIds = new Set(existingAttendance.map((a) => a.employeeId));

    // Create absent records for employees without attendance
    const absentEmployees = activeEmployees.filter(
        (e) => !existingEmployeeIds.has(e.id),
    );
    console.log(`Found ${absentEmployees.length} employees to mark absent`);

    if (absentEmployees.length > 0) {
        try {
            await prisma.attendance.createMany({
                data: absentEmployees.map((e) => ({
                    employeeId: e.id,
                    date: dateObj,
                    status: 'absent',
                })),
                // skipDuplicates: true, // Intentionally commmented out to reproduce potential error
            });
            console.log('Successfully marked absentees');
        } catch (error) {
            console.error('Error marking absentees:', error);
        }

    } else {
        console.log('No absentees to mark');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
