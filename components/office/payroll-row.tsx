"use client";

import { useTransition } from "react";
import { togglePayrollPaid } from "@/app/(office)/staff/payroll/actions";
import { cn } from "@/lib/utils";

export function PayrollRow({
  staffId,
  month,
  name,
  payRate,
  hours,
  paid,
}: {
  staffId: string;
  month: string;
  name: string;
  payRate: string | null;
  hours: string | null;
  paid: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await togglePayrollPaid(staffId, month, !paid);
    });
  }

  return (
    <tr className={cn("border-t border-border", pending && "opacity-70")}>
      <td className="px-4 py-2.5 font-medium text-[var(--ink)]">{name}</td>
      <td className="px-4 py-2.5 text-[var(--ink-2)]">Payroll</td>
      <td className="px-4 py-2.5 text-[var(--ink-2)]">{payRate ?? "—"}</td>
      <td className="px-4 py-2.5 text-[var(--ink-2)]">{hours ?? "—"}</td>
      <td className="px-4 py-2.5">
        <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", paid ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--warn-bg)] text-[var(--ink-2)]")}>
          {paid ? "Paid" : "Unpaid"}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <button onClick={toggle} disabled={pending} className="text-small font-medium text-[var(--primary)] hover:underline disabled:opacity-50">
          {paid ? "Mark unpaid" : "Mark paid"}
        </button>
      </td>
    </tr>
  );
}
