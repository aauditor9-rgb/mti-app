import { DataImportForm } from "@/components/office/data-import-form";
import { HubTabs } from "@/components/office/hub-tabs";
import { SETTINGS_TABS } from "@/lib/office-hubs";

export default function DataImportPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={SETTINGS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Settings</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Data Import</h1>
        <p className="text-small text-[var(--muted)]">Bulk-add students from a CSV. Each guardian named is matched by email or created new.</p>
      </div>

      <DataImportForm />
    </div>
  );
}
