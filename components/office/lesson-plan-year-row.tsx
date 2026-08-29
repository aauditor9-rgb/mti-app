"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronRight } from "lucide-react";
import { removeLessonPlanEntry, setLessonPlanEntry } from "@/app/(office)/lesson-plans/actions";
import { LESSON_PLAN_SUBJECTS } from "@/lib/derive/lesson-plans";
import { cn } from "@/lib/utils";

type Entry = { id: string; subject: string; content: string };
type StaffOption = { id: string; name: string };

export function LessonPlanYearRow({
  year,
  weekStartDate,
  entries,
  setByName,
  staff,
}: {
  year: string;
  weekStartDate: string;
  entries: Entry[];
  setByName: string | null;
  staff: StaffOption[];
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const planned = entries.length > 0;
  const summary = planned ? `${entries[0].subject} · ${entries[0].content}` : "Not yet planned";

  function submitEntry(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setLessonPlanEntry(formData);
      if (result.ok) {
        formRef.current?.reset();
        setAdding(false);
      } else {
        setError(result.message ?? "Could not save.");
      }
    });
  }

  function remove(entryId: string) {
    startTransition(async () => {
      await removeLessonPlanEntry(entryId);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-[var(--surface)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <ChevronRight className={cn("size-4 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-90")} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[var(--ink)]">{year}</p>
          <p className="truncate text-small text-[var(--ink-2)]">{summary}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-tiny font-medium",
            planned ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
          )}
        >
          {planned ? "Planned" : "Not planned"}
        </span>
      </button>

      {open && (
        <div className={cn("border-t border-border p-4", pending && "opacity-70")}>
          {entries.length > 0 && (
            <div className="mb-3 flex flex-col gap-2">
              {entries.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-2 rounded-lg bg-background p-3">
                  <div>
                    <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{e.subject}</p>
                    <p className="text-small text-[var(--ink)]">{e.content}</p>
                  </div>
                  <button
                    onClick={() => remove(e.id)}
                    disabled={pending}
                    className="shrink-0 text-tiny text-[var(--alert)] hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {setByName && <p className="text-tiny text-[var(--muted)]">Set by {setByName}</p>}
            </div>
          )}

          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="text-small font-medium text-[var(--primary)] hover:underline"
            >
              + Add subject
            </button>
          ) : (
            <form ref={formRef} action={submitEntry} className="flex flex-col gap-2">
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="weekStartDate" value={weekStartDate} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  name="subject"
                  required
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-small"
                >
                  <option value="">Choose a subject…</option>
                  {LESSON_PLAN_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  name="setByStaffId"
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-small"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="content"
                required
                rows={2}
                placeholder="What's being taught this week?"
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-small"
              />
              {error && <p className="text-tiny text-[var(--alert)]">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-primary px-3 py-1.5 text-small font-medium text-primary-foreground disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-small text-[var(--ink-2)] hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
