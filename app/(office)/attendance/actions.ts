"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { attendanceMark, klass, pupil, registerSubmission } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { ATTENDANCE_CODES, type AttendanceCode } from "@/lib/derive/attendance";

async function assertClassInMadrasah(classId: string) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(klass).where(eq(klass.id, classId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) throw new Error("Class not found");
  return madrasah;
}

async function isLocked(classId: string, date: string) {
  const [row] = await db
    .select()
    .from(registerSubmission)
    .where(and(eq(registerSubmission.classId, classId), eq(registerSubmission.date, date)))
    .limit(1);
  return !!row;
}

export async function setAttendanceMark(
  classId: string,
  pupilId: string,
  date: string,
  code: AttendanceCode,
) {
  if (!ATTENDANCE_CODES.includes(code)) return { ok: false, message: "Invalid code" };
  const madrasah = await assertClassInMadrasah(classId);

  if (await isLocked(classId, date)) {
    return { ok: false, message: "This register is submitted and locked. Reopen it to make changes." };
  }

  const [pupilRow] = await db.select().from(pupil).where(eq(pupil.id, pupilId)).limit(1);
  if (!pupilRow || pupilRow.madrasahId !== madrasah.id || pupilRow.classId !== classId) {
    return { ok: false, message: "Student not found in this class" };
  }

  await db
    .insert(attendanceMark)
    .values({ madrasahId: madrasah.id, pupilId, classId, date, code })
    .onConflictDoUpdate({
      target: [attendanceMark.pupilId, attendanceMark.date],
      set: { code, classId, markedAt: new Date() },
    });

  revalidatePath(`/attendance/${classId}`);
  revalidatePath("/attendance");
  revalidatePath("/teacher", "layout");
  return { ok: true };
}

export async function submitRegister(classId: string, date: string) {
  const madrasah = await assertClassInMadrasah(classId);

  const pupils = await db.select().from(pupil).where(eq(pupil.classId, classId));
  if (pupils.length === 0) {
    return { ok: false, message: "No students are allocated to this class yet." };
  }

  const marks = await db
    .select()
    .from(attendanceMark)
    .where(and(eq(attendanceMark.classId, classId), eq(attendanceMark.date, date)));
  const markedPupilIds = new Set(marks.map((m) => m.pupilId));
  const unmarked = pupils.filter((p) => !markedPupilIds.has(p.id));
  if (unmarked.length > 0) {
    return {
      ok: false,
      message: `${unmarked.length} student${unmarked.length === 1 ? "" : "s"} still need${unmarked.length === 1 ? "s" : ""} a mark before you can submit.`,
    };
  }

  await db
    .insert(registerSubmission)
    .values({ madrasahId: madrasah.id, classId, date })
    .onConflictDoUpdate({
      target: [registerSubmission.classId, registerSubmission.date],
      set: { submittedAt: new Date() },
    });

  revalidatePath(`/attendance/${classId}`);
  revalidatePath("/attendance");
  revalidatePath("/teacher", "layout");
  return { ok: true };
}

export async function reopenRegister(classId: string, date: string) {
  await assertClassInMadrasah(classId);

  await db
    .delete(registerSubmission)
    .where(and(eq(registerSubmission.classId, classId), eq(registerSubmission.date, date)));

  revalidatePath(`/attendance/${classId}`);
  revalidatePath("/attendance");
  revalidatePath("/teacher", "layout");
  return { ok: true };
}
