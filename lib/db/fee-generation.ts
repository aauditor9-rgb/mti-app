// Shared invoice-generation core used by both the one-off seed script and the
// "Generate invoices" server action — kept out of actions.ts because it has no
// revalidatePath/request-context dependency and needs to run standalone from seed.
import { and, eq } from "drizzle-orm";
import { db } from "./client";
import * as schema from "./schema";
import { generateFeeLinesForPupil } from "@/lib/derive/fees";

export async function generateFeeInvoicesForPupil(madrasahId: string, pupilId: string) {
  const [existing] = await db
    .select({ id: schema.feeInvoiceLine.id })
    .from(schema.feeInvoiceLine)
    .where(eq(schema.feeInvoiceLine.pupilId, pupilId))
    .limit(1);
  if (existing) return { generated: false };

  const [pupilRow] = await db.select().from(schema.pupil).where(eq(schema.pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasahId) throw new Error("Pupil not found");

  const [madrasahRow] = await db.select().from(schema.madrasah).where(eq(schema.madrasah.id, madrasahId)).limit(1);
  if (!madrasahRow) throw new Error("Madrasah not found");

  const [defaultCalendar] = await db
    .select()
    .from(schema.calendarSet)
    .where(eq(schema.calendarSet.madrasahId, madrasahId))
    .limit(1);
  if (!defaultCalendar) return { generated: false };

  const terms = await db
    .select()
    .from(schema.term)
    .where(and(eq(schema.term.madrasahId, madrasahId), eq(schema.term.calendarSetId, defaultCalendar.id)));

  let isSibling = false;
  if (pupilRow.householdId) {
    const siblings = await db
      .select({ id: schema.pupil.id, createdAt: schema.pupil.createdAt })
      .from(schema.pupil)
      .where(and(eq(schema.pupil.householdId, pupilRow.householdId), eq(schema.pupil.enrolmentState, "Enrolled")));
    const sortedIds = siblings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).map((s) => s.id);
    isSibling = sortedIds.indexOf(pupilId) > 0;
  }

  const lines = generateFeeLinesForPupil({
    pupilId,
    enrolmentFee: Number(madrasahRow.enrolmentFee),
    termlyTuitionFee: Number(madrasahRow.termlyTuitionFee),
    siblingDiscountPct: madrasahRow.siblingDiscountPct,
    isSibling,
    enrolledOn: defaultCalendar.academicYearStart,
    terms: terms.map((t) => ({ id: t.id, name: t.name, startDate: t.startDate })),
  });

  await db.insert(schema.feeInvoiceLine).values(
    lines.map((l) => ({
      madrasahId,
      pupilId: l.pupilId,
      kind: l.kind,
      label: l.label,
      termId: l.termId,
      amount: String(l.amount),
      dueDate: l.dueDate,
    })),
  );

  return { generated: true, lineCount: lines.length };
}

export async function generateFeeInvoicesForAllEnrolled(madrasahId: string) {
  const pupils = await db
    .select({ id: schema.pupil.id })
    .from(schema.pupil)
    .where(and(eq(schema.pupil.madrasahId, madrasahId), eq(schema.pupil.enrolmentState, "Enrolled")));

  let generatedCount = 0;
  for (const p of pupils) {
    const result = await generateFeeInvoicesForPupil(madrasahId, p.id);
    if (result.generated) generatedCount++;
  }
  return { generatedCount, totalPupils: pupils.length };
}
