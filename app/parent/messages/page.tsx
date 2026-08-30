import Link from "next/link";
import { MessageRow } from "@/components/office/message-row";
import { NewMessageForm } from "@/components/office/new-message-form";
import { MonthGrid } from "@/components/office/month-grid";
import { MONTH_NAMES, academicYearMonths, getMonthGrid } from "@/lib/derive/calendar-grid";
import { cn } from "@/lib/utils";
import { getMadrasah, listCalendarSets, listEvents, listMessages } from "@/lib/db/queries";

export default async function ParentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; tab?: string }>;
}) {
  const { child, tab = "messages" } = await searchParams;
  const madrasah = await getMadrasah();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Messages &amp; calendar</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Messages &amp; Calendar</h1>
      </div>

      <div className="flex gap-2">
        {(["messages", "calendar"] as const).map((t) => (
          <Link
            key={t}
            href={`/parent/messages?tab=${t}${child ? `&child=${child}` : ""}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              tab === t ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
            )}
          >
            {t === "messages" ? "Messages" : "Calendar & Events"}
          </Link>
        ))}
      </div>

      {tab === "messages" && <MessagesTab madrasahId={madrasah.id} />}
      {tab === "calendar" && <CalendarTab madrasahId={madrasah.id} />}
    </div>
  );
}

async function MessagesTab({ madrasahId }: { madrasahId: string }) {
  const messages = await listMessages(madrasahId);
  const dateFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-4">
      <NewMessageForm />
      <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)] shadow-sm">
        {messages.length === 0 ? (
          <p className="p-8 text-center text-small text-[var(--muted)]">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <MessageRow key={m.id} id={m.id} contactName={m.contactName} body={m.body} channel={m.channel} direction={m.direction} sentAt={dateFormatter.format(m.sentAt)} readAt={m.readAt ? m.readAt.toISOString() : null} />
          ))
        )}
      </div>
    </div>
  );
}

async function CalendarTab({ madrasahId }: { madrasahId: string }) {
  const [calendarSets, events] = await Promise.all([listCalendarSets(madrasahId), listEvents(madrasahId)]);
  const activeSet = calendarSets[0] ?? null;
  const eventDates = new Set(events.map((e) => e.startAt.toISOString().slice(0, 10)));
  const months = activeSet ? academicYearMonths(activeSet.academicYearStart, activeSet.academicYearEnd) : [];
  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit" });
  const upcoming = events.filter((e) => e.startAt.getTime() >= Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`));

  return (
    <div className="flex flex-col gap-4">
      {activeSet && (
        <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {months.map(({ year, month }) => (
              <MonthGrid
                key={`${year}-${month}`}
                label={`${MONTH_NAMES[month - 1]} ${year}`}
                cells={getMonthGrid(year, month, {
                  academicYearStart: activeSet.academicYearStart,
                  academicYearEnd: activeSet.academicYearEnd,
                  teachingDays: activeSet.teachingDays,
                  holidays: activeSet.holidays,
                  eventDates,
                })}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Upcoming events</p>
        {upcoming.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No upcoming events.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {upcoming.map((e) => (
              <div key={e.id} className="py-2.5 text-small">
                <p className="font-medium text-[var(--ink)]">{e.title}</p>
                <p className="text-tiny text-[var(--muted)]">
                  {dateFmt.format(e.startAt)} · {timeFmt.format(e.startAt)}
                  {e.location && ` · ${e.location}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
