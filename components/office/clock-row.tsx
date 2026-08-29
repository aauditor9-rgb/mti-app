"use client";

import { useTransition } from "react";
import { clockIn, clockOut } from "@/app/(office)/staff/clock/actions";
import { formatHours } from "@/lib/derive/staff";
import { cn } from "@/lib/utils";

export function ClockRow({
  staffId,
  name,
  role,
  clockedIn,
  clockedInAt,
  todayHours,
  weekHours,
}: {
  staffId: string;
  name: string;
  role: string;
  clockedIn: boolean;
  clockedInAt: string | null;
  todayHours: number;
  weekHours: number;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (clockedIn) await clockOut(staffId);
      else await clockIn(staffId);
    });
  }

  const timeLabel = clockedInAt
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit" }).format(new Date(clockedInAt))
    : null;

  return (
    <div className={cn("flex items-center gap-3 border-t border-border p-3 first:border-t-0", pending && "opacity-70")}>
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium text-[var(--ink)]">{name}</p>
        <p className="text-tiny text-[var(--muted)]">{role}</p>
      </div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-tiny font-medium",
          clockedIn ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
        )}
      >
        {clockedIn ? `In since ${timeLabel}` : "Clocked out"}
      </span>
      <span className="w-20 text-right text-tiny text-[var(--ink-2)]">{formatHours(todayHours)}</span>
      <span className="w-20 text-right text-tiny text-[var(--ink-2)]">{formatHours(weekHours)}</span>
      <button
        onClick={toggle}
        disabled={pending}
        className={cn(
          "rounded-lg px-3 py-1.5 text-small font-medium disabled:opacity-50",
          clockedIn ? "bg-[var(--surface-2)] text-[var(--ink-2)]" : "bg-primary text-primary-foreground",
        )}
      >
        {clockedIn ? "Clock out" : "Clock in"}
      </button>
    </div>
  );
}
