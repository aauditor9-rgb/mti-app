// Seeds the reference/config data behind Overview + Operations: calendar sets, terms,
// classes' calendar assignment, inventory catalog, and the policy list. Term date
// ranges and inventory items are taken verbatim from design/Madrassa Portal.dc.html;
// holidays are left empty (no concrete holiday dates were verified from the
// prototype, so none are fabricated — added via Settings > Calendars instead).
// Idempotent: delete-then-insert scoped to this madrasah.
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { eq, inArray } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

const HIFZ_CLASS_NAMES = ["Hifz Class Boys", "Pre-Hifdh Boys"];

const INVENTORY_ITEMS: { name: string; category: (typeof schema.inventoryCategoryEnum.enumValues)[number]; stock: number; reorderLevel: number; price: string; issuedUnpaid: number }[] = [
  { name: "Safar Qaaidah", category: "Books", stock: 24, reorderLevel: 10, price: "4.00", issuedUnpaid: 3 },
  { name: "Safar Islamic Studies - Year 1", category: "Books", stock: 6, reorderLevel: 10, price: "6.50", issuedUnpaid: 2 },
  { name: "Juz Amma (large print)", category: "Books", stock: 31, reorderLevel: 10, price: "3.50", issuedUnpaid: 0 },
  { name: "Du'a Syllabus booklet", category: "Books", stock: 14, reorderLevel: 10, price: "2.00", issuedUnpaid: 5 },
  { name: "Topi (navy)", category: "Uniform", stock: 9, reorderLevel: 10, price: "3.00", issuedUnpaid: 1 },
  { name: "Hijab (navy)", category: "Uniform", stock: 17, reorderLevel: 10, price: "4.50", issuedUnpaid: 0 },
  { name: "Exercise books (pack of 10)", category: "Stationery", stock: 4, reorderLevel: 5, price: "3.20", issuedUnpaid: 0 },
  { name: "Certificate card (pack of 25)", category: "Stationery", stock: 2, reorderLevel: 5, price: "5.00", issuedUnpaid: 0 },
];

const POLICIES: { title: string; version: string; reviewByDate: string | null }[] = [
  { title: "Attendance and Punctuality Policy", version: "V 1.1", reviewByDate: "2026-08-31" },
  { title: "Lateness Policy", version: "V 1.1", reviewByDate: "2026-08-31" },
  { title: "Anti-Bullying Policy", version: "V 1.0", reviewByDate: "2027-08-31" },
  { title: "Safeguarding and Child Protection Policy", version: "V 1.0", reviewByDate: "2026-08-31" },
  { title: "Data Protection and GDPR Policy", version: "V 1.0", reviewByDate: "2026-08-31" },
  { title: "Health, Safety, First Aid and Wellbeing Policy", version: "V 1.0", reviewByDate: "2027-08-31" },
  { title: "Parent and Guardian Complaints Policy", version: "V 1.0", reviewByDate: "2026-08-31" },
  { title: "Technology Use Policy", version: "V 1.0", reviewByDate: "2026-08-31" },
  { title: "Whistleblowing, Staff Code of Conduct and Disciplinary Policy", version: "V 1.0", reviewByDate: "2026-08-31" },
  { title: "CCTV Policy", version: "V 1.0", reviewByDate: "2026-08-31" },
];

async function main() {
  const [madrasah] = await db.select().from(schema.madrasah).limit(1);
  if (!madrasah) throw new Error("No madrasah seeded — run `npm run db:seed` first.");

  // Calendars
  await db.delete(schema.calendarSet).where(eq(schema.calendarSet.madrasahId, madrasah.id));

  const [maktabCalendar] = await db
    .insert(schema.calendarSet)
    .values({
      madrasahId: madrasah.id,
      name: "Maktab evening classes",
      description: "Standard evening maktab — two sessions Mon–Thu, plus the Friday assessment lesson.",
      teachingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      academicYearStart: "2025-09-01",
      academicYearEnd: "2026-08-31",
    })
    .returning();

  const [hifzCalendar] = await db
    .insert(schema.calendarSet)
    .values({
      madrasahId: madrasah.id,
      name: "Ḥifẓ programme",
      description: "Hifz class and Pre-Hifdh — Mon–Sat, with a Saturday morning sitting.",
      teachingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      academicYearStart: "2025-09-01",
      academicYearEnd: "2026-08-31",
    })
    .returning();

  await db.insert(schema.term).values([
    { madrasahId: madrasah.id, calendarSetId: maktabCalendar.id, name: "Term 1", startDate: "2025-09-01", endDate: "2025-12-31" },
    { madrasahId: madrasah.id, calendarSetId: maktabCalendar.id, name: "Term 2", startDate: "2026-01-01", endDate: "2026-04-30" },
    { madrasahId: madrasah.id, calendarSetId: maktabCalendar.id, name: "Term 3", startDate: "2026-04-01", endDate: "2026-08-31" },
  ]);

  await db.update(schema.klass).set({ calendarSetId: maktabCalendar.id }).where(eq(schema.klass.madrasahId, madrasah.id));
  await db.update(schema.klass).set({ calendarSetId: hifzCalendar.id }).where(inArray(schema.klass.name, HIFZ_CLASS_NAMES));

  // Inventory
  await db.delete(schema.inventoryItem).where(eq(schema.inventoryItem.madrasahId, madrasah.id));
  for (const item of INVENTORY_ITEMS) {
    const [row] = await db
      .insert(schema.inventoryItem)
      .values({
        madrasahId: madrasah.id,
        name: item.name,
        category: item.category,
        stock: item.stock,
        reorderLevel: item.reorderLevel,
        price: item.price,
      })
      .returning();
    for (let i = 0; i < item.issuedUnpaid; i++) {
      await db.insert(schema.inventoryIssue).values({
        madrasahId: madrasah.id,
        itemId: row.id,
        pupilId: null,
        quantity: 1,
        paid: false,
        issuedAt: "2026-07-15",
      });
    }
  }

  // Policies
  await db.delete(schema.policy).where(eq(schema.policy.madrasahId, madrasah.id));
  const staffRows = await db.select().from(schema.staff).where(eq(schema.staff.madrasahId, madrasah.id));
  for (const p of POLICIES) {
    const [row] = await db
      .insert(schema.policy)
      .values({ madrasahId: madrasah.id, title: p.title, version: p.version, reviewByDate: p.reviewByDate })
      .returning();
    if (staffRows.length > 0) {
      await db.insert(schema.policyStaffAck).values(
        staffRows.map((s) => ({ madrasahId: madrasah.id, policyId: row.id, staffId: s.id })),
      );
    }
  }

  console.log(
    `Seeded 2 calendars, 3 terms, ${INVENTORY_ITEMS.length} inventory items, ${POLICIES.length} policies (${staffRows.length} staff acks each).`,
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
