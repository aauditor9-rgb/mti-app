import Link from "next/link";
import { cn } from "@/lib/utils";
import { getClass, getCurrentStaff, getMadrasah, getTeacherClasses } from "@/lib/db/queries";

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const activeClassRow = classes.find((c) => c.id === classId) ?? classes[0];
  const activeClass = activeClassRow ? await getClass(madrasah.id, activeClassRow.id) : null;

  if (!activeClass) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        You aren&apos;t set as the lead teacher of any class yet.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">My Class</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">My Students</h1>
        <p className="text-small text-[var(--muted)]">
          {activeClass.pupils.length} children in {activeClass.name} — tap a child for their record.
        </p>
      </div>

      {classes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/students?classId=${c.id}`}
              className={cn(
                "rounded-full px-3 py-1 text-small font-medium",
                c.id === activeClass.id ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {activeClass.pupils.map((p) => {
          const primaryGuardian = p.household?.guardians[0] ?? null;
          return (
            <Link
              key={p.id}
              href={`/students/${p.displayId}`}
              className="flex items-center gap-3 border-t border-border p-3 first:border-t-0 hover:bg-[var(--surface-2)]"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-tiny font-medium text-primary-foreground">
                {p.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-small font-medium text-[var(--ink)]">{p.name}</p>
                <p className="text-tiny text-[var(--muted)]">
                  {primaryGuardian?.name ?? "No guardian on record"}
                  {primaryGuardian?.phone && ` · ${primaryGuardian.phone}`}
                </p>
                {p.learningNotes && <p className="mt-0.5 text-tiny text-[var(--ink-2)]">{p.learningNotes}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
