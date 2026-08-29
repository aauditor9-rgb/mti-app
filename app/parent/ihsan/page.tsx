import { getCurrentGuardian, getMadrasah, listIhsanTotals } from "@/lib/db/queries";

export default async function ParentIhsanPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return null;
  const activeChild = guardianRow.children.find((c) => c.id === child) ?? guardianRow.children[0];
  if (!activeChild) return null;

  const totals = await listIhsanTotals(madrasah.id);
  const sorted = [...totals].sort((a, b) => b.points - a.points);
  const me = sorted.find((p) => p.id === activeChild.id);
  const rank = me ? sorted.findIndex((p) => p.id === activeChild.id) + 1 : null;

  const categories = ["Hudur", "Ibadah", "Ilm", "Adab", "Khidmah"] as const;
  const categoryLabels: Record<(typeof categories)[number], string> = {
    Hudur: "Ḥuḍūr · Attendance & punctuality",
    Ibadah: "ʿIbādah · Ṣalāh & worship",
    Ilm: "ʿIlm · Learning & memorisation",
    Adab: "Adab · Character & manners",
    Khidmah: "Khidmah · Service to others",
  };

  const feed = [
    ...(me?.manualRows.map((r) => ({ id: r.id, name: r.award.name, points: r.award.points, category: r.award.category, by: r.awardedBy?.name ?? "Office", date: r.awardedAt })) ?? []),
    ...(me?.automatic.map((a) => ({ id: `${a.weekKey}-${a.awardName}`, name: a.awardName, points: a.points, category: "Hudur" as const, by: "Automatic", date: new Date(`${a.weekEndDate}T00:00:00Z`) })) ?? []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{activeChild.name}&apos;s Iḥsān Points</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Iḥsān Points</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Where the points come from</p>
        <div className="flex flex-col divide-y divide-border">
          {categories.map((cat) => {
            const rows = [...(me?.manualRows.filter((r) => r.award.category === cat) ?? [])];
            const automaticRows = cat === "Hudur" ? (me?.automatic ?? []) : [];
            const pts = rows.reduce((s, r) => s + r.award.points, 0) + automaticRows.reduce((s, a) => s + a.points, 0);
            const count = rows.length + automaticRows.length;
            return (
              <div key={cat} className="flex items-center justify-between py-2 text-small">
                <span className="text-[var(--ink)]">{categoryLabels[cat]}</span>
                <span className="text-[var(--ink-2)]">
                  {pts} pts · {count > 0 ? `${count} award${count === 1 ? "" : "s"}` : "None yet"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Recent awards</p>
        {feed.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No points awarded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {feed.slice(0, 15).map((row) => (
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
