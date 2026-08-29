import { MessageRow } from "@/components/office/message-row";
import { NewMessageForm } from "@/components/office/new-message-form";
import { getMadrasah, listMessages } from "@/lib/db/queries";

export default async function MessagesPage() {
  const madrasah = await getMadrasah();
  const messages = await listMessages(madrasah.id);

  const unreadCount = messages.filter((m) => m.direction === "Inbound" && !m.readAt).length;
  const parentCount = messages.filter((m) => m.audience === "Parent").length;
  const staffCount = messages.filter((m) => m.audience === "Staff").length;

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Communications</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Messages</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{messages.length}</p>
          <p className="text-small text-[var(--muted)]">All</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{parentCount}</p>
          <p className="text-small text-[var(--muted)]">Parents</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{staffCount}</p>
          <p className="text-small text-[var(--muted)]">Teachers</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{unreadCount}</p>
          <p className="text-small text-[var(--muted)]">Unread</p>
        </div>
      </div>

      <NewMessageForm />

      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
        {messages.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <MessageRow
              key={m.id}
              id={m.id}
              contactName={m.contactName}
              body={m.body}
              channel={m.channel}
              direction={m.direction}
              sentAt={dateFormatter.format(m.sentAt)}
              readAt={m.readAt ? m.readAt.toISOString() : null}
            />
          ))
        )}
      </div>
    </div>
  );
}
