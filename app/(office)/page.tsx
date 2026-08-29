import Link from "next/link";
import { todayLondon } from "@/lib/derive/age";
import { complaintSlaStatus } from "@/lib/derive/complaints";
import {
  getMadrasah,
  listApplicants,
  listClassesForRegister,
  listComplaints,
  listConcerns,
  listEvents,
  listHouseholdFeeSummaries,
  listMessages,
  listPupils,
  listTasks,
} from "@/lib/db/queries";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const madrasah = await getMadrasah();
  const today = todayLondon();

  const [pupils, classes, applicants, concerns, households, tasks, messages, complaints, events] = await Promise.all([
    listPupils(madrasah.id),
    listClassesForRegister(madrasah.id, today),
    listApplicants(madrasah.id),
    listConcerns(madrasah.id),
    listHouseholdFeeSummaries(madrasah.id),
    listTasks(madrasah.id),
    listMessages(madrasah.id),
    listComplaints(madrasah.id),
    listEvents(madrasah.id),
  ]);

  const onRollCount = pupils.filter((p) => p.enrolmentState === "Enrolled").length;
  const withPupils = classes.filter((c) => c.pupils.length > 0);
  const submittedCount = withPupils.filter((c) => c.submittedAt).length;
  const outstandingRegisters = withPupils.filter((c) => !c.submittedAt);
  const presentTotal = classes.reduce((sum, c) => sum + c.attendanceMarks.filter((m) => m.code === "P").length, 0);
  const markedTotal = classes.reduce((sum, c) => sum + c.attendanceMarks.length, 0);
  const presentPct = markedTotal === 0 ? 0 : Math.round((presentTotal / markedTotal) * 100);

  const familiesInArrears = households.filter((h) => h.householdStatus === "Overdue");
  const totalInvoiced = households.reduce((sum, h) => sum + h.totalInvoiced, 0);
  const totalPaid = households.reduce((sum, h) => sum + h.totalPaid, 0);
  const collectedPct = totalInvoiced === 0 ? 0 : Math.round((totalPaid / totalInvoiced) * 100);

  const awaitingDecision = applicants.filter((a) => a.stage !== "Enrolled" && a.stage !== "Declined" && a.stage !== "Waiting list");
  const openConcerns = concerns.filter((c) => c.status === "Open");
  const overdueTasks = tasks.filter((t) => t.status === "Overdue");
  const unreadMessages = messages.filter((m) => m.direction === "Inbound" && !m.readAt);
  const overdueComplaints = complaints.filter((c) => {
    const sla = complaintSlaStatus(c.submittedAt, c.acknowledgedAt?.toISOString() ?? null, c.resolvedAt?.toISOString() ?? null);
    return c.status !== "Resolved" && (sla.ackOverdue || sla.resolveOverdue);
  });

  const upcomingEvents = events.filter((e) => e.startAt.toISOString().slice(0, 10) >= today).slice(0, 5);

  const needsYou = [
    outstandingRegisters.length > 0 && {
      label: `${outstandingRegisters.length} register${outstandingRegisters.length === 1 ? "" : "s"} still outstanding today`,
      detail: outstandingRegisters.map((c) => c.name).join(", "),
      href: "/attendance",
    },
    familiesInArrears.length > 0 && {
      label: `${familiesInArrears.length} famil${familiesInArrears.length === 1 ? "y" : "ies"} in arrears`,
      detail: "Send reminders or record payments",
      href: "/finance/fees",
    },
    awaitingDecision.length > 0 && {
      label: `${awaitingDecision.length} admission${awaitingDecision.length === 1 ? "" : "s"} awaiting a decision`,
      detail: "Enquiry, Application or Assessment stage",
      href: "/admissions",
    },
    openConcerns.length > 0 && {
      label: `${openConcerns.length} behaviour concern${openConcerns.length === 1 ? "" : "s"} to review`,
      detail: "Status: Open",
      href: "/concerns",
    },
    overdueTasks.length > 0 && {
      label: `${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} overdue`,
      detail: overdueTasks.map((t) => t.title).slice(0, 3).join(", "),
      href: "/tasks",
    },
    overdueComplaints.length > 0 && {
      label: `${overdueComplaints.length} complaint${overdueComplaints.length === 1 ? "" : "s"} past SLA`,
      detail: overdueComplaints.map((c) => c.reference).join(", "),
      href: "/communications/complaints",
    },
  ].filter(Boolean) as { label: string; detail: string; href: string }[];

  const dateFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Overview</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{onRollCount}</p>
          <p className="text-small text-[var(--muted)]">On roll</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{presentPct}%</p>
          <p className="text-small text-[var(--muted)]">Present today</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">
            {submittedCount}/{withPupils.length}
          </p>
          <p className="text-small text-[var(--muted)]">Registers in</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", familiesInArrears.length > 0 ? "text-[var(--alert)]" : "text-[var(--ink)]")}>
            {familiesInArrears.length}
          </p>
          <p className="text-small text-[var(--muted)]">Fees overdue · {collectedPct}% collected</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{unreadMessages.length}</p>
          <p className="text-small text-[var(--muted)]">Unread</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className={cn("font-heading text-h3 font-medium", overdueTasks.length > 0 ? "text-[var(--alert)]" : "text-[var(--ink)]")}>
            {overdueTasks.length}
          </p>
          <p className="text-small text-[var(--muted)]">Tasks overdue</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Needs you</p>
        {needsYou.length === 0 ? (
          <p className="text-small text-[var(--muted)]">Nothing needs attention right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {needsYou.map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3 hover:bg-border">
                <div>
                  <p className="text-small font-medium text-[var(--ink)]">{item.label}</p>
                  <p className="text-tiny text-[var(--muted)]">{item.detail}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
          <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Upcoming this term</p>
          {upcomingEvents.length === 0 ? (
            <p className="text-small text-[var(--muted)]">Nothing scheduled — add events under Communications.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-small">
                  <span className="font-medium text-[var(--ink)]">{e.title}</span>
                  <span className="text-[var(--muted)]">{dateFormatter.format(e.startAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
          <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Latest messages</p>
          {messages.length === 0 ? (
            <p className="text-small text-[var(--muted)]">No messages yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.slice(0, 3).map((m) => (
                <p key={m.id} className="text-small text-[var(--ink-2)]">
                  <span className="font-medium text-[var(--ink)]">{m.contactName}</span> — {m.body}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
