import { HubTabs } from "@/components/office/hub-tabs";
import { todayLondon } from "@/lib/derive/age";
import { REPORTS_TABS } from "@/lib/office-hubs";
import { getMadrasah, listLateArrivalsInRange } from "@/lib/db/queries";

function daysAgo(n: number): string {
  const d = new Date(`${todayLondon()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function LatenessReportPage() {
  const madrasah = await getMadrasah();
  const lates = await listLateArrivalsInRange(madrasah.id, daysAgo(30));

  const byPupil = new Map<string, { name: string; className: string | null; count: number }>();
  for (const l of lates) {
    if (!l.pupil) continue;
    const existing = byPupil.get(l.pupil.id);
    if (existing) existing.count += 1;
    else byPupil.set(l.pupil.id, { name: l.pupil.name, className: l.pupil.class?.name ?? null, count: 1 });
  }
  const ranked = [...byPupil.values()].sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={REPORTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Lateness Report</h1>
        <p className="text-small text-[var(--muted)]">Last 30 days · {lates.length} late marks across {ranked.length} pupils.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {ranked.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No late arrivals in this window.</p>
        ) : (
          ranked.map((p) => (
            <div key={p.name} className="flex items-center justify-between border-t border-border p-3 first:border-t-0 text-small">
              <span className="text-[var(--ink)]">
                {p.name} <span className="text-tiny text-[var(--muted)]">· {p.className ?? "Unallocated"}</span>
              </span>
              <span className="font-medium text-[var(--ink)]">{p.count}×</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
