import { HubTabs } from "@/components/office/hub-tabs";
import { REPORTS_TABS } from "@/lib/office-hubs";
import { getBehaviourReport, getMadrasah } from "@/lib/db/queries";

export default async function BehaviourReportPage() {
  const madrasah = await getMadrasah();
  const report = await getBehaviourReport(madrasah.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={REPORTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Behaviour Report</h1>
        <p className="text-small text-[var(--muted)]">{report.total} concerns logged · {report.open} still open.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{report.bySeverity.Low}</p>
          <p className="text-small text-[var(--muted)]">Low</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{report.bySeverity.Medium}</p>
          <p className="text-small text-[var(--muted)]">Medium</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{report.bySeverity.High}</p>
          <p className="text-small text-[var(--muted)]">High</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">By category</p>
        {report.byCategory.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No concerns logged yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {report.byCategory.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between py-2 text-small">
                <span className="text-[var(--ink)]">{category}</span>
                <span className="font-medium text-[var(--ink)]">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
