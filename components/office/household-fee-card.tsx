"use client";

import { useRef, useState, useTransition } from "react";
import { recordPayment, sendFeeReminder } from "@/app/(office)/finance/fees/actions";
import { cn } from "@/lib/utils";

type Line = { id: string; kind: string; label: string; amount: number; dueDate: string; pupilName: string; status: "Paid" | "Due" | "Overdue" };

const STATUS_STYLE: Record<string, string> = {
  Paid: "bg-[var(--success-bg)] text-[var(--success)]",
  Due: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Overdue: "bg-[var(--alert-bg)] text-[var(--alert)]",
};

const BAR_STYLE: Record<string, string> = {
  Overdue: "bg-[var(--alert)]",
  Due: "bg-[var(--warn-bg)]",
  Settled: "bg-[var(--success)]",
};

export function HouseholdFeeCard({
  householdId,
  guardianName,
  pupilNames,
  householdStatus,
  nextDueDate,
  totalPaid,
  totalInvoiced,
  totalOutstanding,
  lines,
}: {
  householdId: string;
  guardianName: string;
  pupilNames: string[];
  householdStatus: "Overdue" | "Due" | "Settled";
  nextDueDate: string | null;
  totalPaid: number;
  totalInvoiced: number;
  totalOutstanding: number;
  lines: Line[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reminded, setReminded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handlePay(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await recordPayment(formData);
      if (result.ok) {
        formRef.current?.reset();
        setPayOpen(false);
      } else {
        setError(result.message ?? "Could not record the payment.");
      }
    });
  }

  function remind() {
    startTransition(async () => {
      const result = await sendFeeReminder(householdId, totalOutstanding);
      if (result.ok) setReminded(true);
    });
  }

  const paidPct = totalInvoiced === 0 ? 0 : Math.min(100, Math.round((totalPaid / totalInvoiced) * 100));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-48">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--ink)]">{guardianName}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", STATUS_STYLE[householdStatus])}>{householdStatus}</span>
          </div>
          <p className="text-tiny text-[var(--muted)]">
            {pupilNames.join(", ")} · {pupilNames.length === 1 ? "1 child" : `${pupilNames.length} children`}
            {nextDueDate && <> · Next due {nextDueDate}</>}
          </p>
          <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className={cn("h-full rounded-full", BAR_STYLE[householdStatus])} style={{ width: `${paidPct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-medium text-[var(--ink)]">
            £{totalPaid.toFixed(2)} <span className="text-tiny text-[var(--muted)]">of £{totalInvoiced.toFixed(2)}</span>
          </p>
          <button onClick={() => setPayOpen((v) => !v)} className="rounded-lg bg-primary px-3 py-1.5 text-small font-medium text-primary-foreground">
            Record payment
          </button>
          {householdStatus !== "Settled" && (
            <button onClick={remind} disabled={pending || reminded} className="rounded-lg px-3 py-1.5 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)] disabled:opacity-50">
              {reminded ? "Reminder sent" : "Send reminder"}
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="rounded-lg px-3 py-1.5 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
            {expanded ? "Hide invoices" : "View invoices"}
          </button>
        </div>
      </div>

      {payOpen && (
        <form ref={formRef} action={handlePay} className="flex flex-wrap items-end gap-2 border-t border-border bg-[var(--surface-2)] p-3">
          <input type="hidden" name="householdId" value={householdId} />
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Amount (£)</span>
            <input type="number" name="amount" min="0.01" step="0.01" required className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
          </label>
          <label className="flex flex-1 min-w-40 flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Note (optional)</span>
            <input name="note" className="rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
          </label>
          <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-small font-medium text-primary-foreground disabled:opacity-50">
            Save payment
          </button>
          {error && <p className="w-full text-tiny text-[var(--alert)]">{error}</p>}
        </form>
      )}

      {expanded && (
        <table className="w-full border-t border-border text-left text-small">
          <thead className="bg-[var(--surface-2)] text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
            <tr>
              <th className="px-4 py-2">Pupil · charge</th>
              <th className="px-4 py-2">Due</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-2 text-[var(--ink)]">{l.pupilName} · {l.label}</td>
                <td className="px-4 py-2 text-[var(--muted)]">{l.dueDate}</td>
                <td className={cn("px-4 py-2", l.amount < 0 && "text-[var(--success)]")}>£{l.amount.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", STATUS_STYLE[l.status])}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
