
const { Client } = require('pg');
require('dotenv').config();

async function initDb() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    // Create a connection string to the 'postgres' database instead of 'hr_enterprise'
    const adminUrl = connectionString.replace(/\/hr_enterprise/, '/postgres');
    console.log('Connecting to admin database:', adminUrl);

    const client = new Client({
        connectionString: adminUrl,
    });

    try {
        await client.connect();
        console.log('Connected to admin database.');

        // Check if hr_enterprise exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'hr_enterprise'");
        if (res.rowCount === 0) {
            console.log("Database 'hr_enterprise' does not exist. Creating it...");
            await client.query('CREATE DATABASE hr_enterprise');
            console.log("Database 'hr_enterprise' created successfully.");
        } else {
            console.log("Database 'hr_enterprise' already exists.");
        }

        await client.end();
    } catch (err) {
        console.error('Error initializing database:', err.stack);
        process.exit(1);
    }
}

initDb();
