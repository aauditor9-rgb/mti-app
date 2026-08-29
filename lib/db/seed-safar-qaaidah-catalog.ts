// Seeds all 13 Safar Qaaidah levels and their items, verbatim from
// design/Madrassa Portal.dc.html's Progress Trackers > Safar Qaaidah screen (level
// numbers, item names, and each level's completion criteria only — no content beyond
// what the prototype itself shows). The design README says "Levels 1-10"; the
// prototype has 13, and the prototype is canonical.
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

type Criterion = (typeof schema.safarCriterionEnum.enumValues)[number];

const LEVELS: { level: number; criteria: Criterion[]; items: string[] }[] = [
  { level: 1, criteria: ["Recognition", "Makharij"], items: ["The alphabet"] },
  {
    level: 2,
    criteria: ["Recognition", "Makharij", "Fluency"],
    items: ["Mixed Alphabet", "Assorted letters", "Identity map", "Assorted joined letters", "First words", "Letter appearances"],
  },
  {
    level: 3,
    criteria: ["Accuracy", "Fluency"],
    items: ["Whole-word exercise", "Advanced joined letter examples", "Word diagrams", "Mixed exercise", "Challenging combinations"],
  },
  {
    level: 4,
    criteria: ["Accuracy", "Fluency"],
    items: ["Difference between Kāf Lām and Alif", "Advanced identity map", "Mixed exercise"],
  },
  {
    level: 5,
    criteria: ["Accuracy", "Fluency"],
    items: [
      "Fathah",
      "Kasrah",
      "Dammah",
      "Advanced pronunciation practice",
      "Similar letters",
      "Mixed exercise",
      "Fathatayn",
      "Kasratayn",
      "Dammatayn",
    ],
  },
  {
    level: 6,
    criteria: ["Accuracy", "Fluency"],
    items: [
      "Rule: The six stretched harakahs",
      "Fathah followed by joining alif",
      "Kasrah followed by joining ya",
      "Dammah followed by joining waw",
      "Long fathah",
      "Long Kasrah",
      "Long Dammah",
      "Līn: Fatha followed by joining waw",
      "Līn: Fathah followed by joining ya",
      "Mixed exercise",
    ],
  },
  {
    level: 7,
    criteria: ["Accuracy", "Fluency"],
    items: ["Rule: Madd lengths", "Sukun", "Joining exercise", "Shaddah"],
  },
  {
    level: 8,
    criteria: ["Accuracy", "Fluency"],
    items: ["Rule: Madd lengths", "The stretches", "Madd exercise", "Mixed exercise"],
  },
  {
    level: 9,
    criteria: ["Accuracy", "Fluency"],
    items: ["Silent letters", "Silent Alif in 'Ana'", "Silent Alif with a circle", "The openers", "Joining Nun", "Sukun followed by shaddah"],
  },
  { level: 10, criteria: ["Accuracy", "Fluency"], items: ["Two-word exercise", "Three-word exercise"] },
  {
    level: 11,
    criteria: ["Accuracy", "Fluency"],
    items: ["Rule: Stopping", "Stopping on fathahtayn", "Stopping on round Ta and Ha", "All other stops"],
  },
  {
    level: 12,
    criteria: ["Accuracy", "Fluency"],
    items: ["Rule: Stopping Symbols", "Four-word exercise", "Four-word exercise with stopping symbol"],
  },
  { level: 13, criteria: ["Accuracy", "Fluency"], items: ["One-line or verse exercise"] },
];

async function main() {
  const [madrasah] = await db.select().from(schema.madrasah).limit(1);
  if (!madrasah) throw new Error("No madrasah seeded — run `npm run db:seed` first.");

  let totalItems = 0;
  for (const { level, criteria, items } of LEVELS) {
    await db.delete(schema.safarQaaidahLevel).where(eq(schema.safarQaaidahLevel.levelNumber, level));

    const [row] = await db
      .insert(schema.safarQaaidahLevel)
      .values({ madrasahId: madrasah.id, levelNumber: level, criteria })
      .returning();

    await db.insert(schema.safarQaaidahItem).values(
      items.map((name, i) => ({
        madrasahId: madrasah.id,
        levelId: row.id,
        name,
        orderIndex: i,
      })),
    );
    totalItems += items.length;
  }

  console.log(`Seeded ${LEVELS.length} Safar Qaaidah levels and ${totalItems} items.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
