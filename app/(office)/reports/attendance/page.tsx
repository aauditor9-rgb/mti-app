import { HubTabs } from "@/components/office/hub-tabs";
import { todayLondon } from "@/lib/derive/age";
import { REPORTS_TABS } from "@/lib/office-hubs";
import { getAttendanceReportByClass, getMadrasah } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

function daysAgo(n: number): string {
  const d = new Date(`${todayLondon()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function AttendanceReportPage() {
  const madrasah = await getMadrasah();
  const rows = await getAttendanceReportByClass(madrasah.id, daysAgo(30));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={REPORTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Attendance Report</h1>
        <p className="text-small text-[var(--muted)]">Last 30 days, by class.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {rows.map(({ class: c, markCount, pct }) => (
          <div key={c.id} className="flex items-center gap-3 border-t border-border p-3 first:border-t-0 text-small">
            <span className="flex-1 text-[var(--ink)]">{c.name}</span>
            <span className="w-24 text-tiny text-[var(--muted)]">{markCount} marks</span>
            <div className="h-[7px] w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className={cn("h-full rounded-full", pct >= 85 ? "bg-[var(--success)]" : pct >= 70 ? "bg-[var(--warn-bg)]" : "bg-[var(--alert)]")} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 text-right font-medium text-[var(--ink)]">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
