import Link from "next/link";
import { DonutChart } from "@/components/office/donut-chart";
import { HouseholdFeeCard } from "@/components/office/household-fee-card";
import { HubTabs } from "@/components/office/hub-tabs";
import { getMadrasah, listHouseholdFeeSummaries } from "@/lib/db/queries";
import { FINANCE_TABS } from "@/lib/office-hubs";
import { cn } from "@/lib/utils";

const FILTER_TABS = ["All", "Overdue", "Due", "Settled"] as const;

function buildHref(status: string, klass: string) {
  const params = new URLSearchParams();
  if (status !== "All") params.set("status", status);
  if (klass !== "All") params.set("class", klass);
  const qs = params.toString();
  return qs ? `/finance/fees?${qs}` : "/finance/fees";
}

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; class?: string }>;
}) {
  const { status: rawStatus, class: rawClass = "All" } = await searchParams;
  const status = (FILTER_TABS as readonly string[]).includes(rawStatus ?? "") ? rawStatus! : "All";

  const madrasah = await getMadrasah();
  const households = await listHouseholdFeeSummaries(madrasah.id);

  const totalInvoiced = households.reduce((sum, h) => sum + h.totalInvoiced, 0);
  const totalPaid = households.reduce((sum, h) => sum + h.totalPaid, 0);
  const collectedPct = totalInvoiced === 0 ? 0 : Math.round((totalPaid / totalInvoiced) * 100);
  const overdueCount = households.filter((h) => h.householdStatus === "Overdue").length;
  const dueCount = households.filter((h) => h.householdStatus === "Due").length;
  const settledCount = households.filter((h) => h.householdStatus === "Settled").length;

  const classNames = [...new Set(households.flatMap((h) => h.pupils.map((p) => p.className).filter((c): c is string => !!c)))].sort();

  let filtered = status === "All" ? households : households.filter((h) => h.householdStatus === status);
  if (rawClass !== "All") filtered = filtered.filter((h) => h.pupils.some((p) => p.className === rawClass));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <HubTabs tabs={FINANCE_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Finance</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Fees</h1>
        <p className="text-small text-[var(--muted)]">Money is tracked per family, not per invoice line. Chase what is late, record what comes in.</p>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Fee collection</p>
        <div className="flex flex-wrap items-center gap-6">
          <DonutChart
            centerValue={`${collectedPct}%`}
            centerLabel="collected"
            segments={[
              { value: settledCount, colorVar: "var(--success)" },
              { value: dueCount, colorVar: "var(--warn-bg)" },
              { value: overdueCount, colorVar: "var(--alert)" },
            ]}
          />
          <div className="flex flex-col gap-1.5 text-small">
            <p className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[var(--success)]" /> Paid <span className="font-medium text-[var(--ink)]">{settledCount}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[var(--warn-bg)]" /> Due <span className="font-medium text-[var(--ink)]">{dueCount}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[var(--alert)]" /> Overdue <span className="font-medium text-[var(--ink)]">{overdueCount}</span>
            </p>
          </div>
        </div>
      </div>

      {classNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildHref(status, "All")}
            className={cn("rounded-full px-3 py-1 text-small font-medium", rawClass === "All" ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border")}
          >
            All classes
          </Link>
          {classNames.map((c) => (
            <Link
              key={c}
              href={buildHref(status, c)}
              className={cn("rounded-full px-3 py-1 text-small font-medium", rawClass === c ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border")}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((f) => (
          <Link
            key={f}
            href={buildHref(f, rawClass)}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              status === f ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {f} ({f === "All" ? households.length : f === "Overdue" ? overdueCount : f === "Due" ? dueCount : settledCount})
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No families match this filter.
          </p>
        ) : (
          filtered.map((h) => (
            <HouseholdFeeCard
              key={h.householdId}
              householdId={h.householdId}
              guardianName={h.guardianName}
              pupilNames={h.pupils.map((p) => p.name)}
              householdStatus={h.householdStatus}
              nextDueDate={h.nextDueDate}
              totalPaid={h.totalPaid}
              totalInvoiced={h.totalInvoiced}
              totalOutstanding={h.totalOutstanding}
              lines={h.lines}
            />
          ))
        )}
      </div>
    </div>
  );
}
