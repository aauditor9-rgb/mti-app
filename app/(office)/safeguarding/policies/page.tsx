import { PolicyCard } from "@/components/office/policy-card";
import { HubTabs } from "@/components/office/hub-tabs";
import { expiryStatus } from "@/lib/derive/staff";
import { getMadrasah, listPolicies } from "@/lib/db/queries";
import { SAFEGUARDING_TABS } from "@/lib/office-hubs";

export default async function PoliciesPage() {
  const madrasah = await getMadrasah();
  const policies = await listPolicies(madrasah.id);

  const staffCompleteCount = policies.filter((p) => p.totalStaff > 0 && p.ackedCount === p.totalStaff).length;
  const totalAcks = policies.reduce((sum, p) => sum + p.ackedCount, 0);
  const totalOutstanding = policies.reduce((sum, p) => sum + (p.totalStaff - p.ackedCount), 0);
  const reviewsDueSoon = policies.filter((p) => {
    const s = expiryStatus(p.reviewByDate);
    return s === "expiring" || s === "expired";
  }).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={SAFEGUARDING_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Safeguarding</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Policy Acknowledgements</h1>
        <p className="text-small text-[var(--muted)]">
          Every published policy and who has acknowledged it. Full legal text isn&apos;t reproduced here — only title,
          version and review date.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{policies.length}</p>
          <p className="text-small text-[var(--muted)]">Policies published</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--success)]">{staffCompleteCount}</p>
          <p className="text-small text-[var(--muted)]">Fully acknowledged</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{totalOutstanding}</p>
          <p className="text-small text-[var(--muted)]">Staff acks outstanding ({totalAcks} done)</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={reviewsDueSoon > 0 ? "font-heading text-h3 font-medium text-[var(--alert)]" : "font-heading text-h3 font-medium text-[var(--ink)]"}>
            {reviewsDueSoon}
          </p>
          <p className="text-small text-[var(--muted)]">Reviews due soon</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {policies.map((p) => (
          <PolicyCard
            key={p.id}
            title={p.title}
            version={p.version}
            reviewByDate={p.reviewByDate}
            ackedCount={p.ackedCount}
            totalStaff={p.totalStaff}
            acks={p.acks.map((a) => ({ id: a.id, staffName: a.staff.name, acknowledgedAt: a.acknowledgedAt }))}
          />
        ))}
      </div>
    </div>
  );
}
