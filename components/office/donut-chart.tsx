// A minimal SVG donut chart — no charting library in this codebase (design/README.md
// "All icons are inline SVG paths (no icon font, no image assets)" extends the same
// spirit to charts). Segment order determines stacking order (largest arc drawn last
// sits on top visually only where segments overlap, which they don't here).
const SIZE = 120;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { value: number; colorVar: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const arcs = segments.reduce<{ length: number; offset: number }[]>((acc, s) => {
    const previousEnd = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0;
    acc.push({ length: (s.value / total) * CIRCUMFERENCE, offset: previousEnd });
    return acc;
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--surface-2)" strokeWidth={STROKE} />
        {segments.map((s, i) => {
          const { length, offset } = arcs[i];
          const dasharray = `${length} ${CIRCUMFERENCE - length}`;
          const dashoffset = -offset;
          if (s.value === 0) return null;
          return (
            <circle
              key={i}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={s.colorVar}
              strokeWidth={STROKE}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-h4 font-medium text-[var(--ink)]">{centerValue}</span>
        <span className="text-tiny text-[var(--muted)]">{centerLabel}</span>
      </div>
    </div>
  );
}
