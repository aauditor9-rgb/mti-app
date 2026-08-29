import type { MonthCell } from "@/lib/derive/calendar-grid";
import { cn } from "@/lib/utils";

const WEEKDAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

const DAY_TYPE_STYLE: Record<string, string> = {
  class: "bg-[var(--surface-2)] text-[var(--ink)]",
  holiday: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  nonteaching: "bg-transparent text-[var(--muted-2)]",
  outside: "bg-transparent text-[var(--muted-2)]",
};

export function MonthGrid({ label, cells }: { label: string; cells: MonthCell[] }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--surface)] p-3">
      <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{label}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-tiny">
        {WEEKDAY_HEADERS.map((h, i) => (
          <span key={i} className="text-[var(--muted-2)]">
            {h}
          </span>
        ))}
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-sm",
              cell.date ? DAY_TYPE_STYLE[cell.dayType!] : "",
            )}
          >
            {cell.date && cell.date.slice(-2).replace(/^0/, "")}
            {cell.hasEvent && <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />}
          </div>
        ))}
      </div>
    </div>
  );
}
