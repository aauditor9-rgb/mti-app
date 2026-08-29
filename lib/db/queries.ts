// Read queries for the Students and Classes & Allocation screens.
//
// TEMPORARY: auth/tenant bootstrap (design/TECH_STACK.md build order item 1) isn't built
// yet, so there is no session to resolve a madrasah_id from. Every query below scopes to
// the single seeded madrasah. Once sign-in exists this must read madrasah_id from the
// session instead — see design/TECH_STACK.md "Multi-tenancy".
import { and, asc, eq } from "drizzle-orm";
import { db } from "./client";
import { attendanceMark, klass, madrasah, pupil, registerSubmission } from "./schema";

export async function getMadrasah() {
  const [row] = await db.select().from(madrasah).limit(1);
  if (!row) throw new Error("No madrasah seeded — run `npm run db:seed`.");
  return row;
}

export async function listPupils(madrasahId: string) {
  const rows = await db.query.pupil.findMany({
    where: eq(pupil.madrasahId, madrasahId),
    orderBy: asc(pupil.createdAt),
    with: {
      class: true,
      household: { with: { guardians: true } },
    },
  });
  return rows.map((row, index) => ({
    ...row,
    displayId: `MTI${String(index + 1).padStart(3, "0")}`,
  }));
}

export async function getPupil(madrasahId: string, displayId: string) {
  const pupils = await listPupils(madrasahId);
  return pupils.find((p) => p.displayId === displayId) ?? null;
}

export async function listClasses(madrasahId: string) {
  const rows = await db.query.klass.findMany({
    where: eq(klass.madrasahId, madrasahId),
    orderBy: asc(klass.createdAt),
    with: {
      leadTeacher: true,
      pupils: true,
    },
  });
  return rows;
}

export async function getClass(madrasahId: string, classId: string) {
  const row = await db.query.klass.findFirst({
    where: eq(klass.id, classId),
    with: { leadTeacher: true },
  });
  if (!row || row.madrasahId !== madrasahId) return null;

  // Reuse listPupils for the roster so displayId stays the one derivation everywhere
  // it's shown (design/README.md invariant 1), instead of a second index scoped to the class.
  const pupils = (await listPupils(madrasahId)).filter((p) => p.classId === classId);
  return { ...row, pupils };
}

export async function listClassesForRegister(madrasahId: string, date: string) {
  const rows = await db.query.klass.findMany({
    where: eq(klass.madrasahId, madrasahId),
    orderBy: asc(klass.createdAt),
    with: {
      leadTeacher: true,
      pupils: true,
      attendanceMarks: { where: eq(attendanceMark.date, date) },
      registerSubmissions: { where: eq(registerSubmission.date, date) },
    },
  });
  return rows.map((row) => ({
    ...row,
    markedCount: row.attendanceMarks.length,
    submittedAt: row.registerSubmissions[0]?.submittedAt ?? null,
  }));
}

export async function getRegisterForClass(madrasahId: string, classId: string, date: string) {
  const klassRow = await getClass(madrasahId, classId);
  if (!klassRow) return null;

  const marksForDate = await db.query.attendanceMark.findMany({
    where: and(eq(attendanceMark.classId, classId), eq(attendanceMark.date, date)),
  });
  const markByPupil = new Map(marksForDate.map((m) => [m.pupilId, m]));

  const submission = await db.query.registerSubmission.findFirst({
    where: and(eq(registerSubmission.classId, classId), eq(registerSubmission.date, date)),
  });

  return {
    ...klassRow,
    pupils: klassRow.pupils.map((p) => ({ ...p, mark: markByPupil.get(p.id) ?? null })),
    submittedAt: submission?.submittedAt ?? null,
  };
}
