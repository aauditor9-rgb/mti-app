import { HubTabs } from "@/components/office/hub-tabs";
import { STUDENTS_TABS } from "@/lib/office-hubs";
import { getMadrasah, listEmergencyContacts } from "@/lib/db/queries";

const RELATION_LABEL: Record<string, string> = {
  Father: "FATHER",
  Mother: "MOTHER",
  Guardian: "GUARDIAN",
  "Emergency contact": "EMERGENCY CONTACT",
  Other: "OTHER",
};

export default async function ContactSheetPage() {
  const madrasah = await getMadrasah();
  const { rows, fatherCount, motherCount, totalGuardians } = await listEmergencyContacts(madrasah.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={STUDENTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">People · Students</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Emergency Contacts</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{fatherCount}</p>
          <p className="text-small text-[var(--muted)]">Fathers on file</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{motherCount}</p>
          <p className="text-small text-[var(--muted)]">Mothers on file</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{totalGuardians}</p>
          <p className="text-small text-[var(--muted)]">Total guardians</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {rows.map(({ guardian, pupil }) => (
          <div key={`${guardian.id}-${pupil.id}`} className="flex items-center gap-3 border-t border-border p-3 first:border-t-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-tiny font-medium text-primary-foreground">
              {guardian.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-small font-medium text-[var(--ink)]">{guardian.name}</p>
              <p className="text-tiny text-[var(--muted)]">
                {RELATION_LABEL[guardian.relation] ?? guardian.relation} · {pupil.name} · {pupil.class?.name ?? "Unallocated"}
              </p>
            </div>
            <div className="shrink-0 text-right text-tiny text-[var(--ink-2)]">
              {guardian.phone && <p>☎ {guardian.phone}</p>}
              {guardian.email && <p>{guardian.email}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
