// Seeds the Year 1-8 surah curriculum, verbatim from design/Madrassa Portal.dc.html's
// Progress Trackers > Surahs screen (surah names and verse counts only — the prototype
// itself never fabricates more than that). verseCount is null where the prototype shows
// none (the two partial "Surah Kahf" ranges in Year 6).
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

const SURAHS_BY_YEAR: Record<string, { name: string; verseCount: number | null }[]> = {
  "Year 1": [
    { name: "Surah Fatihah", verseCount: 7 },
    { name: "Surah Naas", verseCount: 6 },
    { name: "Surah Falaq", verseCount: 5 },
    { name: "Surah Ikhlaas", verseCount: 4 },
    { name: "Surah Al-Kawthar", verseCount: 3 },
  ],
  "Year 2": [
    { name: "Surah Al-Masad", verseCount: 5 },
    { name: "Surah An-Nasr", verseCount: 3 },
    { name: "Surah Al-Kafirun", verseCount: 6 },
    { name: "Surah Al-Ma'un", verseCount: 7 },
    { name: "Surah Quraysh", verseCount: 4 },
    { name: "Surah Al-Fil", verseCount: 5 },
    { name: "Surah Al-Asr", verseCount: 3 },
  ],
  "Year 3": [
    { name: "Surah Al-Humazah", verseCount: 9 },
    { name: "Surah At-Takathur", verseCount: 8 },
    { name: "Surah Al-Qari'ah", verseCount: 11 },
    { name: "Surah Al-Adiyat", verseCount: 11 },
    { name: "Surah Az-Zalzalah", verseCount: 8 },
    { name: "Surah Al-Bayyinah", verseCount: 8 },
    { name: "Surah Al-Qadr", verseCount: 5 },
  ],
  "Year 4": [
    { name: "Surah Al-Alaq", verseCount: 19 },
    { name: "Surah At-Tin", verseCount: 8 },
    { name: "Surah Ash-Sharh", verseCount: 8 },
    { name: "Surah Ad-Duhaa", verseCount: 11 },
  ],
  "Year 5": [
    { name: "Surah Mulk", verseCount: 30 },
    { name: "Surah Sajdah", verseCount: 30 },
  ],
  "Year 6": [
    { name: "Surah Waqiah", verseCount: 96 },
    { name: "1st 10 verses of Surah Kahf", verseCount: null },
    { name: "Last 10 verses of Surah Kahf", verseCount: null },
  ],
  "Year 7": [{ name: "Surah Yasin", verseCount: 83 }],
  "Year 8": [{ name: "Surah Kahf", verseCount: 110 }],
};

async function main() {
  const [madrasah] = await db.select().from(schema.madrasah).limit(1);
  if (!madrasah) throw new Error("No madrasah seeded — run `npm run db:seed` first.");

  let total = 0;
  for (const [year, surahs] of Object.entries(SURAHS_BY_YEAR)) {
    await db
      .delete(schema.surahCatalogItem)
      .where(eq(schema.surahCatalogItem.year, year as (typeof schema.admissionYearEnum.enumValues)[number]));

    await db.insert(schema.surahCatalogItem).values(
      surahs.map((s, i) => ({
        madrasahId: madrasah.id,
        year: year as (typeof schema.admissionYearEnum.enumValues)[number],
        name: s.name,
        verseCount: s.verseCount,
        orderIndex: i,
      })),
    );
    total += surahs.length;
  }

  console.log(`Seeded ${total} surah catalog items across Year 1-8.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
