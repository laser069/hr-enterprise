
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:dhanush@127.0.0.1:5432/hr_enterprise?schema=public';

const client = new Client({
    connectionString: DATABASE_URL,
});

async function main() {
    await client.connect();
    console.log('Connected to database');

    try {
        console.log('Adding missing columns to salary_structures...');

        // Check if 'da' exists
        const daCheck = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_structures' AND column_name = 'da'");
        if (daCheck.rowCount === 0) {
            console.log('Adding column "da"...');
            await client.query('ALTER TABLE salary_structures ADD COLUMN da DECIMAL(12, 2) DEFAULT 0');
        } else {
            console.log('Column "da" already exists.');
        }

        // Check if 'overtime_rate' exists
        const otCheck = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_structures' AND column_name = 'overtime_rate'");
        if (otCheck.rowCount === 0) {
            console.log('Adding column "overtime_rate"...');
            await client.query('ALTER TABLE salary_structures ADD COLUMN overtime_rate DECIMAL(4, 2) DEFAULT 1.5');
        } else {
            console.log('Column "overtime_rate" already exists.');
        }

        console.log('Schema fixed successfully.');
    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
