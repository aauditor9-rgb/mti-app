import { HifzRecordForm } from "@/components/teacher/hifz-record-form";
import { HubTabs } from "@/components/office/hub-tabs";
import { computeHifzSummary } from "@/lib/derive/hifz";
import { recordHifzOffice } from "./actions";
import { HIFZ_PROGRAMME_TABS } from "@/lib/office-hubs";
import { getHifzRosterMadrasah, getMadrasah } from "@/lib/db/queries";

export default async function HifzRosterPage() {
  const madrasah = await getMadrasah();
  const roster = await getHifzRosterMadrasah(madrasah.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <HubTabs tabs={HIFZ_PROGRAMME_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; Learning · Hifz Programme</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Hifz Roster</h1>
        <p className="text-small text-[var(--muted)]">Every ḥāfiẓ-in-training at a glance.</p>
      </div>

      <HifzRecordForm pupils={roster.map((r) => ({ id: r.pupil.id, name: r.pupil.name }))} action={recordHifzOffice} />
      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        <div className="flex items-center gap-3 bg-[var(--surface-2)] p-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
          <span className="flex-1">Student</span>
          <span className="w-20 text-right">Juz</span>
          <span className="w-28 text-right">Pages</span>
          <span className="w-24 text-right">Streak</span>
        </div>
        {roster.map(({ pupil, records }) => {
          const summary = computeHifzSummary(records);
          return (
            <div key={pupil.id} className="flex items-center gap-3 border-t border-border p-3 text-small">
              <span className="flex-1 text-[var(--ink)]">
                {pupil.name} <span className="text-tiny text-[var(--muted)]">· {pupil.class?.name}</span>
              </span>
              <span className="w-20 text-right text-[var(--ink-2)]">{summary.currentJuz ?? "—"}</span>
              <span className="w-28 text-right text-[var(--ink-2)]">{summary.pagesMemorised}</span>
              <span className="w-24 text-right text-[var(--ink-2)]">{summary.streakDays}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
