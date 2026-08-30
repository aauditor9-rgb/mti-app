import { HubTabs } from "@/components/office/hub-tabs";
import { SETTINGS_TABS } from "@/lib/office-hubs";

export default function PermissionsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={SETTINGS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Settings</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Permissions</h1>
      </div>
      <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        Not built yet — there&apos;s no real authentication or role system behind this app yet (see the Teacher/Parent
        portals&apos; provisional sign-in), so a permission matrix would have nothing real to control.
      </p>
    </div>
  );
}
