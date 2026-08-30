import { HubTabs } from "@/components/office/hub-tabs";
import { expiryStatus } from "@/lib/derive/staff";
import { REPORTS_TABS } from "@/lib/office-hubs";
import { getMadrasah, getStaffReport } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const EXPIRY_STYLE: Record<string, string> = {
  missing: "bg-[var(--surface-2)] text-[var(--muted)]",
  expired: "bg-[var(--alert-bg)] text-[var(--alert)]",
  expiring: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  valid: "bg-[var(--success-bg)] text-[var(--success)]",
};

export default async function StaffReportPage() {
  const madrasah = await getMadrasah();
  const staff = await getStaffReport(madrasah.id);
  const needsAttentionCount = staff.filter((s) => s.needsAttentionFlag).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <HubTabs tabs={REPORTS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Staff Report</h1>
        <p className="text-small text-[var(--muted)]">{needsAttentionCount} of {staff.length} staff need attention on compliance.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-3 border-t border-border p-3 first:border-t-0 text-small">
            <span className="flex-1 text-[var(--ink)]">{s.name}</span>
            {(
              [
                ["DBS", s.dbsExpiry],
                ["First aid", s.firstAidExpiry],
                ["Safeguard.", s.safeguardingExpiry],
              ] as const
            ).map(([label, expiry]) => {
              const status = expiryStatus(expiry);
              return (
                <span key={label} className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", EXPIRY_STYLE[status])}>
                  {label}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
