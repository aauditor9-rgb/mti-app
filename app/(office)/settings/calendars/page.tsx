import Link from "next/link";
import { HubTabs } from "@/components/office/hub-tabs";
import { SETTINGS_TABS } from "@/lib/office-hubs";
import { getMadrasah, listCalendarSets } from "@/lib/db/queries";

export default async function SettingsCalendarsPage() {
  const madrasah = await getMadrasah();
  const calendarSets = await listCalendarSets(madrasah.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={SETTINGS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Settings</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Calendars</h1>
        <p className="text-small text-[var(--muted)]">
          Academic years, terms, teaching days and holidays are managed on the{" "}
          <Link href="/calendar" className="font-medium text-[var(--primary)] hover:underline">
            Calendar
          </Link>{" "}
          screen.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {calendarSets.map((c) => (
          <Link key={c.id} href={`/calendar?set=${c.id}`} className="flex items-center justify-between border-t border-border p-3 first:border-t-0 text-small hover:bg-[var(--surface-2)]">
            <span className="text-[var(--ink)]">{c.name}</span>
            <span className="text-tiny text-[var(--muted)]">
              {c.academicYearStart} – {c.academicYearEnd} · {c.classes.length} classes · {c.terms.length} terms
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
