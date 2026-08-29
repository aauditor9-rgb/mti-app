import { AddEventForm } from "@/components/office/add-event-form";
import { EventCard } from "@/components/office/event-card";
import { getMadrasah, listEvents } from "@/lib/db/queries";

export default async function EventsPage() {
  const madrasah = await getMadrasah();
  const events = await listEvents(madrasah.id);

  const dateFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short" });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Communications</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Events &amp; Jalsas</h1>
        <p className="text-small text-[var(--muted)]">Consent, payments and staffing tracked per event.</p>
      </div>

      <AddEventForm />

      <div className="flex flex-col gap-2">
        {events.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No events scheduled yet.
          </p>
        ) : (
          events.map((e) => {
            const badges = [
              e.requiresConsent && "Consent required",
              e.requiresPayment && `Payment £${Number(e.paymentAmount).toFixed(2)}`,
              e.requiresRsvp && "RSVP",
            ].filter((b): b is string => !!b);
            return (
              <EventCard
                key={e.id}
                eventId={e.id}
                dateLabel={`${dateFormatter.format(e.startAt)} · ${timeFormatter.format(e.startAt)}${e.endAt ? `–${timeFormatter.format(e.endAt)}` : ""}`}
                title={e.title}
                location={e.location}
                audience={e.audience}
                description={e.description}
                badges={badges}
                runningOrder={e.runningOrder}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
