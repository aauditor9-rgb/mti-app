"use client";

import { useRef, useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { addRunningOrderItem } from "@/app/(office)/communications/events/actions";
import { cn } from "@/lib/utils";

type RunningOrderItem = { time: string; title: string; detail?: string };

export function EventCard({
  eventId,
  dateLabel,
  title,
  location,
  audience,
  description,
  badges,
  runningOrder,
}: {
  eventId: string;
  dateLabel: string;
  title: string;
  location: string | null;
  audience: string | null;
  description: string | null;
  badges: string[];
  runningOrder: RunningOrderItem[];
}) {
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addRunningOrderItem(formData);
      if (result.ok) {
        formRef.current?.reset();
        setFormOpen(false);
      } else {
        setError(result.message ?? "Could not add this item.");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface)]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-2 p-4 text-left hover:bg-[var(--surface-2)]">
        {open ? <ChevronDown className="mt-1 size-4 shrink-0 text-[var(--muted)]" /> : <ChevronRight className="mt-1 size-4 shrink-0 text-[var(--muted)]" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{dateLabel}</p>
              <p className="font-heading text-h4 font-medium text-[var(--ink)]">{title}</p>
              <p className="text-small text-[var(--ink-2)]">
                {location}
                {audience && ` · ${audience}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span key={b} className="rounded-full bg-[var(--warn-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--ink-2)]">
                  {b}
                </span>
              ))}
            </div>
          </div>
          {description && <p className="mt-2 text-small text-[var(--ink-2)]">{description}</p>}
        </div>
      </button>

      {open && (
        <div className={cn("border-t border-border p-4", pending && "opacity-70")}>
          <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Running order</p>
          {runningOrder.length === 0 ? (
            <p className="text-small text-[var(--muted)]">No running order added yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {runningOrder.map((item, i) => (
                <div key={i} className="flex items-baseline gap-3 text-small">
                  <span className="w-14 shrink-0 font-medium text-[var(--ink)]">{item.time}</span>
                  <div>
                    <p className="text-[var(--ink)]">{item.title}</p>
                    {item.detail && <p className="text-tiny text-[var(--muted)]">{item.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {formOpen ? (
            <form ref={formRef} action={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
              <input type="hidden" name="eventId" value={eventId} />
              <input name="time" placeholder="3:00" required className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
              <input name="title" placeholder="Item title" required className="flex-1 min-w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
              <input name="detail" placeholder="Detail (optional)" className="flex-1 min-w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-small" />
              <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-small font-medium text-primary-foreground">
                Add
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg px-3 py-1.5 text-small text-[var(--ink-2)]">
                Cancel
              </button>
              {error && <p className="w-full text-tiny text-[var(--alert)]">{error}</p>}
            </form>
          ) : (
            <button onClick={() => setFormOpen(true)} className="mt-3 text-small font-medium text-[var(--primary)] hover:underline">
              + Add running order item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
