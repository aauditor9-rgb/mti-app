import { HolidayRevisionDayRow } from "@/components/teacher/holiday-revision-day";
import { HolidayWindowForm } from "@/components/teacher/holiday-window-form";
import { getCurrentStaff, getHolidayRevisionWindow, getMadrasah, getTeacherClasses } from "@/lib/db/queries";

export default async function TeacherHolidayRevisionPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const activeClass = classes[0];

  if (!activeClass) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        You aren&apos;t set as the lead teacher of any class yet.
      </p>
    );
  }

  const window = await getHolidayRevisionWindow(madrasah.id, activeClass.id);
  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{activeClass.name} · Holiday</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Holiday Revision</h1>
        <p className="text-small text-[var(--muted)]">
          Set what pupils revise each day of the holiday. Parents see this and tick each day off with their child.
        </p>
      </div>

      <HolidayWindowForm classId={activeClass.id} startDate={window?.startDate} endDate={window?.endDate} />

      {window && window.days.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
          {window.days.map((d) => (
            <HolidayRevisionDayRow
              key={d.id}
              dayId={d.id}
              dateLabel={dateFmt.format(new Date(`${d.date}T00:00:00Z`))}
              quranQaaidah={d.quranQaaidah}
              surahMemorisation={d.surahMemorisation}
              islamicStudies={d.islamicStudies}
              duas={d.duas}
              notes={d.notes}
              completedCount={d.completions.filter((c) => c.completedAt).length}
              totalPupils={activeClass.pupils.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
