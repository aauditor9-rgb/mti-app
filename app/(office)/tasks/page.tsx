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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Open</p>
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{openCount}</p>
          <p className="text-tiny text-[var(--muted)]">{openCount === 1 ? "task to do" : "tasks to do"}</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Overdue</p>
          <p className={cn("font-heading text-h3 font-medium", overdueCount > 0 ? "text-[var(--alert)]" : "text-[var(--ink)]")}>
            {overdueCount}
          </p>
          <p className="text-tiny text-[var(--muted)]">{overdueCount === 0 ? "nothing late" : "past due"}</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Due in 7 days</p>
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{dueIn7Count}</p>
          <p className="text-tiny text-[var(--muted)]">coming up</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Completed</p>
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{completedCount}</p>
          <p className="text-tiny text-[var(--muted)]">in total</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Completion</p>
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">
            {tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)}%
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)}%` }}
            />
          </div>
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
              filter === f ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-border",
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
          <div className="flex flex-col gap-3">
            {[...workload.entries()].map(([name, { open, done }]) => {
              const total = open + done;
              const donePct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <div key={name} className="rounded-lg bg-[var(--surface-2)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-small font-medium text-[var(--ink)]">{name}</span>
                    <span className="text-tiny text-[var(--muted)]">
                      {open} open · {done} done
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${donePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
