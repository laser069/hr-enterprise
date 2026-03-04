
import 'dotenv/config';
import { Client } from 'pg';

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection to:', connectionString);

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Successfully connected to Postgres!');

        const res = await client.query('SELECT current_database(), current_user');
        console.log('Database Info:', res.rows[0]);

        await client.end();
    } catch (err: any) {
        console.error('Connection error:', err.stack);
        process.exit(1);
    }
}

testConnection();
