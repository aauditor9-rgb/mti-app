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
  calendarSet,
  complaint,
  concern,
  documentGuardianSignature,
  duaCatalogItem,
  duaPupilStatus,
  event,
  examination,
  examResult,
  feeInvoiceLine,
  feePayment,
  firstAidLogEntry,
  formResponse,
  formTemplate,
  guardian,
  hifzRecord,
  holidayRevisionDay,
  holidayRevisionWindow,
  homework,
  homeworkSubmission,
  ihsanAward,
  ihsanLedger,
  inventoryIssue,
  inventoryItem,
  klass,
  leaveRequest,
  lessonPlan,
  madrasah,
  message,
  parentsEveningSession,
  policy,
  policyGuardianAck,
  preHifzAssessment,
  pupil,
  pupilGuardian,
  registerSubmission,
  report,
  riskRegisterEntry,
  safarQaaidahLevel,
  safarQaaidahPupilStatus,
  salahLog,
  signDocument,
  staff,
  staffClockEvent,
  staffPayrollRecord,
  surahCatalogItem,
  surahPupilStatus,
  task,
  term,
} from "./schema";
import { computeAutomaticHudurAwards } from "@/lib/derive/ihsan";
import { computePriorityScore } from "@/lib/derive/admissions";
import { computeHomeworkProgress } from "@/lib/derive/homework";
import { LESSON_PLAN_YEARS, mondayOfDate } from "@/lib/derive/lesson-plans";
import { todayLondon } from "@/lib/derive/age";
import { computeAdherence, last7Days } from "@/lib/derive/salah";
import { computeHouseholdFeeSummary } from "@/lib/derive/fees";
import { computeTaskStatus } from "@/lib/derive/tasks";
import { computeClockStatus, needsAttention } from "@/lib/derive/staff";
import type { AdmissionYear } from "@/lib/derive/admissions";
import { getViewerGuardianId, getViewerPupilId, getViewerStaffId } from "@/lib/session";

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

