import { AddEventForm } from "@/components/office/add-event-form";
import { getMadrasah, listEvents } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

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
          events.map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">
                    {dateFormatter.format(e.startAt)}
                    {" · "}
                    {timeFormatter.format(e.startAt)}
                    {e.endAt && `–${timeFormatter.format(e.endAt)}`}
                  </p>
                  <p className="font-heading text-h4 font-medium text-[var(--ink)]">{e.title}</p>
                  <p className="text-small text-[var(--ink-2)]">
                    {e.location}
                    {e.audience && ` · ${e.audience}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {e.requiresConsent && (
                    <span className="rounded-full bg-[var(--warn-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--ink-2)]">Consent required</span>
                  )}
                  {e.requiresPayment && (
                    <span className="rounded-full bg-[var(--warn-bg)] px-2 py-0.5 text-tiny font-medium text-[var(--ink-2)]">
                      Payment £{Number(e.paymentAmount).toFixed(2)}
                    </span>
                  )}
                  {e.requiresRsvp && (
                    <span className={cn("rounded-full px-2 py-0.5 text-tiny font-medium", "bg-[var(--surface-2)] text-[var(--ink-2)]")}>RSVP</span>
                  )}
                </div>
              </div>
              {e.description && <p className="mt-2 text-small text-[var(--ink-2)]">{e.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
