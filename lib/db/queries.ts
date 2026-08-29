// Read queries for the Students and Classes & Allocation screens.
//
// TEMPORARY: auth/tenant bootstrap (design/TECH_STACK.md build order item 1) isn't built
// yet, so there is no session to resolve a madrasah_id from. Every query below scopes to
// the single seeded madrasah. Once sign-in exists this must read madrasah_id from the
// session instead — see design/TECH_STACK.md "Multi-tenancy".
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { db } from "./client";
import {
  applicant,
  applicantStageLog,
  attendanceMark,
  concern,
  duaCatalogItem,
  homework,
  ihsanAward,
  ihsanLedger,
  klass,
  lessonPlan,
  madrasah,
  pupil,
  registerSubmission,
  salahLog,
  staff,
  surahCatalogItem,
} from "./schema";
import { computeAutomaticHudurAwards } from "@/lib/derive/ihsan";
import { computePriorityScore } from "@/lib/derive/admissions";
import { computeHomeworkProgress } from "@/lib/derive/homework";
import { LESSON_PLAN_YEARS } from "@/lib/derive/lesson-plans";
import { computeAdherence, last7Days } from "@/lib/derive/salah";
import type { AdmissionYear } from "@/lib/derive/admissions";

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

export async function listIhsanAwards() {
  return db.query.ihsanAward.findMany({ orderBy: [asc(ihsanAward.category), asc(ihsanAward.points)] });
}

// The one place a pupil's Iḥsān total is computed — combines manual ledger rows with
// the automatic Ḥuḍūr awards derived live from attendance_mark (never stored, so it's
// always in sync with the register). Read by both the leaderboard and the feed below.
export async function listIhsanTotals(madrasahId: string) {
  const [pupils, ledgerRows, marks, awards] = await Promise.all([
    listPupils(madrasahId),
    db.query.ihsanLedger.findMany({
      where: eq(ihsanLedger.madrasahId, madrasahId),
      with: { award: true, awardedBy: true, class: true },
    }),
    db.select().from(attendanceMark).where(eq(attendanceMark.madrasahId, madrasahId)),
    listIhsanAwards(),
  ]);

  const hudurPoints = {
    fullWeek: awards.find((a) => a.category === "Hudur" && a.name === "Full Week")?.points ?? 1,
    onTimeEveryDay: awards.find((a) => a.category === "Hudur" && a.name === "On Time Every Day")?.points ?? 1,
  };

  return pupils.map((p) => {
    const manualRows = ledgerRows.filter((r) => r.pupilId === p.id);
    const pupilMarks = marks.filter((m) => m.pupilId === p.id).map((m) => ({ date: m.date, code: m.code }));
    const automatic = computeAutomaticHudurAwards(pupilMarks, hudurPoints);
    const manualPoints = manualRows.reduce((sum, r) => sum + r.award.points, 0);
    const automaticPoints = automatic.reduce((sum, a) => sum + a.points, 0);
    return {
      ...p,
      points: manualPoints + automaticPoints,
      manualRows,
      automatic,
    };
  });
}

export async function listStaff(madrasahId: string) {
  return db.query.staff.findMany({ where: eq(staff.madrasahId, madrasahId), orderBy: asc(staff.name) });
}

export async function listConcerns(madrasahId: string) {
  const [pupils, rows] = await Promise.all([
    listPupils(madrasahId),
    db.query.concern.findMany({
      where: eq(concern.madrasahId, madrasahId),
      orderBy: desc(concern.createdAt),
      with: { class: true, raisedBy: true, owner: true },
    }),
  ]);
  const pupilById = new Map(pupils.map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, pupil: pupilById.get(r.pupilId) ?? null }));
}

export async function listApplicants(madrasahId: string) {
  const rows = await db.query.applicant.findMany({
    where: eq(applicant.madrasahId, madrasahId),
    orderBy: desc(applicant.createdAt),
    with: {
      class: true,
      stageLog: { orderBy: desc(applicantStageLog.changedAt) },
    },
  });
  return rows.map((row) => {
    const stageEnteredAt = row.stageLog.find((l) => l.stage === row.stage)?.changedAt ?? row.createdAt;
    const priority = computePriorityScore({
      siblingAtMti: row.siblingAtMti,
      familyAttendsMasjid: row.familyAttendsMasjid,
      submittedAt: row.submittedAt,
      quranLevel: row.quranLevel,
    });
    return { ...row, stageEnteredAt: stageEnteredAt.toISOString(), priority };
  });
}

export async function getApplicant(madrasahId: string, applicantId: string) {
  const row = await db.query.applicant.findFirst({
    where: eq(applicant.id, applicantId),
    with: {
      class: true,
      enrolledPupil: true,
      stageLog: { orderBy: desc(applicantStageLog.changedAt) },
    },
  });
  if (!row || row.madrasahId !== madrasahId) return null;

  const stageEnteredAt = row.stageLog.find((l) => l.stage === row.stage)?.changedAt ?? row.createdAt;
  const priority = computePriorityScore({
    siblingAtMti: row.siblingAtMti,
    familyAttendsMasjid: row.familyAttendsMasjid,
    submittedAt: row.submittedAt,
    quranLevel: row.quranLevel,
  });
  return { ...row, stageEnteredAt: stageEnteredAt.toISOString(), priority };
}

