import { HubTabs } from "@/components/office/hub-tabs";
import { todayLondon } from "@/lib/derive/age";
import { ATTENDANCE_TABS } from "@/lib/office-hubs";
import { getMadrasah, listLateArrivalsInRange } from "@/lib/db/queries";

function daysAgo(n: number): string {
  const d = new Date(`${todayLondon()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function LateArrivalsPage() {
  const madrasah = await getMadrasah();
  const lates = await listLateArrivalsInRange(madrasah.id, daysAgo(30));

  const byPupil = new Map<string, number>();
  for (const l of lates) {
    if (!l.pupil) continue;
    byPupil.set(l.pupil.name, (byPupil.get(l.pupil.name) ?? 0) + 1);
  }
  const repeat = [...byPupil.entries()].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={ATTENDANCE_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Attendance &amp; Behaviour</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Late Arrivals</h1>
        <p className="text-small text-[var(--muted)]">Last 30 days · {lates.length} late marks</p>
      </div>

      {repeat.length > 0 && (
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Repeated lateness (3+)</p>
          <div className="flex flex-wrap gap-2">
            {repeat.map(([name, count]) => (
              <span key={name} className="rounded-full bg-[var(--warn-bg)] px-3 py-1 text-small text-[var(--ink-2)]">
                {name} · {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {lates.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No late arrivals in this window.</p>
        ) : (
          lates.map((l) => (
            <div key={l.id} className="flex items-center gap-3 border-t border-border p-3 first:border-t-0 text-small">
              <span className="w-24 shrink-0 text-tiny text-[var(--muted)]">{l.date}</span>
              <span className="flex-1 text-[var(--ink)]">{l.pupil?.name ?? "Unknown pupil"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
