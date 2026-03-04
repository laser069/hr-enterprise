
const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres:dhanush@127.0.0.1:5432/hr_enterprise?schema=public';
const client = new Client({ connectionString: DATABASE_URL });

async function main() {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'salary_structures'");
    console.log('Columns:', res.rows.map(r => r.column_name));
    await client.end();
}
main().catch(console.error);
