import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { AddStaffForm } from "@/components/office/add-staff-form";
import { HubTabs } from "@/components/office/hub-tabs";
import { expiryStatus, needsAttention } from "@/lib/derive/staff";
import { getMadrasah, listStaffDirectory } from "@/lib/db/queries";
import { STAFF_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

const FILTER_TABS = ["All", "Needs attention", "Fully compliant"] as const;

const EXPIRY_STYLE: Record<string, string> = {
  missing: "bg-[var(--surface-2)] text-[var(--muted)]",
  expired: "bg-[var(--alert-bg)] text-[var(--alert)]",
  expiring: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  valid: "bg-[var(--success-bg)] text-[var(--success)]",
};

function buildHref(filter: string, q: string) {
  const params = new URLSearchParams();
  if (filter !== "All") params.set("filter", filter);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/staff/directory?${qs}` : "/staff/directory";
}

export default async function TeacherDatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter: rawFilter, q = "" } = await searchParams;
  const filter = (FILTER_TABS as readonly string[]).includes(rawFilter ?? "") ? rawFilter! : "All";

  const madrasah = await getMadrasah();
  const allStaff = await listStaffDirectory(madrasah.id);

  const withCompliance = allStaff.map((s) => ({ ...s, needsAttention: needsAttention(s) }));
  const needsAttentionCount = withCompliance.filter((s) => s.needsAttention).length;
  const compliantCount = withCompliance.length - needsAttentionCount;

  let filtered = withCompliance;
  if (filter === "Needs attention") filtered = filtered.filter((s) => s.needsAttention);
  if (filter === "Fully compliant") filtered = filtered.filter((s) => !s.needsAttention);
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(needle));
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={STAFF_TABS} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">People · Staff</p>
          <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Teacher Database</h1>
        </div>
        <AddStaffForm />
      </div>

      <form className="flex items-center gap-2" action="/staff/directory">
        {filter !== "All" && <input type="hidden" name="filter" value={filter} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search teachers…"
          className="max-w-sm rounded-lg border border-border bg-[var(--surface)] px-2.5 py-1.5 text-small"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((f) => (
          <Link
            key={f}
            href={buildHref(f, q)}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              filter === f ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {f} ({f === "All" ? withCompliance.length : f === "Needs attention" ? needsAttentionCount : compliantCount})
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)] sm:col-span-2">
            No staff match this view.
          </p>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-[var(--surface)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-small font-medium text-primary-foreground">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--ink)]">{s.name}</p>
                  <p className="text-tiny text-[var(--muted)]">
                    {s.title ?? s.role}
                    {s.hours && ` · ${s.hours}`}
                    {s.payRate && ` · ${s.payRate}`}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-0.5 text-small text-[var(--ink-2)]">
                {s.email && (
                  <p className="flex items-center gap-1">
                    <Mail className="size-3" aria-hidden="true" />
                    {s.email}
                  </p>
                )}
                {s.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="size-3" aria-hidden="true" />
                    {s.phone}
                  </p>
                )}
                <p>
                  Portal access:{" "}
                  <span className={cn("font-medium", s.portalAccess ? "text-[var(--success)]" : "text-[var(--muted)]")}>
                    {s.portalAccess ? "Enabled" : "Disabled"}
                  </span>
                </p>
              </div>

              {s.classesLed.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.classesLed.map((c) => (
                    <span key={c.id} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-tiny text-[var(--ink-2)]">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-tiny">
                {(
                  [
                    ["DBS", s.dbsExpiry],
                    ["First aid", s.firstAidExpiry],
                    ["Safeguard.", s.safeguardingExpiry],
                  ] as const
                ).map(([label, expiry]) => {
                  const status = expiryStatus(expiry);
                  return (
                    <div key={label}>
                      <p className="text-[var(--muted)]">{label}</p>
                      <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 font-medium", EXPIRY_STYLE[status])}>
                        {expiry ? `Valid to ${expiry}` : "Not on file"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
