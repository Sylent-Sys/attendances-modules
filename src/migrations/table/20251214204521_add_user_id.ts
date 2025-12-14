import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // alter employees table to add user_id column
  await db`
    ALTER TABLE employees
    ADD COLUMN user_id INT UNIQUE;
  `;
  console.log("   ✅ Added user_id column to employees table");
}
