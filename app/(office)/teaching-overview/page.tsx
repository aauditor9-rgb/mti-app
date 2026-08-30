import { getMadrasah, getTeachingOverview } from "@/lib/db/queries";

export default async function TeachingOverviewPage() {
  const madrasah = await getMadrasah();
  const overview = await getTeachingOverview(madrasah.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; Learning</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Teaching Overview</h1>
        <p className="text-small text-[var(--muted)]">
          What was taught, what was memorised and what still needs a second pass — across every class.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">
            {overview.plansSubmitted}/{overview.totalYearBands}
          </p>
          <p className="text-small text-[var(--muted)]">This week&apos;s plans submitted</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{overview.classesWithHomework}</p>
          <p className="text-small text-[var(--muted)]">Classes with work out</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{overview.hifzLoggedToday}</p>
          <p className="text-small text-[var(--muted)]">Sabaq/Sabqi/Manzil logged today</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{overview.reportsDue}</p>
          <p className="text-small text-[var(--muted)]">Reports still in draft{overview.currentTermName && ` · ${overview.currentTermName}`}</p>
        </div>
      </div>
    </div>
  );
}
