// src/migrations/run.ts
import { sql, closeConnection } from "../lib/db";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize migrations tracking table if it doesn't exist
 */
async function initializeMigrationsTable(): Promise<void> {
  try {
    // Check if table exists
    const [tableExists] = await sql`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '_migrations'
    `;

    if (!tableExists) {
      await sql`
        CREATE TABLE _migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          batch INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `;
      console.log("📋 Created _migrations tracking table");
    }
  } catch (error) {
    console.error("💥 Error initializing migrations table:");
    throw error;
  }
}

/**
 * Get the latest batch number
 */
async function getLatestBatch(): Promise<number> {
  try {
    const [result] = await sql`
      SELECT MAX(batch) as max_batch FROM _migrations
    `;
    return (result?.max_batch ?? 0) + 1;
  } catch (error) {
    return 1;
  }
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(): Promise<Set<string>> {
  try {
    const results = await sql`
      SELECT name FROM _migrations ORDER BY created_at ASC
    `;
    return new Set(results.map((row: any) => row.name));
  } catch (error) {
    return new Set();
  }
}

/**
 * Record a migration execution
 */
async function recordMigration(name: string, batch: number): Promise<void> {
  await sql`
    INSERT INTO _migrations (name, batch) VALUES (${name}, ${batch})
  `;
}

/**
 * Load all migration files from a directory
 */
async function loadMigrationFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter((file) => file.endsWith(".ts"))
      .sort(); // Sort by filename (timestamp order)
  } catch (error) {
    return [];
  }
}

/**
 * Execute a migration file
 */
async function executeMigration(
  filePath: string,
  filename: string
): Promise<boolean> {
  try {
    const importUrl = pathToFileURL(filePath).href;
    // Use dynamic import
    const module = await import(importUrl);
    const upFunction = module.up;

    if (typeof upFunction !== "function") {
      console.error(`   ❌ ${filename}: Missing 'up' export`);
      return false;
    }

    // Execute the migration
    await upFunction(sql);
    console.log(`   ✅ ${filename}`);
    return true;
  } catch (error) {
    console.error(`   ❌ ${filename}: Execution failed`);
    console.error(`      ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log("🚀 Starting Database Migrations & Seeding...\n");

  try {
    // Step 1: Initialize migrations table
    console.log("📊 Initializing tracking table...");
    await initializeMigrationsTable();
    console.log("");

    // Step 2: Load executed migrations
    const executedMigrations = await getExecutedMigrations();
    const nextBatch = await getLatestBatch();

    let totalExecuted = 0;

    // Step 3: Run table migrations
    console.log("🏗️  [SCHEMA] Running table migrations...");
    const tableDir = join(__dirname, "table");
    const tableFiles = await loadMigrationFiles(tableDir);
    const pendingTableMigrations = tableFiles.filter(
      (file) => !executedMigrations.has(file)
    );

    if (pendingTableMigrations.length === 0) {
      console.log("   ⏭️  No pending migrations");
    } else {
      for (const file of pendingTableMigrations) {
        const filePath = join(tableDir, file);
        const success = await executeMigration(filePath, file);
        if (success) {
          await recordMigration(file, nextBatch);
          totalExecuted++;
        } else {
          throw new Error(`Migration failed: ${file}`);
        }
      }
    }
    console.log("");

    // Step 4: Run seeders
    console.log("🌱 [SEEDER] Running seeders...");
    const seedDir = join(__dirname, "seed");
    const seedFiles = await loadMigrationFiles(seedDir);
    const pendingSeeders = seedFiles.filter(
      (file) => !executedMigrations.has(file)
    );

    if (pendingSeeders.length === 0) {
      console.log("   ⏭️  No pending seeders");
    } else {
      for (const file of pendingSeeders) {
        const filePath = join(seedDir, file);
        const success = await executeMigration(filePath, file);
        if (success) {
          await recordMigration(file, nextBatch);
          totalExecuted++;
        } else {
          throw new Error(`Seeder failed: ${file}`);
        }
      }
    }
    console.log("");

    // Step 5: Summary
    if (totalExecuted === 0) {
      console.log("✨ Database is up to date!");
    } else {
      console.log(
        `✨ Completed! Executed ${totalExecuted} migration(s)/seeder(s) in batch ${nextBatch}`
      );
    }
  } catch (error) {
    console.error("\n💥 Critical Error during migrations:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Execute if run directly
runMigrations();