"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { homework, homeworkSubmission, klass, pupil } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function setHomework(formData: FormData) {
  const classId = String(formData.get("classId") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const task = String(formData.get("task") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const setByStaffId = String(formData.get("setByStaffId") ?? "") || null;

  if (!classId || !subject || !task || !dueDate) {
    return { ok: false, message: "Fill in the class, subject, task and due date." };
  }

  const madrasah = await getMadrasah();
  const [classRow] = await db.select().from(klass).where(eq(klass.id, classId)).limit(1);
  if (!classRow || classRow.madrasahId !== madrasah.id) {
    return { ok: false, message: "Class not found." };
  }

  const [row] = await db
    .insert(homework)
    .values({ madrasahId: madrasah.id, classId, subject, task, dueDate, setByStaffId })
    .returning();

  const classPupils = await db.select().from(pupil).where(eq(pupil.classId, classId));
  if (classPupils.length > 0) {
    await db.insert(homeworkSubmission).values(
      classPupils.map((p) => ({
        madrasahId: madrasah.id,
        homeworkId: row.id,
        pupilId: p.id,
      })),
    );
  }

  revalidatePath("/homework");
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
  return { ok: true };
}
