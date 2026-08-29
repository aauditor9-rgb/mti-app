import { LessonPlanWeekPicker } from "@/components/office/lesson-plan-week-picker";
import { LessonPlanYearRow } from "@/components/office/lesson-plan-year-row";
import { todayLondon } from "@/lib/derive/age";
import { formatWeekLabel, isoWeekInputValue, mondayFromIsoWeekValue, mondayOfDate } from "@/lib/derive/lesson-plans";
import { getMadrasah, listLessonPlansForWeek, listStaff } from "@/lib/db/queries";

export default async function LessonPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStartDate = week ? mondayFromIsoWeekValue(week) : mondayOfDate(todayLondon());
  const weekInputValue = week ?? isoWeekInputValue(todayLondon());

  const madrasah = await getMadrasah();
  const [rows, staff] = await Promise.all([
    listLessonPlansForWeek(madrasah.id, weekStartDate),
    listStaff(madrasah.id),
  ]);

  const plannedCount = rows.filter((r) => (r.plan?.entries.length ?? 0) > 0).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Weekly Lesson Plans</h1>
        <p className="text-small text-[var(--muted)]">See and set what each year band is studying, week by week.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
        <div>
          <p className="font-medium text-[var(--ink)]">{formatWeekLabel(weekStartDate)}</p>
          <p className="text-small text-[var(--muted)]">{plannedCount} of {rows.length} years planned</p>
        </div>
        <LessonPlanWeekPicker value={weekInputValue} />
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ year, plan }) => (
          <LessonPlanYearRow
            key={year}
            year={year}
            weekStartDate={weekStartDate}
            entries={plan?.entries.map((e) => ({ id: e.id, subject: e.subject, content: e.content })) ?? []}
            setByName={plan?.setBy?.name ?? null}
            staff={staff.map((s) => ({ id: s.id, name: s.name }))}
          />
        ))}
      </div>
    </div>
  );
}
