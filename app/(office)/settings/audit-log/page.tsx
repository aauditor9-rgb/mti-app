import { HubTabs } from "@/components/office/hub-tabs";
import { SETTINGS_TABS } from "@/lib/office-hubs";

export default function AuditLogPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={SETTINGS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Settings</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Audit Log</h1>
      </div>
      <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        Not built yet — nothing in this app records a who/when trail of changes yet, so there&apos;s no real log to show.
      </p>
    </div>
  );
}
