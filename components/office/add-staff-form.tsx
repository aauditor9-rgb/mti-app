"use client";

import { useRef, useState, useTransition } from "react";
import { addStaffMember } from "@/app/(office)/staff/directory/actions";
import { staffRoleEnum } from "@/lib/db/schema";

export function AddStaffForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addStaffMember(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not add this staff member.");
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground">
        + Add teacher
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Name</span>
          <input name="name" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Role</span>
          <select name="role" defaultValue="Teacher" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            {staffRoleEnum.enumValues.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Title (optional)</span>
          <input name="title" placeholder="e.g. Deputy Headteacher" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Phone</span>
          <input name="phone" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Email</span>
          <input type="email" name="email" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex items-center gap-1.5 self-end pb-1.5 text-small">
          <input type="checkbox" name="portalAccess" className="size-4" /> Portal access
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Pay rate</span>
          <input name="payRate" placeholder="e.g. £15/hr" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Hours</span>
          <input name="hours" placeholder="e.g. Mon–Thu 4–7pm" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <span />
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">DBS expiry</span>
          <input type="date" name="dbsExpiry" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">First aid expiry</span>
          <input type="date" name="firstAidExpiry" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Safeguarding expiry</span>
          <input type="date" name="safeguardingExpiry" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
      </div>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Add teacher
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
          Cancel
        </button>
      </div>
    </form>
  );
}
