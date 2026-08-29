"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toggleStaffAck } from "@/app/(office)/safeguarding/policies/actions";
import { cn } from "@/lib/utils";

type Ack = { id: string; staffName: string; acknowledgedAt: Date | null };

export function PolicyCard({
  title,
  version,
  reviewByDate,
  ackedCount,
  totalStaff,
  acks,
}: {
  title: string;
  version: string;
  reviewByDate: string | null;
  ackedCount: number;
  totalStaff: number;
  acks: Ack[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const complete = totalStaff > 0 && ackedCount === totalStaff;

  function toggle(id: string, value: boolean) {
    startTransition(async () => {
      await toggleStaffAck(id, value);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface)]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-[var(--surface-2)]">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-tiny font-medium text-primary-foreground">
            {title
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          {open ? <ChevronDown className="mt-1 size-4 shrink-0 text-[var(--muted)]" /> : <ChevronRight className="mt-1 size-4 shrink-0 text-[var(--muted)]" />}
          <div>
            <p className="font-medium text-[var(--ink)]">{title}</p>
            <p className="text-tiny text-[var(--muted)]">
              {version}
              {reviewByDate && <> · Review {reviewByDate}</>}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-tiny font-medium",
            complete ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--warn-bg)] text-[var(--ink-2)]",
          )}
        >
          {ackedCount} of {totalStaff} acknowledged
        </span>
      </button>

      {open && (
        <div className={cn("border-t border-border", pending && "opacity-70")}>
          {acks.length === 0 ? (
            <p className="p-3 text-small text-[var(--muted)]">No staff to acknowledge this policy.</p>
          ) : (
            acks.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-3 border-t border-border p-3 first:border-t-0 hover:bg-[var(--surface-2)]">
                <input
                  type="checkbox"
                  checked={!!a.acknowledgedAt}
                  disabled={pending}
                  onChange={(e) => toggle(a.id, e.target.checked)}
                  className="size-4"
                />
                <span className="flex-1 text-small font-medium text-[var(--ink)]">{a.staffName}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", a.acknowledgedAt ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]")}>
                  {a.acknowledgedAt ? "Acknowledged" : "Pending"}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