export async function listHomework(madrasahId: string) {
  const rows = await db.query.homework.findMany({
    where: eq(homework.madrasahId, madrasahId),
    orderBy: desc(homework.createdAt),
    with: { class: true, setBy: true, submissions: true },
  });
  return rows.map((row) => ({ ...row, progress: computeHomeworkProgress(row.submissions) }));
}

export async function getHomework(madrasahId: string, homeworkId: string) {
  const row = await db.query.homework.findFirst({
    where: eq(homework.id, homeworkId),
    with: {
      class: true,
      setBy: true,
      submissions: { with: { pupil: true } },
    },
  });
  if (!row || row.madrasahId !== madrasahId) return null;

  // Reuse listPupils so displayId stays the one derivation everywhere it's shown.
  const pupils = await listPupils(madrasahId);
  const pupilById = new Map(pupils.map((p) => [p.id, p]));
  const submissions = row.submissions
    .map((s) => ({ ...s, pupil: pupilById.get(s.pupilId) ?? null }))
    .sort((a, b) => (a.pupil?.name ?? "").localeCompare(b.pupil?.name ?? ""));

  return { ...row, submissions, progress: computeHomeworkProgress(row.submissions) };
}

// Always returns all 9 year bands for the week, planned or not — matching the
// prototype's "Not yet planned" rows so the screen is honest about what's missing.
export async function listLessonPlansForWeek(madrasahId: string, weekStartDate: string) {
  const plans = await db.query.lessonPlan.findMany({
    where: and(eq(lessonPlan.madrasahId, madrasahId), eq(lessonPlan.weekStartDate, weekStartDate)),
    with: { entries: true, setBy: true },
  });
  const byYear = new Map(plans.map((p) => [p.year, p]));
  return LESSON_PLAN_YEARS.map((year) => ({ year, plan: byYear.get(year) ?? null }));
}

// Madrasah-wide Ṣalāh & Tarbiyah rollup, computed over the last 7 days — see
// lib/derive/salah.ts. Nothing here is stored; it's always a live read over salah_log.
export async function getSalahDashboard(madrasahId: string) {
  const days = last7Days();
  const [pupils, classes, logs] = await Promise.all([
    listPupils(madrasahId),
    listClasses(madrasahId),
    db
      .select()
      .from(salahLog)
      .where(and(eq(salahLog.madrasahId, madrasahId), gte(salahLog.date, days[0]))),
  ]);

  const onRoll = pupils.filter((p) => p.enrolmentState === "Enrolled");
  const overall = computeAdherence(logs, onRoll.length);

  const byClass = classes
    .map((c) => {
      const classPupilIds = new Set(onRoll.filter((p) => p.classId === c.id).map((p) => p.id));
      const classLogs = logs.filter((l) => classPupilIds.has(l.pupilId));
      return { class: c, ...computeAdherence(classLogs, classPupilIds.size) };
    })
    .filter((c) => c.class.pupils.length > 0);

  const logsByPupil = new Map<string, typeof logs>();
  for (const l of logs) {
    if (!logsByPupil.has(l.pupilId)) logsByPupil.set(l.pupilId, []);
    logsByPupil.get(l.pupilId)!.push(l);
  }

  const notLogging = onRoll.filter((p) => !logsByPupil.has(p.id));
  const lowAdherence = onRoll
    .map((p) => {
      const pupilLogs = logsByPupil.get(p.id) ?? [];
      if (pupilLogs.length === 0) return null;
      const prayedRate = Math.round((pupilLogs.filter((l) => l.prayed).length / pupilLogs.length) * 100);
      return { pupil: p, prayedRate, logCount: pupilLogs.length };
    })
    .filter((x): x is { pupil: (typeof onRoll)[number]; prayedRate: number; logCount: number } => x !== null && x.prayedRate < 70)
    .sort((a, b) => a.prayedRate - b.prayedRate);

  return { days, onRollCount: onRoll.length, overall, byClass, notLogging, lowAdherence };
}

export async function getSalahLogForPupilDate(pupilId: string, date: string) {
  return db.select().from(salahLog).where(and(eq(salahLog.pupilId, pupilId), eq(salahLog.date, date)));
}

// Pupils on roll whose class carries this year band — see klass.yearBand in
// lib/db/schema.ts for why this can't be derived from headLabel alone.
export async function listPupilsByYearBand(madrasahId: string, year: AdmissionYear) {
  const pupils = await listPupils(madrasahId);
  return pupils.filter((p) => p.class?.yearBand === year && p.enrolmentState === "Enrolled");
}

export async function getDuaTrackerForYear(madrasahId: string, year: AdmissionYear) {
  const [pupils, items] = await Promise.all([
    listPupilsByYearBand(madrasahId, year),
    db.query.duaCatalogItem.findMany({
      where: and(eq(duaCatalogItem.madrasahId, madrasahId), eq(duaCatalogItem.year, year)),
      orderBy: asc(duaCatalogItem.orderIndex),
      with: { statuses: { with: { pupil: true } } },
    }),
  ]);
  return { pupils, items };
}

export async function getSurahTrackerForYear(madrasahId: string, year: AdmissionYear) {
  const [pupils, items] = await Promise.all([
    listPupilsByYearBand(madrasahId, year),
    db.query.surahCatalogItem.findMany({
      where: and(eq(surahCatalogItem.madrasahId, madrasahId), eq(surahCatalogItem.year, year)),
      orderBy: asc(surahCatalogItem.orderIndex),
      with: { statuses: { with: { pupil: true } } },
    }),
  ]);
  return { pupils, items };
}
