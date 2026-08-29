"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTask, toggleTaskComplete } from "@/app/(office)/tasks/actions";
import { cn } from "@/lib/utils";

const PRIORITY_STYLE: Record<string, string> = {
  High: "bg-[var(--alert-bg)] text-[var(--alert)]",
  Medium: "bg-[var(--warn-bg)] text-[var(--ink-2)]",
  Low: "bg-[var(--surface-2)] text-[var(--muted)]",
};

export function TaskRow({
  id,
  title,
  assignedTo,
  category,
  priority,
  dueDate,
  status,
}: {
  id: string;
  title: string;
  assignedTo: string;
  category: string;
  priority: string;
  dueDate: string;
  status: "Completed" | "Overdue" | "Open";
}) {
  const [pending, startTransition] = useTransition();

  function toggle(checked: boolean) {
    startTransition(async () => {
      await toggleTaskComplete(id, checked);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteTask(id);
    });
  }

  return (
    <div className={cn("flex items-center gap-3 border-t border-border p-3 first:border-t-0", pending && "opacity-70")}>
      <input
        type="checkbox"
        checked={status === "Completed"}
        disabled={pending}
        onChange={(e) => toggle(e.target.checked)}
        className="size-4"
      />
      <div className="flex-1">
        <p className={cn("text-small font-medium text-[var(--ink)]", status === "Completed" && "line-through text-[var(--muted)]")}>
          {title}
        </p>
        <p className="text-tiny text-[var(--muted)]">
          {assignedTo} · {category} · due {dueDate}
        </p>
      </div>
      {status === "Overdue" && (
        <span className="rounded-full bg-[var(--alert-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--alert)]">Overdue</span>
      )}
      <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", PRIORITY_STYLE[priority])}>{priority}</span>
      <button onClick={remove} disabled={pending} className="text-[var(--muted)] hover:text-[var(--alert)]" aria-label="Delete task">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
