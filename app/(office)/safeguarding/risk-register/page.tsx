import { AddRiskEntryForm } from "@/components/office/add-risk-entry-form";
import { RiskEntryRow } from "@/components/office/risk-entry-row";
import { HubTabs } from "@/components/office/hub-tabs";
import { getMadrasah, listRiskRegisterEntries, listStaff } from "@/lib/db/queries";
import { SAFEGUARDING_TABS } from "@/lib/office-hubs";

export default async function RiskRegisterPage() {
  const madrasah = await getMadrasah();
  const [entries, staff] = await Promise.all([listRiskRegisterEntries(madrasah.id), listStaff(madrasah.id)]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={SAFEGUARDING_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Safeguarding</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Risk Register</h1>
      </div>

      <AddRiskEntryForm staffOptions={staff.map((s) => ({ id: s.id, name: s.name }))} />

      <div className="flex flex-col gap-2">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No risks logged yet.
          </p>
        ) : (
          entries.map((e) => (
            <RiskEntryRow
              key={e.id}
              id={e.id}
              title={e.title}
              ownerName={e.owner?.name ?? null}
              reviewByDate={e.reviewByDate}
              severity={e.severity}
              status={e.status}
              note={e.note}
            />
          ))
        )}
      </div>
    </div>
  );
}
