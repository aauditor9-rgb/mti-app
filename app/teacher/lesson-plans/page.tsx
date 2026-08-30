import Link from "next/link";
import { LessonPlanYearRow } from "@/components/office/lesson-plan-year-row";
import { LessonPlanWeekPicker } from "@/components/office/lesson-plan-week-picker";
import { CoveredToggle } from "@/components/teacher/covered-toggle";
import { todayLondon } from "@/lib/derive/age";
import {
  academicYearWeekStarts,
  formatWeekLabel,
  isoWeekInputValue,
  mondayFromIsoWeekValue,
  mondayOfDate,
  YEAR1_BREAK_LABELS,
} from "@/lib/derive/lesson-plans";
import { cn } from "@/lib/utils";
import {
  getCurrentStaff,
  getMadrasah,
  getTeacherClasses,
  getTeacherLessonPlan,
  listCalendarSets,
  listStaff,
  listTeacherAnnualPlan,
} from "@/lib/db/queries";

export default async function TeacherLessonPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; week?: string }>;
}) {
  const { view = "annual", week } = await searchParams;
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const activeClass = classes.find((c) => c.yearBand) ?? classes[0];

  if (!activeClass?.yearBand) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        Lesson plans apply to a year band — your class isn&apos;t assigned to one, so there&apos;s nothing to show here.
      </p>
    );
  }
  const year = activeClass.yearBand;

  const calendarSets = await listCalendarSets(madrasah.id);
  const academicYearStart = calendarSets[0]?.academicYearStart ?? "2025-09-01";
  const weekStartDates = academicYearWeekStarts(academicYearStart);

  if (view === "weekly") {
    const weekStartDate = week ? mondayFromIsoWeekValue(week) : mondayOfDate(todayLondon());
    const weekInputValue = week ?? isoWeekInputValue(todayLondon());
    const plan = await getTeacherLessonPlan(madrasah.id, year, weekStartDate);
    const allStaff = await listStaff(madrasah.id);

    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Header year={year} view={view} />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-medium text-[var(--ink)]">{formatWeekLabel(weekStartDate)}</p>
          <LessonPlanWeekPicker value={weekInputValue} basePath="/teacher/lesson-plans" extraParams={{ view: "weekly" }} />
        </div>
        <LessonPlanYearRow
          year={year}
          weekStartDate={weekStartDate}
          entries={plan?.entries.map((e) => ({ id: e.id, subject: e.subject, content: e.content })) ?? []}
          setByName={plan?.setBy?.name ?? null}
          staff={allStaff.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>
    );
  }

  const annual = await listTeacherAnnualPlan(madrasah.id, year, weekStartDates);
  const teachingWeeks = annual.filter((w) => (w.plan?.entries.length ?? 0) > 0);
  const coveredCount = teachingWeeks.filter((w) => w.plan?.coveredAt).length;
  const pct = teachingWeeks.length === 0 ? 0 : Math.round((coveredCount / teachingWeeks.length) * 100);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Header year={year} view={view} />

      <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
        <p className="text-small text-[var(--ink-2)]">
          {coveredCount} of {teachingWeeks.length} teaching weeks covered · {pct}%
        </p>
        <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {annual.map(({ weekStartDate, plan }, i) => {
          const hasLesson = (plan?.entries.length ?? 0) > 0;
          const breakLabel = YEAR1_BREAK_LABELS[weekStartDate];
          const summary = plan?.entries.find((e) => e.subject === "Islamic Studies")?.content ?? plan?.entries[0]?.content;
          return (
            <div key={weekStartDate} className="flex items-center gap-3 border-t border-border p-3 first:border-t-0">
              <span className="w-16 shrink-0 text-tiny text-[var(--muted)]">
                Wk {i + 1}
                <br />
                {formatWeekLabel(weekStartDate).replace("Week of ", "")}
              </span>
              <span className="min-w-0 flex-1 truncate text-small text-[var(--ink)]">
                {hasLesson ? summary : <span className="text-[var(--muted)]">{breakLabel ?? "Not yet planned"}</span>}
              </span>
              {hasLesson && plan ? (
                <CoveredToggle planId={plan.id} covered={!!plan.coveredAt} />
              ) : (
                breakLabel && <span className="text-tiny text-[var(--muted)]">No lesson</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header({ year, view }: { year: string; view: string }) {
  return (
    <div>
      <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Curriculum · {year}</p>
      <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Lesson Plans</h1>
      <div className="mt-2 flex gap-2">
        <Link
          href="/teacher/lesson-plans?view=annual"
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            view !== "weekly" ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
          )}
        >
          Annual overview
        </Link>
        <Link
          href="/teacher/lesson-plans?view=weekly"
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            view === "weekly" ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
          )}
        >
          Weekly plan
        </Link>
      </div>
    </div>
  );
}
