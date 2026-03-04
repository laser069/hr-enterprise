
import 'dotenv/config';
import { Client } from 'pg';

async function checkDatabase() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        return;
    }

    // Try connecting to the specific database
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Successfully connected to hr_enterprise database.');
        const res = await client.query('SELECT COUNT(*) FROM "User"');
        console.log('User count:', res.rows[0].count);
        await client.end();
    } catch (err: any) {
        console.error('Error connecting to hr_enterprise:', err.message);

        // Try connecting to 'postgres' to see if it exists
        const adminUrl = connectionString.replace(/\/hr_enterprise/, '/postgres');
        const adminClient = new Client({ connectionString: adminUrl });
        try {
            await adminClient.connect();
            const res = await adminClient.query("SELECT datname FROM pg_database WHERE datname = 'hr_enterprise'");
            if (res.rowCount === 0) {
                console.log("Database 'hr_enterprise' does not exist.");
            } else {
                console.log("Database 'hr_enterprise' exists, but connection failed.");
            }
            await adminClient.end();
        } catch (adminErr: any) {
            console.error('Error connecting to postgres database:', adminErr.message);
        }
    }
}

checkDatabase();
