import { todayLondon } from "@/lib/derive/age";
import { academicYearWeekStarts, formatWeekLabel, mondayOfDate, YEAR1_BREAK_LABELS } from "@/lib/derive/lesson-plans";
import {
  getCurrentPupilFromCookie,
  getMadrasah,
  getTeacherLessonPlan,
  listCalendarSets,
  listTeacherAnnualPlan,
} from "@/lib/db/queries";

const SUBJECT_LABELS = ["Qaaidah", "Qur'an", "Islamic Studies", "Du'as Memorisation", "Surah Memorisation"] as const;

export default async function PupilTonightsWorkPage() {
  const madrasah = await getMadrasah();
  const pupil = await getCurrentPupilFromCookie(madrasah.id);
  if (!pupil) return null;

  const year = pupil.class?.yearBand;
  if (!year) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        No lesson plan applies to your class yet.
      </p>
    );
  }

  const today = todayLondon();
  const thisWeekPlan = await getTeacherLessonPlan(madrasah.id, year, mondayOfDate(today));

  const calendarSets = await listCalendarSets(madrasah.id);
  const academicYearStart = calendarSets[0]?.academicYearStart ?? "2025-09-01";
  const weekStartDates = academicYearWeekStarts(academicYearStart);
  const annual = await listTeacherAnnualPlan(madrasah.id, year, weekStartDates);

  const surahEntry = thisWeekPlan?.entries.find((e) => e.subject === "Surah Memorisation");
  const duaEntry = thisWeekPlan?.entries.find((e) => e.subject === "Du'as Memorisation");
  const qaaidahEntry = thisWeekPlan?.entries.find((e) => e.subject === "Qaaidah");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{pupil.name} · {pupil.class?.name}</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Tonight&apos;s Work</h1>
      </div>

      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-5">
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Tonight</p>
        <p className="mt-1 font-heading text-h4 font-medium text-[var(--ink)]">
          {surahEntry ? `Practise ${surahEntry.content}.` : "Nothing set for tonight yet."}
        </p>
        {surahEntry && <p className="text-small text-[var(--ink-2)]">Read it three times out loud, then once without looking.</p>}
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Also this week</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Du&apos;ā to learn</p>
            <p className="text-small text-[var(--ink)]">{duaEntry?.content ?? "—"}</p>
          </div>
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Qaaidah</p>
            <p className="text-small text-[var(--ink)]">{qaaidahEntry?.content ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">The whole term</p>
        <div className="flex flex-col divide-y divide-border">
          {annual.map(({ weekStartDate, plan }, i) => {
            const breakLabel = YEAR1_BREAK_LABELS[weekStartDate];
            if (!plan || plan.entries.length === 0) {
              return breakLabel ? (
                <div key={weekStartDate} className="py-2 text-small text-[var(--muted)]">
                  Week {i + 1} · {formatWeekLabel(weekStartDate).replace("Week of ", "")} — {breakLabel}
                </div>
              ) : null;
            }
            return (
              <div key={weekStartDate} className="py-3">
                <p className="text-small font-medium text-[var(--ink)]">
                  Week {i + 1} · {formatWeekLabel(weekStartDate).replace("Week of ", "")}
                </p>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                  {SUBJECT_LABELS.map((subject) => {
                    const entry = plan.entries.find((e) => e.subject === subject);
                    if (!entry) return null;
                    return (
                      <p key={subject} className="text-tiny text-[var(--ink-2)]">
                        <span className="text-[var(--muted)]">{subject}:</span> {entry.content}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
