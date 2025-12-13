import { SQL } from "bun";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const sql = new SQL({
  url: process.env.DATABASE_URL,
});

export const closeConnection = async () => {
  await sql.close();
};