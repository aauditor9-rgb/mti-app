import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HolidayRevisionDayRow } from "@/components/teacher/holiday-revision-day";
import { HolidayWindowForm } from "@/components/teacher/holiday-window-form";
import { getClass, getHolidayRevisionWindow, getMadrasah } from "@/lib/db/queries";

export default async function OfficeHolidayRevisionClassPage(props: PageProps<"/lesson-plans/holiday-revision/[classId]">) {
  const { classId } = await props.params;
  const madrasah = await getMadrasah();
  const classRow = await getClass(madrasah.id, classId);
  if (!classRow) notFound();

  const window = await getHolidayRevisionWindow(madrasah.id, classId);
  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{classRow.name} · Holiday</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Holiday Revision</h1>
      </div>

      <Link href="/lesson-plans/holiday-revision" className="inline-flex w-fit items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]">
        <ArrowLeft className="size-3.5" /> Back to all classes
      </Link>

      <HolidayWindowForm classId={classId} startDate={window?.startDate} endDate={window?.endDate} />

      {window && window.days.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
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
              totalPupils={classRow.pupils.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
