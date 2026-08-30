import Link from "next/link";
import { SetHomeworkForm } from "@/components/office/set-homework-form";
import { getMadrasah, listClasses, listHomework, listStaff } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const TONE_STYLE = {
  success: "bg-[var(--success)]",
  warn: "bg-[var(--warn-bg)]",
  alert: "bg-[var(--alert)]",
} as const;

export default async function HomeworkPage() {
  const madrasah = await getMadrasah();
  const [items, classes, staff] = await Promise.all([
    listHomework(madrasah.id),
    listClasses(madrasah.id),
    listStaff(madrasah.id),
  ]);

  const classesOut = new Set(items.map((h) => h.classId)).size;
  const avgPct = items.length === 0 ? 0 : Math.round(items.reduce((sum, h) => sum + h.progress.donePct, 0) / items.length);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Homework</h1>
        <p className="text-small text-[var(--muted)]">
          Set for a class, pupils see it on their weekly plan, and completion is tracked per pupil here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{items.length}</p>
          <p className="text-small text-[var(--muted)]">Homework set</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{classesOut}</p>
          <p className="text-small text-[var(--muted)]">Classes with homework out</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{avgPct}%</p>
          <p className="text-small text-[var(--muted)]">Average completion</p>
        </div>
      </div>

      <SetHomeworkForm
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
      />

      {items.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No homework set yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((h) => (
            <Link
              key={h.id}
              href={`/homework/${h.id}`}
              className="rounded-xl border border-border bg-[var(--surface)] p-4 transition-colors hover:border-primary"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--ink)]">
                    {h.subject} · {h.class?.name ?? "Unknown class"}
                  </p>
                  <p className="text-small text-[var(--ink-2)]">{h.task}</p>
                </div>
                <span className="text-tiny text-[var(--muted)]">Due {h.dueDate}</span>
              </div>

              <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className={cn("h-full rounded-full", TONE_STYLE[h.progress.tone])}
                  style={{ width: `${h.progress.donePct}%` }}
                />
              </div>
              <p className="mt-1 text-tiny text-[var(--muted)]">
                {h.progress.label}
                {h.progress.totalCount > 0 && ` · ${h.progress.doneCount}/${h.progress.totalCount}`}
                {h.setBy && ` · set by ${h.setBy.name}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
