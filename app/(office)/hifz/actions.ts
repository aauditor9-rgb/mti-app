"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { hifzQualityEnum, hifzRecord, hifzRecordTypeEnum, preHifzAssessment, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function recordHifzOffice(formData: FormData) {
  const madrasah = await getMadrasah();

  const pupilId = String(formData.get("pupilId") ?? "");
  const date = String(formData.get("date") ?? "");
  const type = String(formData.get("type") ?? "");
  const juz = Number(formData.get("juz") ?? 0);
  const pageFromRaw = String(formData.get("pageFrom") ?? "").trim();
  const pageToRaw = String(formData.get("pageTo") ?? "").trim();
  const quality = String(formData.get("quality") ?? "");
  const mistakeNotes = String(formData.get("mistakeNotes") ?? "").trim() || null;

  if (!pupilId || !date || !juz) return { ok: false, message: "Choose a student, date and juz." };
  if (!hifzRecordTypeEnum.enumValues.includes(type as (typeof hifzRecordTypeEnum.enumValues)[number])) {
    return { ok: false, message: "Choose Sabaq, Sabqi or Manzil." };
  }
  if (!hifzQualityEnum.enumValues.includes(quality as (typeof hifzQualityEnum.enumValues)[number])) {
    return { ok: false, message: "Choose a quality rating." };
  }

  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) return { ok: false, message: "Student not found." };

  await db.insert(hifzRecord).values({
    madrasahId: madrasah.id,
    pupilId,
    classId: pupilRow.classId,
    date,
    type: type as (typeof hifzRecordTypeEnum.enumValues)[number],
    juz,
    pageFrom: pageFromRaw ? Number(pageFromRaw) : null,
    pageTo: pageToRaw ? Number(pageToRaw) : null,
    quality: quality as (typeof hifzQualityEnum.enumValues)[number],
    mistakeNotes,
  });

  revalidatePath("/hifz");
  revalidatePath("/parent", "layout");
  return { ok: true };
}

type PreHifzGateField = "readingAssessmentAt" | "tajwidAssessmentAt" | "behaviourAssessmentAt" | "pupilInterviewAt" | "parentInterviewAt";

export async function togglePreHifzGate(pupilId: string, field: PreHifzGateField, value: boolean) {
  const madrasah = await getMadrasah();
  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) throw new Error("Student not found");

  const today = new Date().toISOString().slice(0, 10);
  const dateValue = value ? today : null;
  const patch: Partial<Record<PreHifzGateField, string | null>> = { [field]: dateValue };

  const [existing] = await db.select().from(preHifzAssessment).where(eq(preHifzAssessment.pupilId, pupilId)).limit(1);
  if (existing) {
    await db.update(preHifzAssessment).set({ ...patch, updatedAt: new Date() }).where(eq(preHifzAssessment.pupilId, pupilId));
  } else {
    await db.insert(preHifzAssessment).values({ madrasahId: madrasah.id, pupilId, ...patch });
  }

  revalidatePath("/hifz");
  return { ok: true };
}
