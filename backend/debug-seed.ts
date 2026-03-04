
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
    console.log('Testing connection...');
    const count = await prisma.employee.count();
    console.log(`Employee count: ${count}`);

    console.log('Creating test salary structure...');
    const structure = await prisma.salaryStructure.upsert({
        where: { name: 'Test Structure' },
        update: {},
        create: {
            name: 'Test Structure',
            description: 'Test',
            basic: 1000,
            hra: 500,
            isActive: true,
        },
    });
    console.log('Created:', structure);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
