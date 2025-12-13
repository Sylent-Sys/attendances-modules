// src/migrations/seed/20251213000001_seed_employees.ts
import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  const employees = [
    { nip: "EMP001", name: "Budi Santoso", pos: "Manager" },
    { nip: "EMP002", name: "Siti Aminah", pos: "Staff" },
    { nip: "EMP003", name: "Joko Anwar", pos: "Staff" },
  ];

  for (const emp of employees) {
    const [exists] = await db`
      SELECT id FROM employees WHERE employee_number = ${emp.nip}
    `;

    if (!exists) {
      await db`
        INSERT INTO employees (employee_number, name, position) 
        VALUES (${emp.nip}, ${emp.name}, ${emp.pos})
      `;
      console.log(`   ✅ Inserted: ${emp.name}`);
    } else {
      console.log(`   ⏭️  Skipped: ${emp.name} (exists)`);
    }
  }
}
