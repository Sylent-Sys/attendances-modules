// src/migrations/maker.ts
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a timestamp in YYYYMMDDHHmmss format
 */
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${date}${hours}${minutes}${seconds}`;
}

/**
 * Convert name to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Generate boilerplate content for migrations
 */
function generateMigrationTemplate(): string {
  return `import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // TODO: Write your migration logic here
  // Example:
  // await db\`
  //   CREATE TABLE my_table (
  //     id INT AUTO_INCREMENT PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL
  //   ) ENGINE=InnoDB;
  // \`;
  // console.log("✅ Created my_table");
}
`;
}

/**
 * Generate boilerplate content for seeders
 */
function generateSeedTemplate(): string {
  return `import { SQL } from "bun";

export async function up(db: SQL): Promise<void> {
  // TODO: Write your seeder logic here
  // Example:
  // const [exists] = await db\`SELECT id FROM my_table LIMIT 1\`;
  // if (!exists) {
  //   await db\`INSERT INTO my_table (name) VALUES ('Sample Data')\`;
  //   console.log("✅ Seeded data");
  // } else {
  //   console.log("⏭️  Data already exists");
  // }
}
`;
}

/**
 * Main function to create migration/seed file
 */
async function createFile(name: string, type: "migration" | "seed") {
  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      console.error("❌ Error: Name is required");
      console.error('Usage: bun run src/migrations/maker.ts <name> --type=migration|seed');
      process.exit(1);
    }

    // Generate timestamp and filename
    const timestamp = generateTimestamp();
    const snakeCaseName = toSnakeCase(name);
    const filename = `${timestamp}_${snakeCaseName}.ts`;

    // Determine directory and template
    let targetDir: string;
    let template: string;

    if (type === "migration") {
      targetDir = join(__dirname, "table");
      template = generateMigrationTemplate();
    } else if (type === "seed") {
      targetDir = join(__dirname, "seed");
      template = generateSeedTemplate();
    } else {
      console.error('❌ Error: Invalid type. Use --type=migration or --type=seed');
      process.exit(1);
    }

    // Create directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });

    // Create file
    const filePath = join(targetDir, filename);
    await fs.writeFile(filePath, template, "utf-8");

    console.log(`✅ Created ${type} file:`);
    console.log(`   📄 ${filePath}`);
    console.log(`\n   You can now edit this file to add your ${type} logic.`);
  } catch (error) {
    console.error("💥 Error creating file:");
    console.error(error);
    process.exit(1);
  }
}

/**
 * Parse CLI arguments and execute
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("📖 Migration File Generator");
    console.log("\nUsage:");
    console.log("  bun run src/migrations/maker.ts <name> --type=migration");
    console.log("  bun run src/migrations/maker.ts <name> --type=seed");
    console.log("\nExamples:");
    console.log("  bun run src/migrations/maker.ts create_users_table --type=migration");
    console.log("  bun run src/migrations/maker.ts fill_users --type=seed");
    process.exit(0);
  }

  const name = args[0];
  const typeArg = args[1] || "";
  const typeMatch = typeArg.match(/--type=(migration|seed)/);

  if (!typeMatch) {
    console.error('❌ Error: Missing or invalid --type argument');
    console.error('Usage: bun run src/migrations/maker.ts <name> --type=migration|seed');
    process.exit(1);
  }

  const type = typeMatch[1] as "migration" | "seed";
  await createFile(name, type);
}

main();
