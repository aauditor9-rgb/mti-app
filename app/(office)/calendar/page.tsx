import Link from "next/link";
import { AddCalendarSetForm } from "@/components/office/add-calendar-set-form";
import { CalendarHolidays } from "@/components/office/calendar-holidays";
import { CalendarTerms } from "@/components/office/calendar-terms";
import { MonthGrid } from "@/components/office/month-grid";
import { MONTH_NAMES, academicYearMonths, getMonthGrid } from "@/lib/derive/calendar-grid";
import { getMadrasah, listCalendarSets, listEvents } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const LEGEND = [
  { label: "Class day", swatch: "bg-[var(--surface-2)]" },
  { label: "Holiday", swatch: "bg-[var(--warn-bg)]" },
  { label: "Non-teaching day", swatch: "bg-transparent border border-[var(--border-2)]" },
  { label: "Event", swatch: "bg-transparent", dot: true },
];

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ set?: string }> }) {
  const { set: rawSet } = await searchParams;
  const madrasah = await getMadrasah();
  const [calendarSets, events] = await Promise.all([listCalendarSets(madrasah.id), listEvents(madrasah.id)]);

  const activeSet = calendarSets.find((c) => c.id === rawSet) ?? calendarSets[0] ?? null;
  const eventDates = new Set(events.map((e) => e.startAt.toISOString().slice(0, 10)));

  const months = activeSet ? academicYearMonths(activeSet.academicYearStart, activeSet.academicYearEnd) : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
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
                activeSet?.id === c.id ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
              )}
            >
              {c.name} · {c.classes.length} classes
            </Link>
          ))}
        </div>
      )}

      <AddCalendarSetForm />

      {activeSet && (
        <>
          <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-h3 font-medium text-[var(--ink)]">{activeSet.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-tiny text-[var(--muted)]">
                {LEGEND.map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span className={cn("relative inline-block size-3 rounded-sm", l.swatch)}>
                      {l.dot && <span className="absolute inset-0 m-auto size-1 rounded-full bg-primary" />}
                    </span>
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {months.map(({ year, month }) => (
                <MonthGrid
                  key={`${year}-${month}`}
                  label={`${MONTH_NAMES[month - 1]} ${year}`}
                  cells={getMonthGrid(year, month, {
                    academicYearStart: activeSet.academicYearStart,
                    academicYearEnd: activeSet.academicYearEnd,
                    teachingDays: activeSet.teachingDays,
                    holidays: activeSet.holidays,
                    eventDates,
                  })}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-[var(--surface)] p-5">
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Manage calendar</p>
            <div>
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
        </>
      )}
    </div>
  );
}
