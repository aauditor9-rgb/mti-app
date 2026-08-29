"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { homework, homeworkAudienceEnum, homeworkSubmission, homeworkTarget, klass, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function setHomework(formData: FormData) {
  const classId = String(formData.get("classId") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const task = String(formData.get("task") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const setByStaffId = String(formData.get("setByStaffId") ?? "") || null;
  const audienceRaw = String(formData.get("audience") ?? "Whole class");
  const audience = homeworkAudienceEnum.enumValues.includes(
    audienceRaw as (typeof homeworkAudienceEnum.enumValues)[number],
  )
    ? (audienceRaw as (typeof homeworkAudienceEnum.enumValues)[number])
    : "Whole class";
  const selectedPupilIds = formData.getAll("pupilIds").map(String).filter(Boolean);

  if (!classId || !subject || !task || !dueDate) {
    return { ok: false, message: "Fill in the class, subject, task and due date." };
  }
  if (audience === "Selected students" && selectedPupilIds.length === 0) {
    return { ok: false, message: "Choose at least one student, or switch to whole class." };
  }

  const madrasah = await getMadrasah();
  const [classRow] = await db.select().from(klass).where(eq(klass.id, classId)).limit(1);
  if (!classRow || classRow.madrasahId !== madrasah.id) {
    return { ok: false, message: "Class not found." };
  }

  const [row] = await db
    .insert(homework)
    .values({ madrasahId: madrasah.id, classId, subject, task, dueDate, setByStaffId, audience })
    .returning();

  const classPupils = await db.select().from(pupil).where(eq(pupil.classId, classId));
  const targetPupils =
    audience === "Selected students"
      ? classPupils.filter((p) => selectedPupilIds.includes(p.id))
      : classPupils;

  if (targetPupils.length > 0) {
    await db.insert(homeworkSubmission).values(
      targetPupils.map((p) => ({
        madrasahId: madrasah.id,
        homeworkId: row.id,
        pupilId: p.id,
      })),
    );
  }
  if (audience === "Selected students" && targetPupils.length > 0) {
    await db.insert(homeworkTarget).values(
      targetPupils.map((p) => ({
        madrasahId: madrasah.id,
        homeworkId: row.id,
        pupilId: p.id,
      })),
    );
  }

  revalidatePath("/homework");
  revalidatePath("/teacher", "layout");
  revalidatePath("/parent", "layout");
  return { ok: true };
}

export async function toggleSubmission(submissionId: string, completed: boolean) {
  const madrasah = await getMadrasah();
  const [row] = await db
    .select()
    .from(homeworkSubmission)
    .where(eq(homeworkSubmission.id, submissionId))
    .limit(1);
  if (!row || row.madrasahId !== madrasah.id) throw new Error("Submission not found");

  await db
    .update(homeworkSubmission)
    .set({ completed, completedAt: completed ? new Date() : null })
    .where(eq(homeworkSubmission.id, submissionId));

  revalidatePath("/homework");
  revalidatePath(`/homework/${row.homeworkId}`);
  revalidatePath("/parent", "layout");
  return { ok: true };
}
