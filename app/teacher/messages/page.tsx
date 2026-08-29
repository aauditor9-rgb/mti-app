import { MessageRow } from "@/components/office/message-row";
import { NewMessageForm } from "@/components/office/new-message-form";
import { getCurrentStaff, getMadrasah, listMessages } from "@/lib/db/queries";

export default async function TeacherMessagesPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const messages = await listMessages(madrasah.id);
  const unreadCount = messages.filter((m) => m.direction === "Inbound" && !m.readAt).length;

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Pastoral</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Messages</h1>
        <p className="text-small text-[var(--muted)]">{unreadCount} unread.</p>
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
