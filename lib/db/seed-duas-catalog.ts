// Seeds the Reception year's du'a curriculum, verbatim (English names only) from
// design/Madrassa Portal.dc.html's Progress Trackers > Du'as screen. Other years start
// empty and are built out via "+ Add du'a" on /progress-trackers/duas — no Arabic or
// translation text is fabricated here, only the names the prototype itself shows.
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const RECEPTION_DUAS = [
  "Ta'awwuz",
  "Tasmiyah",
  "1st Kalimah",
  "2nd Kalimah",
  "Before Eating",
  "After Eating",
  "On Forgetting to Read Eating Dua",
  "After Drinking Milk",
  "After Drinking Water",
  "Entering Toilet",
  "Leaving Toilet",
  "Before Sleeping",
  "On Awakening",
  "Salam & Reply",
  "After Hearing Prophet's Name",
  "When Sneezing",
  "When Someone Else Sneezes",
  "One Who Sneezed Replies",
  "Praising Allah",
  "When Amazed",
  "When Something Makes You Happy",
  "Thanking Someone",
  "When You Make A Mistake",
  "When You Intend to Do Something",
  "99 Names of Allah 1-10",
];

async function main() {
  const [madrasah] = await db.select().from(schema.madrasah).limit(1);
  if (!madrasah) throw new Error("No madrasah seeded — run `npm run db:seed` first.");

  await db.delete(schema.duaCatalogItem).where(eq(schema.duaCatalogItem.year, "Reception"));

  await db.insert(schema.duaCatalogItem).values(
    RECEPTION_DUAS.map((name, i) => ({
      madrasahId: madrasah.id,
      year: "Reception" as const,
      name,
      orderIndex: i,
    })),
  );

  console.log(`Seeded ${RECEPTION_DUAS.length} Reception du'as.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
