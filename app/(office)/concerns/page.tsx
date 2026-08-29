import Link from "next/link";
import { ConcernCard, type ConcernCardData } from "@/components/office/concern-card";
import { LogConcernForm } from "@/components/office/log-concern-form";
import { CONCERN_STATUSES } from "@/lib/derive/concern";
import { getMadrasah, listConcerns, listPupils, listStaff } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const qs = search.toString();
  return qs ? `/concerns?${qs}` : "/concerns";
}

export default async function ConcernsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; class?: string }>;
}) {
  const { status = "all", class: classFilter = "all" } = await searchParams;

  const madrasah = await getMadrasah();
  const [concerns, staff, pupils] = await Promise.all([
    listConcerns(madrasah.id),
    listStaff(madrasah.id),
    listPupils(madrasah.id),
  ]);

  const openCount = concerns.filter((c) => c.status === "Open").length;
  const classNames = [...new Set(concerns.map((c) => c.class?.name).filter((n): n is string => !!n))].sort();

  const repeatOffenders = Object.entries(
    concerns.reduce<Record<string, { name: string; count: number }>>((acc, c) => {
      if (!c.pupil) return acc;
      acc[c.pupil.id] ??= { name: c.pupil.name, count: 0 };
      acc[c.pupil.id].count += 1;
      return acc;
    }, {}),
  )
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count);

  let filtered = concerns;
  if (status !== "all") filtered = filtered.filter((c) => c.status === status);
  if (classFilter !== "all") filtered = filtered.filter((c) => c.class?.name === classFilter);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Tarbiyah</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Concerns</h1>
        <p className="text-small text-[var(--muted)]">
          Every concern has a severity, an owner and a next step. Recognition lives in Iḥsān Points.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{openCount}</p>
          <p className="text-small text-[var(--muted)]">Open, awaiting action</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{concerns.length}</p>
          <p className="text-small text-[var(--muted)]">Concerns logged</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{repeatOffenders.length}</p>
          <p className="text-small text-[var(--muted)]">Students with repeat concerns</p>
        </div>
      </div>

      {repeatOffenders.length > 0 && (
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Repeat concerns</p>
          <div className="flex flex-wrap gap-2">
            {repeatOffenders.map(([pupilId, v]) => (
              <span key={pupilId} className="rounded-full bg-[var(--warn-bg)] px-3 py-1 text-small text-[var(--ink-2)]">
                {v.name} · {v.count} concerns
              </span>
            ))}
          </div>
        </div>
      )}

      <LogConcernForm
        pupils={pupils.map((p) => ({ id: p.id, name: p.name, className: p.class?.name ?? null }))}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ class: classFilter === "all" ? undefined : classFilter })}
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            status === "all"
              ? "bg-[var(--ink)] text-[var(--surface)]"
              : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
          )}
        >
          All ({concerns.length})
        </Link>
        {CONCERN_STATUSES.map((s) => {
          const count = concerns.filter((c) => c.status === s).length;
          return (
            <Link
              key={s}
              href={buildHref({ status: s, class: classFilter === "all" ? undefined : classFilter })}
              className={cn(
                "rounded-full px-3 py-1 text-small font-medium",
                status === s
                  ? "bg-[var(--ink)] text-[var(--surface)]"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
              )}
            >
              {s} ({count})
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ status: status === "all" ? undefined : status })}
          className={cn(
            "rounded-full px-3 py-1 text-small font-medium",
            classFilter === "all" ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
          )}
        >
          All classes
        </Link>
        {classNames.map((name) => (
          <Link
            key={name}
            href={buildHref({ status: status === "all" ? undefined : status, class: name })}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              classFilter === name ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {name}
          </Link>
        ))}
      </div>

      <p className="text-small text-[var(--muted)]">{filtered.length} concerns</p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No concerns match this filter.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => {
            const data: ConcernCardData = {
              id: c.id,
              category: c.category,
              note: c.note,
              severity: c.severity,
              status: c.status,
              safeguardingNotified: c.safeguardingNotified,
              safeguardingNotifiedAt: c.safeguardingNotifiedAt ? c.safeguardingNotifiedAt.toISOString() : null,
              parentInformedAt: c.parentInformedAt ? c.parentInformedAt.toISOString() : null,
              createdAt: c.createdAt.toISOString(),
              pupil: c.pupil ? { displayId: c.pupil.displayId, name: c.pupil.name } : null,
              className: c.class?.name ?? null,
              ownerStaffId: c.ownerStaffId,
              raisedByName: c.raisedBy?.name ?? null,
            };
            return <ConcernCard key={c.id} concern={data} staff={staff.map((s) => ({ id: s.id, name: s.name }))} />;
          })}
        </div>
      )}
    </div>
  );
}
