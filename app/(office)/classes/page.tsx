import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getMadrasah, listClasses } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string }>;
}) {
  const { gender = "all" } = await searchParams;
  const madrasah = await getMadrasah();
  const classes = await listClasses(madrasah.id);

  const totalStudents = classes.reduce((sum, c) => sum + c.pupils.length, 0);
  const avgClassSize = classes.length ? Math.round((totalStudents / classes.length) * 10) / 10 : 0;

  const filtered = gender === "all" ? classes : classes.filter((c) => c.gender === gender);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Students</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Classes &amp; Allocation</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{classes.length}</p>
          <p className="text-small text-[var(--muted)]">Classes running</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{totalStudents}</p>
          <p className="text-small text-[var(--muted)]">Students allocated</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{avgClassSize}</p>
          <p className="text-small text-[var(--muted)]">Avg. class size</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "All classes" },
          { key: "Boys", label: "Boys" },
          { key: "Girls", label: "Girls" },
        ].map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/classes" : `/classes?gender=${f.key}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              gender === f.key
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/classes/${c.id}`}
            className="rounded-xl border border-border bg-[var(--surface)] p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-small font-medium text-primary-foreground">
                  {initials(c.name)}
                </div>
                <div>
                  <p className="font-medium text-[var(--ink)]">{c.name}</p>
                  <Badge variant="secondary">{c.gender}</Badge>
                </div>
              </div>
            </div>
            <p className="mt-3 text-small text-[var(--ink-2)]">
              {c.leadTeacher?.name ?? "Unassigned"} · {c.timing}
            </p>
            <p className="mt-2 inline-block rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-tiny font-medium text-[var(--ink-2)]">
              {c.pupils.length} student{c.pupils.length === 1 ? "" : "s"}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.lessons.map((lesson) => (
                <span
                  key={lesson}
                  className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-tiny text-[var(--ink-2)]"
                >
                  {lesson}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
