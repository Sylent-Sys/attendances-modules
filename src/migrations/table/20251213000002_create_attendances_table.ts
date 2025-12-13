// src/migrations/table/20251213000002_create_attendances_table.ts
import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // Create Attendances table
  await db`
    CREATE TABLE IF NOT EXISTS attendances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      check_in_time TIME,
      check_out_time TIME,
      status VARCHAR(20),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  console.log("   ✅ Attendances table created/verified");
}
