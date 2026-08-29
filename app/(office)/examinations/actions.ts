"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { examination, examResult, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createExamination(formData: FormData) {
  const madrasah = await getMadrasah();
  const title = String(formData.get("title") ?? "").trim();
  const termId = String(formData.get("termId") ?? "") || null;
  const examDate = String(formData.get("examDate") ?? "") || null;
  const maxScore = Number(formData.get("maxScore") ?? 100);

  if (!title) return { ok: false, message: "Enter a title." };

  await db.insert(examination).values({ madrasahId: madrasah.id, title, termId, examDate, maxScore: maxScore || 100 });

  revalidatePath("/examinations");
  return { ok: true };
}

export async function saveExamResult(formData: FormData) {
  const madrasah = await getMadrasah();
  const examinationId = String(formData.get("examinationId") ?? "");
  const pupilId = String(formData.get("pupilId") ?? "");
  const scoreRaw = String(formData.get("score") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim() || null;

  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id) return { ok: false, message: "Student not found." };
  if (!scoreRaw) {
    await db.delete(examResult).where(and(eq(examResult.examinationId, examinationId), eq(examResult.pupilId, pupilId)));
    revalidatePath(`/examinations/${examinationId}`);
    return { ok: true };
  }

  await db
    .insert(examResult)
    .values({ madrasahId: madrasah.id, examinationId, pupilId, score: Number(scoreRaw), grade })
    .onConflictDoUpdate({ target: [examResult.examinationId, examResult.pupilId], set: { score: Number(scoreRaw), grade } });

  revalidatePath(`/examinations/${examinationId}`);
  return { ok: true };
}

export async function togglePublishExamination(examinationId: string, publish: boolean) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(examination).where(eq(examination.id, examinationId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) return { ok: false, message: "Examination not found." };

  await db.update(examination).set({ publishedAt: publish ? new Date() : null }).where(eq(examination.id, examinationId));

  revalidatePath("/examinations");
  revalidatePath(`/examinations/${examinationId}`);
  revalidatePath("/parent", "layout");
  return { ok: true };
}
