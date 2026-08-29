import { AddSlotForm, CreateSessionForm } from "@/components/office/parents-evening-forms";
import { getMadrasah, listParentsEveningSessions, listStaff } from "@/lib/db/queries";

export default async function ParentsEveningPage() {
  const madrasah = await getMadrasah();
  const [sessions, staff] = await Promise.all([listParentsEveningSessions(madrasah.id), listStaff(madrasah.id)]);
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Communications</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Parents&apos; Evening</h1>
      </div>

      <CreateSessionForm />

      {sessions.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No sessions scheduled yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-[var(--surface)] p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-heading text-h4 font-medium text-[var(--ink)]">{s.date}</p>
                <AddSlotForm sessionId={s.id} staff={staff.map((t) => ({ id: t.id, name: t.name }))} />
              </div>
              {s.slots.length === 0 ? (
                <p className="text-small text-[var(--muted)]">No slots added yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {s.slots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between py-2 text-small">
                      <span className="text-[var(--ink)]">
                        {timeFmt.format(new Date(`1970-01-01T${slot.time}Z`))} · {slot.staff.name}
                      </span>
                      <span className="text-tiny text-[var(--muted)]">
                        {slot.bookings.length > 0 ? slot.bookings.map((b) => b.pupil.name).join(", ") : "Not booked"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
