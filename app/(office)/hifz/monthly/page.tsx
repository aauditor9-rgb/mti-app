import { HubTabs } from "@/components/office/hub-tabs";
import { todayLondon } from "@/lib/derive/age";
import { HIFZ_PROGRAMME_TABS } from "@/lib/office-hubs";
import { getHifzMonthlyTracker, getMadrasah } from "@/lib/db/queries";

const QUALITY_STYLE: Record<string, string> = {
  Excellent: "bg-[var(--success-bg)] text-[var(--success)]",
  Strong: "bg-[var(--success-bg)] text-[var(--success)]",
  Satisfactory: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Weak: "bg-[var(--alert-bg)] text-[var(--alert)]",
};

export default async function HifzMonthlyTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month = todayLondon().slice(0, 7) } = await searchParams;
  const madrasah = await getMadrasah();
  const tracker = await getHifzMonthlyTracker(madrasah.id, month);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={HIFZ_PROGRAMME_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; Learning · Hifz Programme</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Monthly Tracker</h1>
        <p className="text-small text-[var(--muted)]">A month&apos;s worth of sabaq/sabqī/manzil records and pages progressed, per pupil.</p>
      </div>

      <form className="flex items-center gap-2" action="/hifz/monthly">
        <label className="text-small text-[var(--ink-2)]" htmlFor="month">
          Month
        </label>
        <input id="month" type="month" name="month" defaultValue={month} className="rounded-lg border border-border bg-[var(--surface)] px-2.5 py-1.5 text-body text-[var(--ink)]" />
      </form>

      <div className="flex flex-col gap-4">
        {tracker.map(({ pupil, records, avgScore, pagesThisMonth }) => (
          <div key={pupil.id} className="rounded-xl border border-border bg-[var(--surface)] p-5">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-heading text-h4 font-medium text-[var(--ink)]">{pupil.name}</p>
              <p className="text-small text-[var(--muted)]">
                {pagesThisMonth} pages this month · avg quality {avgScore.toFixed(1)}/4
              </p>
            </div>
            {records.length === 0 ? (
              <p className="text-small text-[var(--muted)]">No records this month.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {records.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2 text-small">
                    <span className="w-20 shrink-0 text-tiny text-[var(--muted)]">{r.date}</span>
                    <span className="flex-1 text-[var(--ink)]">
                      {r.type} · Juz {r.juz}
                      {r.pageFrom && r.pageTo && ` · pg ${r.pageFrom}–${r.pageTo}`}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-tiny font-medium ${QUALITY_STYLE[r.quality]}`}>{r.quality}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
