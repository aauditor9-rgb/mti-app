"use client";

import { useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/(office)/communications/messages/actions";
import { messageAudienceEnum, messageChannelEnum } from "@/lib/db/schema";

export function NewMessageForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(formData);
      if (result.ok) {
        formRef.current?.reset();
        setOpen(false);
      } else {
        setError(result.message ?? "Could not save the message.");
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="self-start rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground">
        + New message
      </button>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-[var(--surface)] p-4">
      <input type="hidden" name="direction" value="Outbound" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">To</span>
          <select name="audience" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            {messageAudienceEnum.enumValues.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Contact name</span>
          <input name="contactName" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
        </label>
        <label className="flex flex-col gap-1 text-small">
          <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Channel</span>
          <select name="channel" required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body">
            {messageChannelEnum.enumValues.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-small">
        <span className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Message</span>
        <textarea name="body" rows={3} required className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-body" />
      </label>

      {error && <p className="text-small text-[var(--alert)]">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50">
          Send
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-small font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
          Cancel
        </button>
      </div>
    </form>
  );
}
