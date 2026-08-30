import Link from "next/link";
import { AwardPointsForm } from "@/components/office/award-points-form";
import { HubTabs } from "@/components/office/hub-tabs";
import type { IhsanCategory } from "@/lib/derive/ihsan";
import { getMadrasah, listIhsanAwards, listIhsanTotals } from "@/lib/db/queries";
import { IHSAN_CONCERNS_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

export default async function IhsanPage() {
  const madrasah = await getMadrasah();
  const [totals, awards] = await Promise.all([listIhsanTotals(madrasah.id), listIhsanAwards()]);

  const totalPoints = totals.reduce((sum, p) => sum + p.points, 0);
  const leaderboard = [...totals].sort((a, b) => b.points - a.points).slice(0, 10);

  type FeedRow = {
    key: string;
    pupilName: string;
    awardName: string;
    points: number;
    date: string;
    sortKey: string;
    automatic: boolean;
  };
  const feed: FeedRow[] = totals.flatMap((p) => [
    ...p.manualRows.map((r) => ({
      key: r.id,
      pupilName: p.name,
      awardName: r.award.name,
      points: r.award.points,
      date: r.awardedAt.toISOString().slice(0, 10),
      sortKey: r.awardedAt.toISOString(),
      automatic: false,
    })),
    ...p.automatic.map((a) => ({
      key: `${p.id}-${a.weekKey}-${a.awardName}`,
      pupilName: p.name,
      awardName: a.awardName,
      points: a.points,
      date: a.weekEndDate,
      // Anchored to the start of the week-end day so a same-day manual award (which
      // carries a real time-of-day) always sorts above it, as "more recent".
      sortKey: `${a.weekEndDate}T00:00:00.000Z`,
      automatic: true,
    })),
  ]);
  feed.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));

  const manualAwards = awards.filter((a) => !a.automatic);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={IHSAN_CONCERNS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Behaviour &amp; reward</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Iḥsān Points</h1>
        <p className="text-small text-[var(--muted)]">{totalPoints} points awarded.</p>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Top students</p>
        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-small">
            <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
              <tr>
                <th className="px-4 py-2.5">#</th>
                <th className="px-4 py-2.5">Student</th>
                <th className="px-4 py-2.5">Class</th>
                <th className="px-4 py-2.5">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p, i) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 text-[var(--muted)]">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/students/${p.displayId}`} className="font-medium text-[var(--primary)] hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--ink-2)]">{p.class?.name ?? "Unallocated"}</td>
                  <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{p.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Award points</p>
        <AwardPointsForm
          pupils={totals.map((p) => ({ id: p.id, name: p.name, className: p.class?.name ?? null }))}
          awards={manualAwards.map((a) => ({ id: a.id, category: a.category as IhsanCategory, name: a.name, points: a.points }))}
        />
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Recent awards</p>
        {feed.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No points awarded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {feed.slice(0, 20).map((row) => (
              <div key={row.key} className="flex items-center justify-between py-2.5 text-small">
                <div>
                  <span className="font-medium text-[var(--ink)]">{row.pupilName}</span>{" "}
                  <span className="text-[var(--success)]">+{row.points}</span>
                  <p className="text-tiny text-[var(--muted)]">
                    {row.awardName}
                    {row.automatic && (
                      <span
                        className={cn(
                          "ml-1.5 rounded-full px-1.5 py-0.5 text-tiny",
                          "bg-[var(--ihsan-hudur-bg)] text-[var(--ihsan-hudur)]",
                        )}
                      >
                        Automatic
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-tiny text-[var(--muted)]">{row.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
