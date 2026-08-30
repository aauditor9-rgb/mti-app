import Link from "next/link";
import { AbsenceRequestForms } from "@/components/parent/absence-request-forms";
import { BookSlotButton } from "@/components/parent/book-slot-button";
import { cn } from "@/lib/utils";
import { getCurrentGuardian, getMadrasah, listLeaveRequestsForPupil, listUpcomingParentsEveningSlots } from "@/lib/db/queries";

export default async function ParentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; tab?: string }>;
}) {
  const { child, tab = "absence" } = await searchParams;
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return null;
  const activeChild = guardianRow.children.find((c) => c.id === child) ?? guardianRow.children[0];
  if (!activeChild) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Requests to the office</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Requests</h1>
      </div>

      <div className="flex gap-2">
        {(["absence", "evening"] as const).map((t) => (
          <Link
            key={t}
            href={`/parent/requests?tab=${t}${child ? `&child=${child}` : ""}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              tab === t ? "bg-primary text-primary-foreground" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
            )}
          >
            {t === "absence" ? "Absence & Leave" : "Parents' Evening"}
          </Link>
        ))}
      </div>

      {tab === "absence" && <AbsenceTab pupilId={activeChild.id} />}
      {tab === "evening" && <EveningTab madrasahId={madrasah.id} pupilId={activeChild.id} />}
    </div>
  );
}

async function AbsenceTab({ pupilId }: { pupilId: string }) {
  const previous = await listLeaveRequestsForPupil(pupilId);

  return (
    <div className="flex flex-col gap-4">
      <AbsenceRequestForms pupilId={pupilId} />

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Previous reports</p>
        {previous.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No reports yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {previous.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 text-small">
                <span className="text-[var(--ink)]">
                  {r.kind === "Absence today" ? r.reportReason : r.holidayReason} · {r.startDate}
                  {r.endDate && r.endDate !== r.startDate && ` – ${r.endDate}`}
                </span>
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-tiny text-[var(--ink-2)]">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function EveningTab({ madrasahId, pupilId }: { madrasahId: string; pupilId: string }) {
  const sessions = await listUpcomingParentsEveningSlots(madrasahId);
  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "numeric", minute: "2-digit" });

  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        No parents&apos; evening has been scheduled yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => (
        <div key={s.id} className="rounded-xl border border-border bg-[var(--surface)] p-5">
          <p className="font-heading text-h4 font-medium text-[var(--ink)]">Book Parents&apos; Evening — {dateFmt.format(new Date(`${s.date}T00:00:00Z`))}</p>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {s.slots.map((slot) => {
              const booking = slot.bookings.find((b) => b.pupilId === pupilId);
              return (
                <div key={slot.id} className="flex items-center justify-between py-2 text-small">
                  <span className="text-[var(--ink)]">
                    {timeFmt.format(new Date(`1970-01-01T${slot.time}Z`))} · with {slot.staff.name}
                  </span>
                  <BookSlotButton slotId={slot.id} pupilId={pupilId} booked={!!booking} full={slot.bookings.length >= 1 && !booking} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
