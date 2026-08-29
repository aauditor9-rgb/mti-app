import Link from "next/link";
import { todayLondon } from "@/lib/derive/age";
import { REGISTER_CLOSE_TIME } from "@/lib/derive/attendance";
import { mondayOfDate } from "@/lib/derive/lesson-plans";
import { getCurrentStaff, getMadrasah, getRegisterForClass, getTeacherClasses, getTeacherLessonPlan } from "@/lib/db/queries";

const SUBJECT_LABELS = ["Qaaidah", "Qur'an", "Islamic Studies", "Du'as Memorisation", "Surah Memorisation"] as const;

export default async function TeacherHomePage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const today = todayLondon();
  const closeHour = Number(REGISTER_CLOSE_TIME.slice(0, 2));
  const closeLabel = `${((closeHour + 11) % 12) + 1}:${REGISTER_CLOSE_TIME.slice(3)}${closeHour >= 12 ? "pm" : "am"}`;

  const registers = await Promise.all(classes.map((c) => getRegisterForClass(madrasah.id, c.id, today)));
  const plans = await Promise.all(
    classes.map((c) => (c.yearBand ? getTeacherLessonPlan(madrasah.id, c.yearBand, mondayOfDate(today)) : null)),
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Today</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Today&apos;s Lesson</h1>
        <p className="text-small text-[var(--muted)]">Assalamu alaikum, {staff.name}.</p>
      </div>

      {classes.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          You aren&apos;t set as the lead teacher of any class yet — ask the office to assign one to you in Classes &amp;
          Allocation.
        </p>
      ) : (
        classes.map((c, i) => {
          const register = registers[i];
          const plan = plans[i];
          const marked = register?.pupils.filter((p) => p.mark).length ?? 0;
          const total = register?.pupils.length ?? 0;
          const submitted = !!register?.submittedAt;

          return (
            <div key={c.id} className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-5">
                <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{c.name}</p>
                {submitted ? (
                  <p className="mt-1 font-medium text-[var(--success)]">Register submitted for today. Jazak Allahu khayran.</p>
                ) : (
                  <>
                    <p className="mt-1 font-heading text-h4 font-medium text-[var(--ink)]">
                      Take today&apos;s register before {closeLabel}
                    </p>
                    <p className="text-small text-[var(--ink-2)]">
                      {marked} of {total} marked{marked === total && total > 0 ? " — it just needs submitting." : "."}
                    </p>
                    <Link
                      href="/teacher/register"
                      className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
                    >
                      Take the register
                    </Link>
                  </>
                )}
              </div>

              <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
                <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">After that</p>
                <div className="flex flex-col divide-y divide-border">
                  <Link href="/teacher/homework-review" className="flex items-center justify-between py-2 text-small text-[var(--ink)] hover:text-primary">
                    Review who has done their homework <span className="text-[var(--muted)]">≈3 min</span>
                  </Link>
                  <Link href="/teacher/ihsan" className="flex items-center justify-between py-2 text-small text-[var(--ink)] hover:text-primary">
                    Log behaviour — positives and concerns <span className="text-[var(--muted)]">≈2 min</span>
                  </Link>
                  {staff.isHifzTeacher && (
                    <Link href="/teacher/hifz-diary" className="flex items-center justify-between py-2 text-small text-[var(--ink)] hover:text-primary">
                      Record today&apos;s sabaq, sabqī and manzil <span className="text-[var(--muted)]">≈6 min</span>
                    </Link>
                  )}
                </div>
              </div>

              {plan && (
                <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
                  <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">This week&apos;s lesson</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {SUBJECT_LABELS.map((subject) => {
                      const entry = plan.entries.find((e) => e.subject === subject);
                      return (
                        <div key={subject}>
                          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{subject}</p>
                          <p className="text-small text-[var(--ink)]">{entry?.content ?? "—"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
