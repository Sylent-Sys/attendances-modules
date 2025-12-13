// src/migrations/table/20251213000001_create_employees_table.ts
import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // Create Employees table
  await db`
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      resident_id INT NULL,
      employee_number VARCHAR(30) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      position VARCHAR(100),
      region_id INT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  console.log("   ✅ Employees table created/verified");
}
