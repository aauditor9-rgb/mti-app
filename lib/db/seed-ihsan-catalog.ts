// Seeds the fixed Iḥsān award catalog (design/README.md "Iḥsān (reward) points").
// This is a shared reference table, not tenant data — unlike seed.ts it is never
// deleted and recreated, just upserted, so re-running it is always safe.
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { sql as rawSql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const AWARDS: (typeof schema.ihsanAward.$inferInsert)[] = [
  { category: "Hudur", name: "Full Week", points: 1, automatic: true },
  { category: "Hudur", name: "On Time Every Day", points: 1, automatic: true },
  { category: "Ibadah", name: "Ṣalāh Without Asking", points: 2 },
  { category: "Ibadah", name: "Wuḍūʾ Kept", points: 1 },
  { category: "Ibadah", name: "Duʿāʾ Learnt", points: 2 },
  { category: "Ilm", name: "Clean Sabaq", points: 3 },
  { category: "Ilm", name: "Ahead of the Plan", points: 3 },
  { category: "Ilm", name: "Excellent Recitation", points: 3 },
  { category: "Ilm", name: "Homework Complete", points: 2 },
  { category: "Adab", name: "Truthfulness", points: 3 },
  { category: "Adab", name: "Best Adab", points: 2 },
  { category: "Adab", name: "Respect to Elders", points: 2 },
  { category: "Khidmah", name: "Helped a Younger Pupil", points: 3 },
  { category: "Khidmah", name: "Helped a Classmate", points: 2 },
  { category: "Khidmah", name: "Khidmah of the Class", points: 1 },
];

async function main() {
  await db
    .insert(schema.ihsanAward)
    .values(AWARDS)
    .onConflictDoUpdate({
      target: [schema.ihsanAward.category, schema.ihsanAward.name],
      set: { points: rawSql`excluded.points`, automatic: rawSql`excluded.automatic` },
    });

  console.log(`Seeded ${AWARDS.length} Iḥsān awards.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