// Last 7 calendar days' present-rate, for the Dashboard's attendance trend chart —
// computed live from attendance_mark, never stored (invariant 1). A day with no marks
// at all (e.g. a weekend) reports 0 rather than being dropped, so the chart always
// shows exactly 7 bars.
export async function getAttendanceTrend(madrasahId: string) {
  const days = last7Days();
  const marks = await db
    .select({ date: attendanceMark.date, code: attendanceMark.code })
    .from(attendanceMark)
    .where(and(eq(attendanceMark.madrasahId, madrasahId), gte(attendanceMark.date, days[0])));

  return days.map((date) => {
    const dayMarks = marks.filter((m) => m.date === date);
    const presentCount = dayMarks.filter((m) => m.code === "P" || m.code === "L").length;
    const pct = dayMarks.length === 0 ? 0 : Math.round((presentCount / dayMarks.length) * 100);
    return { date, pct, markedCount: dayMarks.length };
  });
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

// Pupils in classes whose session subjects include Qaaidah — see safarQaaidahLevel in
// lib/db/schema.ts for why this (not a single year band) is the tracker's roster.
const SAFAR_QAAIDAH_BANDS: AdmissionYear[] = ["Reception", "Year 1", "Year 2"];

export async function listPupilsInSafarQaaidahBand(madrasahId: string) {
  const pupils = await listPupils(madrasahId);
  return pupils.filter(
    (p) => p.class?.yearBand && SAFAR_QAAIDAH_BANDS.includes(p.class.yearBand) && p.enrolmentState === "Enrolled",
  );
}

export async function getSafarQaaidahTrackerForLevel(madrasahId: string, levelNumber: number) {
  const [pupils, level] = await Promise.all([
    listPupilsInSafarQaaidahBand(madrasahId),
    db.query.safarQaaidahLevel.findFirst({
      where: and(eq(safarQaaidahLevel.madrasahId, madrasahId), eq(safarQaaidahLevel.levelNumber, levelNumber)),
      with: { items: { orderBy: (item, { asc }) => [asc(item.orderIndex)], with: { statuses: { with: { pupil: true } } } } },
    }),
  ]);
  return { pupils, level };
}

// Knowledge Passport — see lib/derive/knowledge-passport.ts for why only these three
// strands (of the prototype's four) are computed. yearBand also gates which strands
// apply to this pupil: Surahs has no Reception catalog, Safar Qaaidah only applies to
// the Foundation band that timetables Qaaidah (see listPupilsInSafarQaaidahBand above).
export async function getKnowledgePassportForPupil(madrasahId: string, displayId: string) {
  const pupilRow = await getPupil(madrasahId, displayId);
  if (!pupilRow) return null;

  const yearBand = pupilRow.class?.yearBand ?? null;
  const duasApplicable = yearBand !== null;
  const surahsApplicable = yearBand !== null && yearBand !== "Reception";
  const safarQaaidahApplicable = yearBand !== null && SAFAR_QAAIDAH_BANDS.includes(yearBand);

  const [duas, surahs, safarLevels] = await Promise.all([
    duasApplicable
      ? db.query.duaCatalogItem.findMany({
          where: and(eq(duaCatalogItem.madrasahId, madrasahId), eq(duaCatalogItem.year, yearBand!)),
          orderBy: asc(duaCatalogItem.orderIndex),
          with: { statuses: { where: eq(duaPupilStatus.pupilId, pupilRow.id) } },
        })
      : Promise.resolve([]),
    surahsApplicable
      ? db.query.surahCatalogItem.findMany({
          where: and(eq(surahCatalogItem.madrasahId, madrasahId), eq(surahCatalogItem.year, yearBand!)),
          orderBy: asc(surahCatalogItem.orderIndex),
          with: { statuses: { where: eq(surahPupilStatus.pupilId, pupilRow.id) } },
        })
      : Promise.resolve([]),
    safarQaaidahApplicable
      ? db.query.safarQaaidahLevel.findMany({
          where: eq(safarQaaidahLevel.madrasahId, madrasahId),
          orderBy: asc(safarQaaidahLevel.levelNumber),
          with: {
            items: {
              orderBy: (item, { asc }) => [asc(item.orderIndex)],
              with: { statuses: { where: eq(safarQaaidahPupilStatus.pupilId, pupilRow.id) } },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return { pupil: pupilRow, yearBand, duasApplicable, duas, surahsApplicable, surahs, safarQaaidahApplicable, safarLevels };
}

// ---------------------------------------------------------------------------
// Tasks (Overview)
// ---------------------------------------------------------------------------

export async function listTasks(madrasahId: string) {
  const rows = await db.select().from(task).where(eq(task.madrasahId, madrasahId)).orderBy(asc(task.dueDate));
  return rows.map((t) => ({ ...t, status: computeTaskStatus(t.dueDate, t.completedAt) }));
}

// ---------------------------------------------------------------------------
// Calendars (Overview > Calendar, Settings > Calendars)
// ---------------------------------------------------------------------------

export async function listCalendarSets(madrasahId: string) {
  return db.query.calendarSet.findMany({
    where: eq(calendarSet.madrasahId, madrasahId),
    orderBy: asc(calendarSet.name),
    with: {
      terms: { orderBy: (t, { asc: ascOrder }) => [ascOrder(t.startDate)] },
      holidays: { orderBy: (h, { asc: ascOrder }) => [ascOrder(h.startDate)] },
      classes: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Fees (Finance)
// ---------------------------------------------------------------------------

export async function listHouseholdFeeSummaries(madrasahId: string) {
  const pupils = await listPupils(madrasahId);
  const enrolledPupils = pupils.filter((p) => p.enrolmentState === "Enrolled" && p.householdId);
  const householdIds = [...new Set(enrolledPupils.map((p) => p.householdId!))];

  const [lines, payments] = await Promise.all([
    db.select().from(feeInvoiceLine).where(eq(feeInvoiceLine.madrasahId, madrasahId)),
    db.select().from(feePayment).where(eq(feePayment.madrasahId, madrasahId)),
  ]);

  return householdIds.map((householdId) => {
    const householdPupils = enrolledPupils.filter((p) => p.householdId === householdId);
    const pupilNameById = new Map(householdPupils.map((p) => [p.id, p.name]));
    const householdLines = lines
      .filter((l) => pupilNameById.has(l.pupilId))
      .map((l) => ({
        id: l.id,
        kind: l.kind,
        label: l.label,
        amount: Number(l.amount),
        dueDate: l.dueDate,
        pupilId: l.pupilId,
        pupilName: pupilNameById.get(l.pupilId)!,
      }));
    const totalPaid = payments
      .filter((p) => p.householdId === householdId)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const summary = computeHouseholdFeeSummary(householdLines, totalPaid);
    const guardians = householdPupils[0]?.household?.guardians ?? [];
    return {
      householdId,
      guardianName: guardians[0]?.name ?? "Unknown guardian",
      pupils: householdPupils.map((p) => ({ id: p.id, name: p.name, className: p.class?.name ?? null })),
      lines: householdLines.map((l) => ({ ...l, status: summary.lines.find((s) => s.id === l.id)!.status })),
      totalInvoiced: summary.totalInvoiced,
      totalPaid: summary.totalPaid,
      totalOutstanding: summary.totalOutstanding,
      householdStatus: summary.householdStatus,
      nextDueDate: summary.nextDueDate,
    };
  });
}

// ---------------------------------------------------------------------------
// Books & Inventory (Finance)
// ---------------------------------------------------------------------------

export async function listInventoryItems(madrasahId: string) {
  const [items, issues] = await Promise.all([
    db
      .select()
      .from(inventoryItem)
      .where(eq(inventoryItem.madrasahId, madrasahId))
      .orderBy(asc(inventoryItem.category), asc(inventoryItem.name)),
    db.select().from(inventoryIssue).where(eq(inventoryIssue.madrasahId, madrasahId)),
  ]);
  return items.map((item) => ({
    ...item,
    issuedUnpaidCount: issues
      .filter((i) => i.itemId === item.id && !i.paid)
      .reduce((sum, i) => sum + i.quantity, 0),
  }));
}

// ---------------------------------------------------------------------------
// Messages (Communications)
// ---------------------------------------------------------------------------

export async function listMessages(madrasahId: string) {
  return db.query.message.findMany({
    where: eq(message.madrasahId, madrasahId),
    orderBy: desc(message.sentAt),
  });
}

// ---------------------------------------------------------------------------
// Events & Jalsas (Communications)
// ---------------------------------------------------------------------------

export async function listEvents(madrasahId: string) {
  return db.select().from(event).where(eq(event.madrasahId, madrasahId)).orderBy(asc(event.startAt));
}

// ---------------------------------------------------------------------------
// Forms & Consent (Communications)
// ---------------------------------------------------------------------------

export async function listFormTemplates(madrasahId: string) {
  const [templates, responses] = await Promise.all([
    db.select().from(formTemplate).where(eq(formTemplate.madrasahId, madrasahId)).orderBy(desc(formTemplate.createdAt)),
    db.select().from(formResponse).where(eq(formResponse.madrasahId, madrasahId)),
  ]);
  return templates.map((t) => {
    const templateResponses = responses.filter((r) => r.formTemplateId === t.id);
    const completedCount = templateResponses.filter((r) => r.completedAt).length;
    return {
      ...t,
      totalCount: templateResponses.length,
      completedCount,
      outstandingCount: templateResponses.length - completedCount,
    };
  });
}

// ---------------------------------------------------------------------------
// Complaints (Communications)
// ---------------------------------------------------------------------------

export async function getFormTemplateResponses(madrasahId: string, formTemplateId: string) {
  const responses = await db.query.formResponse.findMany({
    where: and(eq(formResponse.madrasahId, madrasahId), eq(formResponse.formTemplateId, formTemplateId)),
    with: { household: { with: { guardians: true } } },
  });
  return responses.map((r) => ({
    id: r.id,
    completedAt: r.completedAt,
    guardianName: r.household?.guardians[0]?.name ?? "Unknown guardian",
  }));
}

export async function listComplaints(madrasahId: string) {
  return db.query.complaint.findMany({
    where: eq(complaint.madrasahId, madrasahId),
    orderBy: desc(complaint.submittedAt),
    with: { pupil: true, guardian: true, investigator: true },
  });
}

// ---------------------------------------------------------------------------
// Medical Register (Safeguarding) — pupil.allergies/medicalNotes already exist.
// ---------------------------------------------------------------------------

export async function listFirstAidLog(madrasahId: string) {
  return db.query.firstAidLogEntry.findMany({
    where: eq(firstAidLogEntry.madrasahId, madrasahId),
    orderBy: desc(firstAidLogEntry.date),
    with: { pupil: true, loggedBy: true },
  });
}

// ---------------------------------------------------------------------------
// Risk Register (Safeguarding)
// ---------------------------------------------------------------------------

export async function listRiskRegisterEntries(madrasahId: string) {
  return db.query.riskRegisterEntry.findMany({
    where: eq(riskRegisterEntry.madrasahId, madrasahId),
    orderBy: asc(riskRegisterEntry.reviewByDate),
    with: { owner: true },
  });
}

// ---------------------------------------------------------------------------
// Policy Acknowledgements (Safeguarding)
// ---------------------------------------------------------------------------

export async function listPolicies(madrasahId: string) {
  const policies = await db.query.policy.findMany({
    where: eq(policy.madrasahId, madrasahId),
    orderBy: asc(policy.title),
    with: { acks: { with: { staff: true } } },
  });
  return policies.map((p) => ({
    ...p,
    // Sorted here rather than in the query — acks has no ordering relative to staff,
    // and sorting by staff name keeps rows stable across re-renders instead of
    // shuffling on every ack toggle (unordered DB fetch order isn't stable).
    acks: [...p.acks].sort((a, b) => a.staff.name.localeCompare(b.staff.name)),
    ackedCount: p.acks.filter((a) => a.acknowledgedAt).length,
    totalStaff: p.acks.length,
  }));
}

// ---------------------------------------------------------------------------
// Staff Directory (People > Staff > Teacher Database)
// ---------------------------------------------------------------------------

export async function listStaffDirectory(madrasahId: string) {
  return db.query.staff.findMany({
    where: eq(staff.madrasahId, madrasahId),
    orderBy: asc(staff.name),
    with: { classesLed: true },
  });
}

// ---------------------------------------------------------------------------
// Staff Clock In/Out (People > Staff)
// ---------------------------------------------------------------------------

export async function listStaffClockStatuses(madrasahId: string) {
  const [staffRows, events] = await Promise.all([
    listStaff(madrasahId),
    db.select().from(staffClockEvent).where(eq(staffClockEvent.madrasahId, madrasahId)),
  ]);

  return staffRows.map((s) => {
    const staffEvents = events.filter((e) => e.staffId === s.id);
    return { staff: s, ...computeClockStatus(staffEvents) };
  });
}

// ---------------------------------------------------------------------------
// Payroll (People > Staff)
// ---------------------------------------------------------------------------

export async function listPayrollForMonth(madrasahId: string, month: string) {
  const [staffRows, records] = await Promise.all([
    listStaff(madrasahId),
    db
      .select()
      .from(staffPayrollRecord)
      .where(and(eq(staffPayrollRecord.madrasahId, madrasahId), eq(staffPayrollRecord.month, month))),
  ]);

  return staffRows.map((s) => {
    const record = records.find((r) => r.staffId === s.id);
    return { staff: s, paid: record?.paid ?? false, recordId: record?.id ?? null };
  });
}

// ---------------------------------------------------------------------------
// Viewer session (Office/Teacher/Parent/Pupil portals) — see lib/session.ts.
// ---------------------------------------------------------------------------

export async function getCurrentStaff(madrasahId: string) {
  const staffId = await getViewerStaffId();
  if (!staffId) return null;
  const row = await db.query.staff.findFirst({
    where: eq(staff.id, staffId),
    with: { classesLed: true },
  });
  if (!row || row.madrasahId !== madrasahId || !row.portalAccess) return null;
  return row;
}

export async function listPortalGuardians(madrasahId: string) {
  const rows = await db.query.guardian.findMany({
    where: eq(guardian.madrasahId, madrasahId),
    orderBy: asc(guardian.name),
    with: { pupilLinks: { with: { pupil: true } } },
  });
  return rows.filter((g) => g.pupilLinks.length > 0);
}

export async function getCurrentGuardian(madrasahId: string) {
  const guardianId = await getViewerGuardianId();
  if (!guardianId) return null;
  const row = await db.query.guardian.findFirst({ where: eq(guardian.id, guardianId) });
  if (!row || row.madrasahId !== madrasahId) return null;

  const links = await db.query.pupilGuardian.findMany({ where: eq(pupilGuardian.guardianId, guardianId) });
  const pupils = await listPupils(madrasahId);
  const pupilById = new Map(pupils.map((p) => [p.id, p]));
  const children = links
    .map((l) => pupilById.get(l.pupilId))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return { ...row, children };
}

export async function getCurrentPupilFromCookie(madrasahId: string) {
  const pupilId = await getViewerPupilId();
  if (!pupilId) return null;
  const pupils = await listPupils(madrasahId);
  return pupils.find((p) => p.id === pupilId) ?? null;
}

// Teaching Overview (design/Madrassa Portal.dc.html Teaching & Learning "Teaching
// Overview") — a cross-class snapshot of what's been taught, memorised and still needs a
// second pass, computed live from the same tables every other screen reads.
export async function getTeachingOverview(madrasahId: string) {
  const today = todayLondon();
  const weekStart = mondayOfDate(today);

  const [plansThisWeek, homeworkRows, hifzToday, terms, draftReports] = await Promise.all([
    db.query.lessonPlan.findMany({
      where: and(eq(lessonPlan.madrasahId, madrasahId), eq(lessonPlan.weekStartDate, weekStart)),
      with: { entries: true },
    }),
    db.select().from(homework).where(eq(homework.madrasahId, madrasahId)),
    db.select().from(hifzRecord).where(and(eq(hifzRecord.madrasahId, madrasahId), eq(hifzRecord.date, today))),
    listTermsForMadrasah(madrasahId),
    db.select().from(report).where(and(eq(report.madrasahId, madrasahId), eq(report.status, "Draft"))),
  ]);

  const plansSubmitted = plansThisWeek.filter((p) => p.entries.length > 0).length;
  const classesWithHomework = new Set(homeworkRows.map((h) => h.classId)).size;
  const currentTerm = terms.find((t) => t.startDate <= today && today <= t.endDate) ?? terms[terms.length - 1] ?? null;

  return {
    plansSubmitted,
    totalYearBands: LESSON_PLAN_YEARS.length,
    classesWithHomework,
    hifzLoggedToday: hifzToday.length,
    reportsDue: draftReports.length,
    currentTermName: currentTerm?.name ?? null,
  };
}

export async function getAttendanceReportByClass(madrasahId: string, fromDate: string) {
  const [classes, marks] = await Promise.all([
    listClasses(madrasahId),
    db
      .select()
      .from(attendanceMark)
      .where(and(eq(attendanceMark.madrasahId, madrasahId), gte(attendanceMark.date, fromDate))),
  ]);
  return classes
    .filter((c) => c.pupils.length > 0)
    .map((c) => {
      const classMarks = marks.filter((m) => m.classId === c.id);
      const present = classMarks.filter((m) => m.code === "P" || m.code === "L").length;
      const pct = classMarks.length === 0 ? 0 : Math.round((present / classMarks.length) * 100);
      return { class: c, markCount: classMarks.length, pct };
    })
    .sort((a, b) => a.pct - b.pct);
}

export async function getBehaviourReport(madrasahId: string) {
  const concerns = await listConcerns(madrasahId);
  const byCategory = new Map<string, number>();
  for (const c of concerns) byCategory.set(c.category, (byCategory.get(c.category) ?? 0) + 1);
  const bySeverity = { Low: 0, Medium: 0, High: 0 };
  for (const c of concerns) bySeverity[c.severity] += 1;
  return {
    total: concerns.length,
    open: concerns.filter((c) => c.status === "Open").length,
    byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    bySeverity,
  };
}

export async function getStaffReport(madrasahId: string) {
  const staffRows = await listStaffDirectory(madrasahId);
  return staffRows.map((s) => ({ ...s, needsAttentionFlag: needsAttention(s) }));
}

export async function listAbsencesInRange(madrasahId: string, fromDate: string) {
  const [pupils, marks] = await Promise.all([
    listPupils(madrasahId),
    db
      .select()
      .from(attendanceMark)
      .where(and(eq(attendanceMark.madrasahId, madrasahId), gte(attendanceMark.date, fromDate))),
  ]);
  const pupilById = new Map(pupils.map((p) => [p.id, p]));
  return marks
    .filter((m) => m.code !== "P" && m.code !== "L")
    .map((m) => ({ ...m, pupil: pupilById.get(m.pupilId) ?? null }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function listLateArrivalsInRange(madrasahId: string, fromDate: string) {
  const [pupils, marks] = await Promise.all([
    listPupils(madrasahId),
    db
      .select()
      .from(attendanceMark)
      .where(and(eq(attendanceMark.madrasahId, madrasahId), gte(attendanceMark.date, fromDate))),
  ]);
  const pupilById = new Map(pupils.map((p) => [p.id, p]));
  return marks
    .filter((m) => m.code === "L")
    .map((m) => ({ ...m, pupil: pupilById.get(m.pupilId) ?? null }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function listDocumentsWithSignatureCounts(madrasahId: string) {
  const [docs, guardians] = await Promise.all([
    db.query.signDocument.findMany({
      where: eq(signDocument.madrasahId, madrasahId),
      orderBy: asc(signDocument.title),
      with: { signatures: true },
    }),
    listPortalGuardians(madrasahId),
  ]);
  return docs.map((d) => ({
    ...d,
    signedCount: d.signatures.filter((s) => s.signedAt).length,
    totalGuardians: guardians.length,
  }));
}

// Contact Sheet (design/Madrassa Portal.dc.html People > Students > Contact Sheet) —
// every guardian, one row per guardian per pupil relationship, for quick emergency
// lookup. Distinct from Student Records: this is guardian-centric, not pupil-centric.
export async function listEmergencyContacts(madrasahId: string) {
  const pupils = await listPupils(madrasahId);
  const onRoll = pupils.filter((p) => p.enrolmentState === "Enrolled");
  const links = await db.query.pupilGuardian.findMany({
    where: eq(pupilGuardian.madrasahId, madrasahId),
    with: { guardian: true },
  });
  const pupilById = new Map(onRoll.map((p) => [p.id, p]));

  const rows = links
    .map((l) => ({ guardian: l.guardian, pupil: pupilById.get(l.pupilId) })
    )
    .filter((r): r is { guardian: typeof links[number]["guardian"]; pupil: (typeof onRoll)[number] } => !!r.pupil)
    .sort((a, b) => a.guardian.name.localeCompare(b.guardian.name));

  const fatherCount = rows.filter((r) => r.guardian.relation === "Father").length;
  const motherCount = rows.filter((r) => r.guardian.relation === "Mother").length;
  const guardianIds = new Set(rows.map((r) => r.guardian.id));

  return { rows, fatherCount, motherCount, totalGuardians: guardianIds.size };
}

export async function getHouseholdFeeSummaryForPupil(madrasahId: string, pupilId: string) {
  const pupils = await listPupils(madrasahId);
  const pupilRow = pupils.find((p) => p.id === pupilId);
  if (!pupilRow?.householdId) return null;
  const summaries = await listHouseholdFeeSummaries(madrasahId);
  return summaries.find((s) => s.householdId === pupilRow.householdId) ?? null;
}

// ---------------------------------------------------------------------------
// Teacher portal
// ---------------------------------------------------------------------------

// The classes this member of staff leads (design/README.md Teacher "My Register",
// "My Students"). A staff row currently leads at most one class in this schema
// (klass.leadTeacherId), but the portal is written against a list in case that
// changes — see design/README.md's own note that some staff teach more than one group.
export async function getTeacherClasses(madrasahId: string, staffId: string) {
  return db.query.klass.findMany({
    where: and(eq(klass.madrasahId, madrasahId), eq(klass.leadTeacherId, staffId)),
    orderBy: asc(klass.name),
    with: { pupils: true },
  });
}

export async function getTeacherLessonPlan(madrasahId: string, year: AdmissionYear, weekStartDate: string) {
  return db.query.lessonPlan.findFirst({
    where: and(eq(lessonPlan.madrasahId, madrasahId), eq(lessonPlan.year, year), eq(lessonPlan.weekStartDate, weekStartDate)),
    with: { entries: true, setBy: true },
  });
}

// All 52 weeks of the academic year for a year band, planned or not — the Teacher >
// Lesson Plans "Annual overview" (design/README.md). weekStartDates is generated by
// lib/derive/lesson-plans.ts's academicYearMonths-style walk, passed in by the caller.
export async function listHifzRecordsForClass(madrasahId: string, classId: string, limit = 30) {
  return db.query.hifzRecord.findMany({
    where: and(eq(hifzRecord.madrasahId, madrasahId), eq(hifzRecord.classId, classId)),
    orderBy: [desc(hifzRecord.date), desc(hifzRecord.createdAt)],
    with: { pupil: true, recordedBy: true },
    limit,
  });
}

export async function listHifzRecordsForPupil(pupilId: string, limit = 60) {
  return db.query.hifzRecord.findMany({
    where: eq(hifzRecord.pupilId, pupilId),
    orderBy: [desc(hifzRecord.date), desc(hifzRecord.createdAt)],
    limit,
  });
}

export async function listHolidayRevisionWindows(madrasahId: string) {
  const classes = await listClasses(madrasahId);
  const windows = await db.query.holidayRevisionWindow.findMany({
    where: eq(holidayRevisionWindow.madrasahId, madrasahId),
    orderBy: desc(holidayRevisionWindow.startDate),
    with: { days: { with: { completions: true } } },
  });
  return classes.map((c) => ({
    class: c,
    window: windows.find((w) => w.classId === c.id) ?? null,
  }));
}

export async function getHolidayRevisionWindow(madrasahId: string, classId: string) {
  return db.query.holidayRevisionWindow.findFirst({
    where: and(eq(holidayRevisionWindow.madrasahId, madrasahId), eq(holidayRevisionWindow.classId, classId)),
    orderBy: desc(holidayRevisionWindow.startDate),
    with: { days: { orderBy: asc(holidayRevisionDay.date), with: { completions: true } } },
  });
}

export async function getStaffClockEvents(staffId: string) {
  return db.select().from(staffClockEvent).where(eq(staffClockEvent.staffId, staffId)).orderBy(desc(staffClockEvent.clockedInAt));
}

export async function listTeacherAnnualPlan(madrasahId: string, year: AdmissionYear, weekStartDates: string[]) {
  const plans = await db.query.lessonPlan.findMany({
    where: and(eq(lessonPlan.madrasahId, madrasahId), eq(lessonPlan.year, year)),
    with: { entries: true },
  });
  const byWeek = new Map(plans.map((p) => [p.weekStartDate, p]));
  return weekStartDates.map((weekStartDate) => ({ weekStartDate, plan: byWeek.get(weekStartDate) ?? null }));
}

// ---------------------------------------------------------------------------
// Parent portal
// ---------------------------------------------------------------------------

// Attendance % and lateness this term, computed live from attendance_mark — never
// stored (invariant 1). "This term" = the pupil's calendar's current term if one
// covers today, else all marks on record.
export async function getPupilAttendanceSummary(madrasahId: string, pupilId: string) {
  const marks = await db
    .select()
    .from(attendanceMark)
    .where(and(eq(attendanceMark.madrasahId, madrasahId), eq(attendanceMark.pupilId, pupilId)));
  if (marks.length === 0) return { attendancePct: 100, lateCount: 0, sessionCount: 0 };

  const presentOrLate = marks.filter((m) => m.code === "P" || m.code === "L").length;
  const lateCount = marks.filter((m) => m.code === "L").length;
  return {
    attendancePct: Math.round((presentOrLate / marks.length) * 100),
    lateCount,
    sessionCount: marks.length,
  };
}

export async function countHomeworkDueThisWeek(madrasahId: string, pupilId: string) {
  const today = todayLondon();
  const monday = mondayOfDate(today);
  const sunday = new Date(`${monday}T00:00:00Z`);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const sundayStr = sunday.toISOString().slice(0, 10);

  const rows = await db.query.homeworkSubmission.findMany({
    where: eq(homeworkSubmission.pupilId, pupilId),
    with: { homework: true },
  });
  return rows.filter((r) => r.homework.madrasahId === madrasahId && r.homework.dueDate >= monday && r.homework.dueDate <= sundayStr).length;
}

export async function getParentHomeworkList(madrasahId: string, pupilId: string) {
  const rows = await db.query.homeworkSubmission.findMany({
    where: eq(homeworkSubmission.pupilId, pupilId),
    with: { homework: { with: { setBy: true } } },
    orderBy: desc(homeworkSubmission.id),
  });
  return rows
    .filter((r) => r.homework.madrasahId === madrasahId)
    .sort((a, b) => a.homework.dueDate.localeCompare(b.homework.dueDate));
}

export async function getPupilDuaTracker(madrasahId: string, pupilId: string, year: AdmissionYear) {
  const items = await db.query.duaCatalogItem.findMany({
    where: and(eq(duaCatalogItem.madrasahId, madrasahId), eq(duaCatalogItem.year, year)),
    orderBy: asc(duaCatalogItem.orderIndex),
    with: { statuses: { where: eq(duaPupilStatus.pupilId, pupilId) } },
  });
  return items.map((item) => ({ ...item, status: item.statuses[0] ?? null }));
}

export async function getPupilSurahTracker(madrasahId: string, pupilId: string, year: AdmissionYear) {
  const items = await db.query.surahCatalogItem.findMany({
    where: and(eq(surahCatalogItem.madrasahId, madrasahId), eq(surahCatalogItem.year, year)),
    orderBy: asc(surahCatalogItem.orderIndex),
    with: { statuses: { where: eq(surahPupilStatus.pupilId, pupilId) } },
  });
  return items.map((item) => ({ ...item, status: item.statuses[0] ?? null }));
}

export async function listLeaveRequestsForPupil(pupilId: string) {
  return db.query.leaveRequest.findMany({ where: eq(leaveRequest.pupilId, pupilId), orderBy: desc(leaveRequest.createdAt) });
}

export async function listLeaveRequests(madrasahId: string) {
  const rows = await db.query.leaveRequest.findMany({
    where: eq(leaveRequest.madrasahId, madrasahId),
    orderBy: desc(leaveRequest.createdAt),
    with: { decidedBy: true },
  });
  const pupils = await listPupils(madrasahId);
  const pupilById = new Map(pupils.map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, pupil: pupilById.get(r.pupilId) ?? null }));
}

export async function listParentsEveningSessions(madrasahId: string) {
  return db.query.parentsEveningSession.findMany({
    where: eq(parentsEveningSession.madrasahId, madrasahId),
    orderBy: desc(parentsEveningSession.date),
    with: { slots: { with: { staff: true, bookings: { with: { pupil: true } } } } },
  });
}

export async function listUpcomingParentsEveningSlots(madrasahId: string) {
  const sessions = await db.query.parentsEveningSession.findMany({
    where: and(eq(parentsEveningSession.madrasahId, madrasahId), gte(parentsEveningSession.date, todayLondon())),
    orderBy: asc(parentsEveningSession.date),
    with: { slots: { with: { staff: true, bookings: true } } },
  });
  return sessions;
}

export async function listDocumentsForGuardian(madrasahId: string, guardianId: string) {
  const docs = await db.query.signDocument.findMany({
    where: eq(signDocument.madrasahId, madrasahId),
    orderBy: asc(signDocument.title),
    with: { signatures: { where: eq(documentGuardianSignature.guardianId, guardianId) } },
  });
  return docs.map((d) => ({ ...d, signedAt: d.signatures[0]?.signedAt ?? null }));
}

export async function listPoliciesForGuardian(madrasahId: string, guardianId: string) {
  const policies = await db.query.policy.findMany({
    where: eq(policy.madrasahId, madrasahId),
    orderBy: asc(policy.title),
    with: { guardianAcks: { where: eq(policyGuardianAck.guardianId, guardianId) } },
  });
  return policies.map((p) => ({ ...p, acknowledgedAt: p.guardianAcks[0]?.acknowledgedAt ?? null }));
}

export async function getHifzSummaryForPupil(pupilId: string) {
  const records = await listHifzRecordsForPupil(pupilId);
  return records;
}

// ---------------------------------------------------------------------------
// Hifz Programme (Office)
// ---------------------------------------------------------------------------

export async function listHifzPupils(madrasahId: string) {
  const pupils = await listPupils(madrasahId);
  return pupils.filter((p) => p.class?.hifdhType && p.class.hifdhType !== "None" && p.enrolmentState === "Enrolled");
}

export async function getHifzRosterMadrasah(madrasahId: string) {
  const [pupils, records] = await Promise.all([
    listHifzPupils(madrasahId),
    db.select().from(hifzRecord).where(eq(hifzRecord.madrasahId, madrasahId)),
  ]);
  return pupils.map((p) => ({
    pupil: p,
    records: records.filter((r) => r.pupilId === p.id),
  }));
}

export async function listPreHifzPupils(madrasahId: string) {
  const pupils = await listPupils(madrasahId);
  return pupils.filter((p) => p.class?.hifdhType === "Pre-Hifz" && p.enrolmentState === "Enrolled");
}

// Monthly Tracker (design/Madrassa Portal.dc.html Hifz Programme "Monthly Tracker &
// Assessments"). The prototype breaks quality into several separate rated dimensions
// (sabak/dawr/tajwīd/fluency/retention/attendance/home preparation/behaviour) that this
// schema doesn't capture — hifz_record only has one quality rating per entry — so this
// aggregates what's real (record counts, average quality, pages progressed) rather than
// inventing the extra dimensions.
export async function getHifzMonthlyTracker(madrasahId: string, month: string) {
  const roster = await getHifzRosterMadrasah(madrasahId);
  const monthPrefix = month.slice(0, 7);
  return roster.map(({ pupil, records }) => {
    const monthRecords = records
      .filter((r) => r.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date));
    const qualityScore: Record<string, number> = { Excellent: 4, Strong: 3, Satisfactory: 2, Weak: 1 };
    const avgScore = monthRecords.length === 0 ? 0 : monthRecords.reduce((s, r) => s + qualityScore[r.quality], 0) / monthRecords.length;
    const pagesThisMonth = monthRecords
      .filter((r) => r.type === "Sabaq" && r.pageFrom && r.pageTo)
      .reduce((sum, r) => sum + (r.pageTo! - r.pageFrom! + 1), 0);
    return { pupil, records: monthRecords, avgScore, pagesThisMonth };
  });
}

export async function listPreHifzAssessments(madrasahId: string) {
  const pupils = await listPreHifzPupils(madrasahId);
  const rows = await db.query.preHifzAssessment.findMany({
    where: eq(preHifzAssessment.madrasahId, madrasahId),
  });
  const byPupil = new Map(rows.map((r) => [r.pupilId, r]));
  return pupils.map((p) => ({ pupil: p, assessment: byPupil.get(p.id) ?? null }));
}

// ---------------------------------------------------------------------------
// Reports & Examinations (Office)
// ---------------------------------------------------------------------------

export async function listTermsForMadrasah(madrasahId: string) {
  return db.query.term.findMany({ where: eq(term.madrasahId, madrasahId), orderBy: asc(term.startDate) });
}

export async function listReportsForTerm(madrasahId: string, termId: string) {
  const [pupils, reports] = await Promise.all([
    listPupils(madrasahId),
    db.query.report.findMany({ where: and(eq(report.madrasahId, madrasahId), eq(report.termId, termId)) }),
  ]);
  const byPupil = new Map(reports.map((r) => [r.pupilId, r]));
  return pupils
    .filter((p) => p.enrolmentState === "Enrolled")
    .map((p) => ({ pupil: p, report: byPupil.get(p.id) ?? null }));
}

export async function listExaminations(madrasahId: string) {
  return db.query.examination.findMany({
    where: eq(examination.madrasahId, madrasahId),
    orderBy: desc(examination.examDate),
    with: { term: true, results: true },
  });
}

export async function getExamination(madrasahId: string, examinationId: string) {
  const row = await db.query.examination.findFirst({
    where: eq(examination.id, examinationId),
    with: { term: true, results: true },
  });
  if (!row || row.madrasahId !== madrasahId) return null;
  const pupils = await listPupils(madrasahId);
  const resultByPupil = new Map(row.results.map((r) => [r.pupilId, r]));
  return {
    ...row,
    pupilRows: pupils
      .filter((p) => p.enrolmentState === "Enrolled")
      .map((p) => ({ pupil: p, result: resultByPupil.get(p.id) ?? null })),
  };
}

export async function listPublishedReportsForPupil(pupilId: string) {
  return db.query.report.findMany({
    where: and(eq(report.pupilId, pupilId), eq(report.status, "Published")),
    orderBy: desc(report.publishedAt),
    with: { term: true },
  });
}

export async function listExamResultsForPupil(pupilId: string) {
  const rows = await db.query.examResult.findMany({
    where: eq(examResult.pupilId, pupilId),
    with: { examination: { with: { term: true } } },
  });
  return rows.filter((r) => r.examination.publishedAt !== null).sort((a, b) => (b.examination.examDate ?? "").localeCompare(a.examination.examDate ?? ""));
}
