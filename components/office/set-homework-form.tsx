"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { setHomework } from "@/app/(office)/homework/actions";

type ClassOption = { id: string; name: string };
type StaffOption = { id: string; name: string };
type PupilOption = { id: string; name: string };

export function SetHomeworkForm({
  classes,
  staff,
  pupilsByClass,
  fixedClassId,
}: {
  classes: ClassOption[];
  staff: StaffOption[];
  // When provided, the form offers "Whole class" / "Selected students" targeting
  // (design/README.md Teacher > Set Work) for the chosen class.
  pupilsByClass?: Record<string, PupilOption[]>;
  // Teacher > Set Work only sets homework for their own class, so the class picker
  // is replaced with a fixed, read-only class.
  fixedClassId?: string;
}) {
  const [open, setOpen] = useState(!!fixedClassId);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState(fixedClassId ?? "");
  const [audience, setAudience] = useState<"Whole class" | "Selected students">("Whole class");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  const classPupils = useMemo(() => (classId ? (pupilsByClass?.[classId] ?? []) : []), [classId, pupilsByClass]);
  const selectedClassName = classes.find((c) => c.id === fixedClassId)?.name;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await setHomework(formData);
      if (result.ok) {
        formRef.current?.reset();
        setSelected(new Set());
        setAudience("Whole class");
        if (!fixedClassId) setOpen(false);
      } else {
        setError(result.message ?? "Could not set the homework.");
      }
    });
  }

  function toggleSelected(pupilId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pupilId)) next.delete(pupilId);
      else next.add(pupilId);
      return next;
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
      >
        + Set homework
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fixedClassId ? (
          <div className="flex flex-col gap-1 text-small sm:col-span-2">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Class</span>
            <input type="hidden" name="classId" value={fixedClassId} />
            <p className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body text-[var(--ink)]">
              {selectedClassName}
            </p>
          </div>
        ) : (
          <label className="flex flex-col gap-1 text-small">
            <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Class</span>
            <select
              name="classId"
              required
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSelected(new Set());
              }}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body"
            >
              <option value="">Choose a class…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Subject</span>
          <input name="subject" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" placeholder="e.g. Qaaidah" />
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Due date</span>
          <input type="date" name="dueDate" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>

        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Set by</span>
          <select name="setByStaffId" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-small sm:col-span-2">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Task</span>
          <textarea name="task" required rows={2} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" placeholder="What should pupils do?" />
        </label>
      </div>

      {pupilsByClass && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Assign to</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-small text-[var(--ink)]">
              <input
                type="radio"
                name="audience"
                value="Whole class"
                checked={audience === "Whole class"}
                onChange={() => setAudience("Whole class")}
              />
              Whole class
            </label>
            <label className="flex items-center gap-1.5 text-small text-[var(--ink)]">
              <input
                type="radio"
                name="audience"
                value="Selected students"
                checked={audience === "Selected students"}
                onChange={() => setAudience("Selected students")}
              />
              Selected students
            </label>
          </div>
          {audience === "Whole class" ? (
            <p className="text-tiny text-[var(--muted)]">
              {classPupils.length > 0 ? `Every student in this class (${classPupils.length}) will receive this task.` : "Choose a class to see its students."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {classPupils.length === 0 && <p className="text-tiny text-[var(--muted)]">Choose a class to see its students.</p>}
              {classPupils.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-tiny text-[var(--ink)]"
                >
                  <input
                    type="checkbox"
                    name="pupilIds"
                    value={p.id}
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelected(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Set homework
        </button>
        {!fixedClassId && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
