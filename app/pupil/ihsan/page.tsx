import { getCurrentPupilFromCookie, getMadrasah, listIhsanTotals } from "@/lib/db/queries";

export default async function PupilIhsanPage() {
  const madrasah = await getMadrasah();
  const pupil = await getCurrentPupilFromCookie(madrasah.id);
  if (!pupil) return null;

  const totals = await listIhsanTotals(madrasah.id);
  const sorted = [...totals].sort((a, b) => b.points - a.points);
  const me = sorted.find((p) => p.id === pupil.id);
  const rank = me ? sorted.findIndex((p) => p.id === pupil.id) + 1 : null;

  const feed = [
    ...(me?.manualRows.map((r) => ({ id: r.id, name: r.award.name, points: r.award.points, by: r.awardedBy?.name ?? "Office", date: r.awardedAt })) ?? []),
    ...(me?.automatic.map((a) => ({ id: `${a.weekKey}-${a.awardName}`, name: a.awardName, points: a.points, by: "Automatic", date: new Date(`${a.weekEndDate}T00:00:00Z`) })) ?? []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">My Ihsan Points</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">My Ihsan Points</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{me?.points ?? 0}</p>
          <p className="text-small text-[var(--muted)]">Points</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">#{rank ?? "—"}</p>
          <p className="text-small text-[var(--muted)]">School rank</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">How I earned them</p>
        {feed.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No points yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {feed.map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2.5 text-small">
                <div>
                  <span className="text-[var(--success)]">+{row.points}</span> <span className="font-medium text-[var(--ink)]">{row.name}</span>
                  <p className="text-tiny text-[var(--muted)]">From {row.by}</p>
                </div>
                <span className="text-tiny text-[var(--muted)]">{row.date.toISOString().slice(0, 10)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
