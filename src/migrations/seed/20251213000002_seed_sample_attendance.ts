// src/migrations/seed/20251213000002_seed_sample_attendance.ts
import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // Get the first employee
  const [empTarget] = await db`
    SELECT id FROM employees WHERE employee_number = 'EMP001' LIMIT 1
  `;

  if (empTarget) {
    const today = new Date().toISOString().split("T")[0];

    const [attExists] = await db`
      SELECT id FROM attendances 
      WHERE employee_id = ${empTarget.id} AND date = ${today}
    `;

    if (!attExists) {
      await db`
        INSERT INTO attendances (employee_id, date, check_in_time, status)
        VALUES (${empTarget.id}, ${today}, '08:00:00', 'hadir')
      `;
      console.log(`   ✅ Inserted attendance for EMP001 (${today})`);
    } else {
      console.log(`   ⏭️  Skipped: attendance for EMP001 (exists)`);
    }
  } else {
    console.log(`   ⚠️  Employee EMP001 not found, skipping attendance seed`);
  }
}
