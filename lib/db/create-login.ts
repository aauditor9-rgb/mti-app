// Creates a real Supabase Auth login for a staff member or guardian and links it via
// user_id. This is the only place the service-role key is used for a write — a one-off
// admin script, never a request handler (design/TECH_STACK.md "Multi-tenancy").
//
// Usage:
//   npm run db:create-login -- --staff "Apa Samia" --email apa.samia@mti.org.uk --password "Str0ngPass!"
//   npm run db:create-login -- --guardian "Ruhiya Azmeen" --email ruhia2004@yahoo.com --password "Str0ngPass!"
//
// Matches by exact name (case-insensitive) against the single seeded madrasah. If the
// staff/guardian row has no email on file yet, --email also backfills it there.
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, ilike } from "drizzle-orm";
import * as schema from "./schema";
import { guardian, madrasah, staff } from "./schema";
import { createAdminClient } from "@/lib/supabase/admin";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      out[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const { staff: staffName, guardian: guardianName, email, password } = args;

  if (!email || !password || (!staffName && !guardianName) || (staffName && guardianName)) {
    console.error(
      'Usage: npm run db:create-login -- --staff "Name" --email x@y.com --password "..." (or --guardian instead of --staff)',
    );
    process.exit(1);
  }

  const [madrasahRow] = await db.select().from(madrasah).limit(1);
  if (!madrasahRow) throw new Error("No madrasah seeded — run `npm run db:seed`.");

  const admin = createAdminClient();

  if (staffName) {
    const [row] = await db
      .select()
      .from(staff)
      .where(and(eq(staff.madrasahId, madrasahRow.id), ilike(staff.name, staffName)))
      .limit(1);
    if (!row) throw new Error(`No staff member named "${staffName}" found.`);
    if (row.userId) throw new Error(`${row.name} already has a login linked.`);

    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(`Failed to create auth user: ${error?.message}`);

    await db
      .update(staff)
      .set({ userId: data.user.id, email: row.email ?? email, portalAccess: true })
      .where(eq(staff.id, row.id));

    console.log(`Linked login for staff "${row.name}" (${row.role}) — sign in at /sign-in with ${email}.`);
    return;
  }

  const [row] = await db
    .select()
    .from(guardian)
    .where(and(eq(guardian.madrasahId, madrasahRow.id), ilike(guardian.name, guardianName!)))
    .limit(1);
  if (!row) throw new Error(`No guardian named "${guardianName}" found.`);
  if (row.userId) throw new Error(`${row.name} already has a login linked.`);

  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Failed to create auth user: ${error?.message}`);

  await db.update(guardian).set({ userId: data.user.id, email: row.email ?? email }).where(eq(guardian.id, row.id));

  console.log(`Linked login for guardian "${row.name}" — sign in at /sign-in with ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
