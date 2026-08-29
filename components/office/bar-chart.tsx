// A minimal CSS bar chart (see components/office/donut-chart.tsx for why this is
// hand-rolled rather than a library). Bars are height-percentage divs, not SVG —
// simpler for a single-series vertical chart with a fixed 0-100 scale.
import { cn } from "@/lib/utils";

export function BarChart({ bars }: { bars: { label: string; value: number; highlight?: boolean }[] }) {
  return (
    <div className="flex h-32 items-end gap-2">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-tiny text-[var(--muted)]">{b.value}%</span>
          <div className="flex h-20 w-full items-end overflow-hidden rounded-t-sm bg-[var(--surface-2)]">
            <div
              className={cn("w-full rounded-t-sm", b.highlight ? "bg-primary" : "bg-[var(--border-2)]")}
              style={{ height: `${Math.max(2, Math.min(100, b.value))}%` }}
            />
          </div>
          <span className={cn("text-tiny", b.highlight ? "font-medium text-[var(--ink)]" : "text-[var(--muted)]")}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}
