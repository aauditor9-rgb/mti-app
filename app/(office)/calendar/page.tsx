import Link from "next/link";
import { AddCalendarSetForm } from "@/components/office/add-calendar-set-form";
import { CalendarHolidays } from "@/components/office/calendar-holidays";
import { CalendarTerms } from "@/components/office/calendar-terms";
import { getMadrasah, listCalendarSets } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ set?: string }> }) {
  const { set: rawSet } = await searchParams;
  const madrasah = await getMadrasah();
  const calendarSets = await listCalendarSets(madrasah.id);

  const activeSet = calendarSets.find((c) => c.id === rawSet) ?? calendarSets[0] ?? null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Overview</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Calendar</h1>
        <p className="text-small text-[var(--muted)]">
          Different programmes can run to different calendars — each has its own academic year, terms, teaching days and
          holidays.
        </p>
      </div>

      {calendarSets.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No calendars set up yet.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {calendarSets.map((c) => (
            <Link
              key={c.id}
              href={`/calendar?set=${c.id}`}
              className={cn(
                "rounded-full px-3 py-1 text-small font-medium",
                activeSet?.id === c.id ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
              )}
            >
              {c.name} · {c.classes.length} classes
            </Link>
          ))}
        </div>
      )}

      <AddCalendarSetForm />

      {activeSet && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-[var(--surface)] p-5">
          <div>
            <h2 className="font-heading text-h3 font-medium text-[var(--ink)]">{activeSet.name}</h2>
            {activeSet.description && <p className="text-small text-[var(--ink-2)]">{activeSet.description}</p>}
            <p className="mt-1 text-tiny text-[var(--muted)]">
              {activeSet.academicYearStart} – {activeSet.academicYearEnd} · Teaching days:{" "}
              {activeSet.teachingDays.join(", ")}
            </p>
          </div>

          <div>
            <p className="mb-1 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              Classes on this calendar ({activeSet.classes.length})
            </p>
            {activeSet.classes.length === 0 ? (
              <p className="text-small text-[var(--muted)]">No classes assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeSet.classes.map((c) => (
                  <span key={c.id} className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-tiny text-[var(--ink-2)]">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <CalendarTerms calendarSetId={activeSet.id} terms={activeSet.terms} />
          <CalendarHolidays calendarSetId={activeSet.id} holidays={activeSet.holidays} />
        </div>
      )}
    </div>
  );
}
