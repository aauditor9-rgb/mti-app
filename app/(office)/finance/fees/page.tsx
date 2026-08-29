import Link from "next/link";
import { HouseholdFeeCard } from "@/components/office/household-fee-card";
import { getMadrasah, listHouseholdFeeSummaries } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const FILTER_TABS = ["All", "Overdue", "Due", "Settled"] as const;

export default async function FeesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: rawStatus } = await searchParams;
  const status = (FILTER_TABS as readonly string[]).includes(rawStatus ?? "") ? rawStatus! : "All";

  const madrasah = await getMadrasah();
  const households = await listHouseholdFeeSummaries(madrasah.id);

  const totalInvoiced = households.reduce((sum, h) => sum + h.totalInvoiced, 0);
  const totalPaid = households.reduce((sum, h) => sum + h.totalPaid, 0);
  const collectedPct = totalInvoiced === 0 ? 0 : Math.round((totalPaid / totalInvoiced) * 100);
  const overdueCount = households.filter((h) => h.householdStatus === "Overdue").length;
  const dueCount = households.filter((h) => h.householdStatus === "Due").length;
  const settledCount = households.filter((h) => h.householdStatus === "Settled").length;

  const filtered = status === "All" ? households : households.filter((h) => h.householdStatus === status);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Finance</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Fees</h1>
        <p className="text-small text-[var(--muted)]">Money is tracked per family, not per invoice line. Chase what is late, record what comes in.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{collectedPct}%</p>
          <p className="text-small text-[var(--muted)]">Collected</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--success)]">{settledCount}</p>
          <p className="text-small text-[var(--muted)]">Settled</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{dueCount}</p>
          <p className="text-small text-[var(--muted)]">Due</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", overdueCount > 0 ? "text-[var(--alert)]" : "text-[var(--ink)]")}>{overdueCount}</p>
          <p className="text-small text-[var(--muted)]">Overdue</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((f) => (
          <Link
            key={f}
            href={f === "All" ? "/finance/fees" : `/finance/fees?status=${f}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              status === f ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {f}
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
