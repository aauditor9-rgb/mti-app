import Link from "next/link";
import { AddTaskForm } from "@/components/office/add-task-form";
import { TaskRow } from "@/components/office/task-row";
import { getMadrasah, listStaff, listTasks } from "@/lib/db/queries";
import { todayLondon } from "@/lib/derive/age";
import { cn } from "@/lib/utils";

const GENERIC_ASSIGNEES = ["Office", "Headteacher"];
const FILTER_TABS = ["Open", "Overdue", "Completed", "All"] as const;

function buildHref(filter: string) {
  return filter === "Open" ? "/tasks" : `/tasks?filter=${filter}`;
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter: rawFilter } = await searchParams;
  const filter = (FILTER_TABS as readonly string[]).includes(rawFilter ?? "") ? rawFilter! : "Open";

  const madrasah = await getMadrasah();
  const [tasks, staff] = await Promise.all([listTasks(madrasah.id), listStaff(madrasah.id)]);
  const assigneeOptions = [...GENERIC_ASSIGNEES, ...staff.map((s) => s.name)];

  const openCount = tasks.filter((t) => t.status === "Open").length;
  const overdueCount = tasks.filter((t) => t.status === "Overdue").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const dueIn7Count = tasks.filter((t) => {
    if (t.status !== "Open") return false;
    const days = (new Date(t.dueDate).getTime() - new Date(todayLondon()).getTime()) / 86400000;
    return days >= 0 && days <= 7;
  }).length;

  const filtered = tasks.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Overdue") return t.status === "Overdue";
    if (filter === "Completed") return t.status === "Completed";
    return t.status === "Open" || t.status === "Overdue";
  });

  const workload = new Map<string, { open: number; done: number }>();
  for (const t of tasks) {
    const entry = workload.get(t.assignedTo) ?? { open: 0, done: 0 };
    if (t.status === "Completed") entry.done += 1;
    else entry.open += 1;
    workload.set(t.assignedTo, entry);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Overview</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Tasks</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{openCount}</p>
          <p className="text-small text-[var(--muted)]">Open</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", overdueCount > 0 ? "text-[var(--alert)]" : "text-[var(--ink)]")}>
            {overdueCount}
          </p>
          <p className="text-small text-[var(--muted)]">Overdue</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{dueIn7Count}</p>
          <p className="text-small text-[var(--muted)]">Due in 7 days</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{completedCount}</p>
          <p className="text-small text-[var(--muted)]">Completed</p>
        </div>
      </div>

      <AddTaskForm assigneeOptions={assigneeOptions} />

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((f) => (
          <Link
            key={f}
            href={buildHref(f)}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              filter === f ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No tasks in this view.</p>
        ) : (
          filtered.map((t) => (
            <TaskRow
              key={t.id}
              id={t.id}
              title={t.title}
              assignedTo={t.assignedTo}
              category={t.category}
              priority={t.priority}
              dueDate={t.dueDate}
              status={t.status}
            />
          ))
        )}
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Workload by person</p>
        {workload.size === 0 ? (
          <p className="text-small text-[var(--muted)]">No tasks assigned yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...workload.entries()].map(([name, { open, done }]) => (
              <div key={name} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3">
                <span className="text-small font-medium text-[var(--ink)]">{name}</span>
                <span className="text-tiny text-[var(--muted)]">
                  {open} open · {done} done
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
