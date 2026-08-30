import Link from "next/link";
import { HubTabs } from "@/components/office/hub-tabs";
import { LESSON_PLANS_TABS } from "@/lib/office-hubs";
import { getMadrasah, listHolidayRevisionWindows } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

// See app/(office)/reports/weekly-review/page.tsx — this page has intermittently timed
// out Next's build-time static generation too; it's live per-tenant data anyway.
export const dynamic = "force-dynamic";

export default async function OfficeHolidayRevisionPage() {
  const madrasah = await getMadrasah();
  const rows = await listHolidayRevisionWindows(madrasah.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={LESSON_PLANS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning · Lesson Plans</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Holiday Revision</h1>
        <p className="text-small text-[var(--muted)]">Which classes have a holiday revision window set, across the whole madrasah.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {rows.map(({ class: c, window }) => {
          const daysWithContent = window?.days.filter((d) => d.quranQaaidah || d.surahMemorisation || d.islamicStudies || d.duas).length ?? 0;
          return (
            <Link
              key={c.id}
              href={`/lesson-plans/holiday-revision/${c.id}`}
              className="flex items-center justify-between border-t border-border p-3 first:border-t-0 text-small hover:bg-[var(--surface-2)]"
            >
              <span className="text-[var(--ink)]">{c.name}</span>
              <span className={cn("rounded-full px-2.5 py-1 text-tiny font-medium", window ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]")}>
                {window ? `${window.startDate} – ${window.endDate} · ${daysWithContent}/${window.days.length} days set` : "Not set"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
