"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pupil, report, term } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function saveReportSummary(pupilId: string, termId: string, summary: string) {
  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) return { ok: false, message: "Student not found." };
  const [termRow] = await db.select().from(term).where(eq(term.id, termId)).limit(1);
  if (!termRow || termRow.madrasahId !== madrasah.id) return { ok: false, message: "Term not found." };

  await db
    .insert(report)
    .values({ madrasahId: madrasah.id, pupilId, termId, summary })
    .onConflictDoUpdate({ target: [report.pupilId, report.termId], set: { summary } });

  revalidatePath("/reports");
  return { ok: true };
}

export async function togglePublishReport(pupilId: string, termId: string, publish: boolean) {
  const madrasah = await getMadrasah();
  const [existing] = await db
    .select()
    .from(report)
    .where(and(eq(report.pupilId, pupilId), eq(report.termId, termId)))
    .limit(1);

  if (existing) {
    await db
      .update(report)
      .set({ status: publish ? "Published" : "Draft", publishedAt: publish ? new Date() : null })
      .where(eq(report.id, existing.id));
  } else {
    await db.insert(report).values({
      madrasahId: madrasah.id,
      pupilId,
      termId,
      status: publish ? "Published" : "Draft",
      publishedAt: publish ? new Date() : null,
    });
  }

  revalidatePath("/reports");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
