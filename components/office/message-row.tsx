"use client";

import { useTransition } from "react";
import { markMessageRead } from "@/app/(office)/communications/messages/actions";
import { cn } from "@/lib/utils";

export function MessageRow({
  id,
  contactName,
  body,
  channel,
  direction,
  sentAt,
  readAt,
}: {
  id: string;
  contactName: string;
  body: string;
  channel: string;
  direction: string;
  sentAt: string;
  readAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const unread = direction === "Inbound" && !readAt;

  function markRead() {
    startTransition(async () => {
      await markMessageRead(id);
    });
  }

  return (
    <div className={cn("flex items-start gap-3 border-t border-border p-3 first:border-t-0", pending && "opacity-70")}>
      <div className="relative shrink-0">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-tiny font-medium text-primary-foreground">
          {contactName.charAt(0)}
        </div>
        {unread && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[var(--surface)] bg-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium text-[var(--ink)]">
          {direction === "Inbound" ? contactName : `To: ${contactName}`}
        </p>
        <p className="truncate text-small text-[var(--ink-2)]">{body}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-tiny text-[var(--muted)]">
        <span>{sentAt}</span>
        <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">{channel}</span>
        {unread && (
          <button onClick={markRead} disabled={pending} className="font-medium text-[var(--primary)] hover:underline">
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}
