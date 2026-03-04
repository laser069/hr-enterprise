
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:dhanush@127.0.0.1:5432/hr_enterprise?schema=public';

const client = new Client({
    connectionString: DATABASE_URL,
});

async function main() {
    await client.connect();
    console.log('Connected to database');

    const structures = [
        {
            name: 'Standard Enterprise',
            description: 'Default salary structure for professional staff',
            basic: 25000,
            da: 5000,
            hra: 10000,
            conveyance: 2000,
            medicalAllowance: 1250,
            specialAllowance: 5000,
            professionalTax: 200,
            pf: 1800,
            esi: 500,
            overtimeRate: 1.5,
            isActive: true,
        },
        {
            name: 'Leadership tier',
            description: 'Compensation model for managers and directors',
            basic: 60000,
            da: 10000,
            hra: 25000,
            conveyance: 5000,
            medicalAllowance: 2500,
            specialAllowance: 15000,
            professionalTax: 500,
            pf: 3600,
            esi: 0,
            overtimeRate: 0,
            isActive: true,
        }
    ];

    for (const s of structures) {
        console.log(`Cleaning existing ${s.name}...`);
        await client.query('DELETE FROM salary_structures WHERE name = $1', [s.name]);

        console.log(`Inserting ${s.name}...`);
        await client.query(
            `INSERT INTO salary_structures (id, name, description, basic, da, hra, conveyance, medical_allowance, special_allowance, professional_tax, pf, esi, overtime_rate, is_active, created_at, updated_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
            [s.name, s.description, s.basic, s.da, s.hra, s.conveyance, s.medicalAllowance, s.specialAllowance, s.professionalTax, s.pf, s.esi, s.overtimeRate, s.isActive]
        );
    }

    // Link employees
    console.log('Linking employees...');
    const leadership = await client.query('SELECT id FROM salary_structures WHERE name = $1', ['Leadership tier']);
    const standard = await client.query('SELECT id FROM salary_structures WHERE name = $1', ['Standard Enterprise']);

    if (leadership.rowCount > 0) {
        await client.query("UPDATE employees SET salary_structure_id = $1 WHERE employee_code IN ('EMP001', 'EMP003')", [leadership.rows[0].id]);
    }
    if (standard.rowCount > 0) {
        await client.query("UPDATE employees SET salary_structure_id = $1 WHERE employee_code IN ('EMP002')", [standard.rows[0].id]);
    }

    console.log('Done');
    await client.end();
}

main().catch(console.error);
