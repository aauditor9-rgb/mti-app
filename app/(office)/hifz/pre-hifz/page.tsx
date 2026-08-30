import { HubTabs } from "@/components/office/hub-tabs";
import { PreHifzGateRow } from "@/components/office/pre-hifz-gate-row";
import { HIFZ_PROGRAMME_TABS } from "@/lib/office-hubs";
import { getMadrasah, listPreHifzAssessments } from "@/lib/db/queries";

export default async function PreHifzPage() {
  const madrasah = await getMadrasah();
  const rows = await listPreHifzAssessments(madrasah.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={HIFZ_PROGRAMME_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; Learning · Hifz Programme</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Pre-Hifz &amp; Consolidation</h1>
        <p className="text-small text-[var(--muted)]">Gates a pupil clears before moving from Pre-Hifdh into full Hifz.</p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No Pre-Hifdh pupils on roll.
          </p>
        ) : (
          rows.map(({ pupil, assessment }) => <PreHifzGateRow key={pupil.id} pupilId={pupil.id} pupilName={pupil.name} assessment={assessment} />)
        )}
      </div>
    </div>
  );
}
