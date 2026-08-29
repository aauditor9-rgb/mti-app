// Applies policies.sql to the database. Run after `npm run db:push`.
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { join } from "node:path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const file = join(__dirname, "policies.sql");

async function main() {
  await sql.file(file);
  console.log("Applied lib/db/policies.sql");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
