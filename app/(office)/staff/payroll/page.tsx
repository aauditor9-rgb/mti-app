import Link from "next/link";
import { PayrollRow } from "@/components/office/payroll-row";
import { todayLondon } from "@/lib/derive/age";
import { getMadrasah, listPayrollForMonth } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function PayrollPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const currentMonth = todayLondon().slice(0, 7);
  const { month = currentMonth } = await searchParams;

  const madrasah = await getMadrasah();
  const rows = await listPayrollForMonth(madrasah.id, month);
  const paidCount = rows.filter((r) => r.paid).length;

  const months = [shiftMonth(currentMonth, -2), shiftMonth(currentMonth, -1), currentMonth, shiftMonth(currentMonth, 1)];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">People · Staff</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Payroll — {monthLabel(month)}</h1>
        <p className="text-small text-[var(--muted)]">
          {paidCount} of {rows.length} paid
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {months.map((m) => (
          <Link
            key={m}
            href={`/staff/payroll?month=${m}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              m === month ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {monthLabel(m)}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        <table className="w-full text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-2.5">Teacher</th>
              <th className="px-4 py-2.5">Pay type</th>
              <th className="px-4 py-2.5">Rate</th>
              <th className="px-4 py-2.5">Hours</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                  No staff on file.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <PayrollRow
                  key={r.staff.id}
                  staffId={r.staff.id}
                  month={month}
                  name={r.staff.name}
                  payRate={r.staff.payRate}
                  hours={r.staff.hours}
                  paid={r.paid}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
