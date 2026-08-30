import { BrandingForm } from "@/components/office/branding-form";
import { HubTabs } from "@/components/office/hub-tabs";
import { SETTINGS_TABS } from "@/lib/office-hubs";
import { getMadrasah } from "@/lib/db/queries";

export default async function BrandingPage() {
  const madrasah = await getMadrasah();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={SETTINGS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Settings</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Branding</h1>
        <p className="text-small text-[var(--muted)]">Stored against your madrasah record — not yet wired into the app&apos;s own theme.</p>
      </div>

      <BrandingForm name={madrasah.name} brandAccent={madrasah.brandAccent} />
    </div>
  );
}
