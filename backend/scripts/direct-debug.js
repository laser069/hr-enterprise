const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString:
      'postgresql://postgres:Dhanush02112005@localhost:5432/hr_enterprise?schema=public',
  });

  try {
    const res = await pool.query(
      "SELECT id, first_name, last_name, employment_status, salary_structure_id FROM employees WHERE email = 'admin@hrenterprise.com'",
    );
    if (res.rows.length > 0) {
      const emp = res.rows[0];
      console.log(`Employee: ${emp.first_name} ${emp.last_name}`);
      console.log(`Status: ${emp.employment_status}`);
      console.log(`Salary Structure ID: ${emp.salary_structure_id}`);

      if (!emp.salary_structure_id) {
        console.log(
          'ISSUE: Salary Structure is NULL. This employee cannot be calculated.',
        );
      }

      // Let's also list all structures to help the user assign one
      const structures = await pool.query(
        'SELECT id, name FROM salary_structures',
      );
      console.log('\nAvailable Structures:');
      structures.rows.forEach((s) => console.log(` - [${s.id}] ${s.name}`));
    } else {
      console.log('Employee not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
