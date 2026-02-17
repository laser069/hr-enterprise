
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
    const todayDate = new Date(todayStr); // UTC Midnight
    console.log('Seeding data for date:', todayStr);

    const attendanceRecords = await prisma.attendance.findMany({
        where: { date: todayDate },
        take: 5
    });

    if (attendanceRecords.length < 3) {
        console.log('Not enough records to seed. Please ensure markAbsentees has run.');
        return;
    }

    // 1. Mark first employee as PRESENT (Checked in at 9:00 AM)
    const presentRecord = attendanceRecords[0];
    const checkInTime = new Date(todayDate);
    checkInTime.setHours(3, 30, 0, 0); // 9:00 AM IST is 3:30 AM UTC

    await prisma.attendance.update({
        where: { id: presentRecord.id },
        data: {
            status: 'present',
            checkIn: checkInTime,
            lateMinutes: 0,
            workMinutes: 0 // In progress
        }
    });
    console.log(`Updated ${presentRecord.id} to PRESENT`);

    // 2. Mark second employee as LATE (Checked in at 10:00 AM)
    const lateRecord = attendanceRecords[1];
    const lateCheckIn = new Date(todayDate);
    lateCheckIn.setHours(4, 30, 0, 0); // 10:00 AM IST is 4:30 AM UTC

    await prisma.attendance.update({
        where: { id: lateRecord.id },
        data: {
            status: 'late',
            checkIn: lateCheckIn,
            lateMinutes: 45, // 9:15 threshold
            workMinutes: 0
        }
    });
    console.log(`Updated ${lateRecord.id} to LATE`);

    // 3. Mark third employee as CHECKED OUT (Present, completed work)
    const completedRecord = attendanceRecords[2];
    const completedCheckIn = new Date(todayDate);
    completedCheckIn.setHours(3, 0, 0, 0); // 8:30 AM IST
    const completedCheckOut = new Date(todayDate);
    completedCheckOut.setHours(12, 0, 0, 0); // 5:30 PM IST

    await prisma.attendance.update({
        where: { id: completedRecord.id },
        data: {
            status: 'present',
            checkIn: completedCheckIn,
            checkOut: completedCheckOut,
            lateMinutes: 0,
            workMinutes: 540 // 9 hours
        }
    });
    console.log(`Updated ${completedRecord.id} to PRESENT (Checked Out)`);

}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
