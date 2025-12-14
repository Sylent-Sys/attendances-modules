import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // Edit existing employees table to fill in user_id for existing records
  const employees = await db`SELECT id FROM employees`;
  for (const employee of employees) {
    // For demonstration, we will set user_id to be the same as employee id
    await db`
      UPDATE employees
      SET user_id = ${employee.id}
      WHERE id = ${employee.id};
    `;
  }
  console.log("   ✅ Updated existing employee records with user_id");
}
