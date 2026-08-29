import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HomeworkChecklist } from "@/components/office/homework-checklist";
import { getHomework, getMadrasah } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const TONE_STYLE = {
  success: "bg-[var(--success)]",
  warn: "bg-[var(--warn-bg)]",
  alert: "bg-[var(--alert)]",
} as const;

export default async function HomeworkDetailPage(props: PageProps<"/homework/[id]">) {
  const { id } = await props.params;
  const madrasah = await getMadrasah();
  const item = await getHomework(madrasah.id, id);
  if (!item) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Teaching &amp; learning</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Homework Review</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link
          href="/homework"
          className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-3.5" /> Back to homework
        </Link>

        <h2 className="font-heading text-h3 font-medium text-[var(--ink)]">
          {item.subject} · {item.class?.name ?? "Unknown class"}
        </h2>
        <p className="mt-1 text-body text-[var(--ink)]">{item.task}</p>
        <p className="mt-2 text-small text-[var(--ink-2)]">
          Due {item.dueDate}
          {item.setBy && <> · set by {item.setBy.name}</>}
        </p>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className={cn("h-full rounded-full", TONE_STYLE[item.progress.tone])} style={{ width: `${item.progress.donePct}%` }} />
          </div>
          <p className="mt-1 text-tiny text-[var(--muted)]">
            {item.progress.label} · {item.progress.doneCount}/{item.progress.totalCount}
          </p>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Pupils</p>
          {item.submissions.length === 0 ? (
            <p className="text-small text-[var(--muted)]">No students were allocated to this class when it was set.</p>
          ) : (
            <HomeworkChecklist
              submissions={item.submissions.map((s) => ({
                id: s.id,
                completed: s.completed,
                pupilDisplayId: s.pupil?.displayId ?? "",
                pupilName: s.pupil?.name ?? "Unknown pupil",
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
