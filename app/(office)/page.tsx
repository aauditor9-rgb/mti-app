import Link from "next/link";
import { BarChart } from "@/components/office/bar-chart";
import { DonutChart } from "@/components/office/donut-chart";
import { todayLondon } from "@/lib/derive/age";
import { complaintSlaStatus } from "@/lib/derive/complaints";
import {
  getAttendanceTrend,
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

  const [pupils, classes, applicants, concerns, households, tasks, messages, complaints, events, trend] = await Promise.all([
    listPupils(madrasah.id),
    listClassesForRegister(madrasah.id, today),
    listApplicants(madrasah.id),
    listConcerns(madrasah.id),
    listHouseholdFeeSummaries(madrasah.id),
    listTasks(madrasah.id),
    listMessages(madrasah.id),
    listComplaints(madrasah.id),
    listEvents(madrasah.id),
    getAttendanceTrend(madrasah.id),
  ]);

  const onRollCount = pupils.filter((p) => p.enrolmentState === "Enrolled").length;
  const withPupils = classes.filter((c) => c.pupils.length > 0);
  const submittedCount = withPupils.filter((c) => c.submittedAt).length;
  const outstandingRegisters = withPupils.filter((c) => !c.submittedAt);
  const presentTotal = classes.reduce((sum, c) => sum + c.attendanceMarks.filter((m) => m.code === "P").length, 0);
  const lateTotal = classes.reduce((sum, c) => sum + c.attendanceMarks.filter((m) => m.code === "L").length, 0);
  const absentTotal = classes.reduce(
    (sum, c) => sum + c.attendanceMarks.filter((m) => m.code !== "P" && m.code !== "L").length,
    0,
  );
  const markedTotal = presentTotal + lateTotal + absentTotal;
  const presentPct = markedTotal === 0 ? 0 : Math.round((presentTotal / markedTotal) * 100);

  const familiesInArrears = households.filter((h) => h.householdStatus === "Overdue");
  const totalInvoiced = households.reduce((sum, h) => sum + h.totalInvoiced, 0);
  const totalPaid = households.reduce((sum, h) => sum + h.totalPaid, 0);
  const totalOutstanding = households.reduce((sum, h) => sum + h.totalOutstanding, 0);
  const collectedPct = totalInvoiced === 0 ? 0 : Math.round((totalPaid / totalInvoiced) * 100);
  const settledCount = households.filter((h) => h.householdStatus === "Settled").length;
  const dueCount = households.filter((h) => h.householdStatus === "Due").length;

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
      headline: `${outstandingRegisters.length} register${outstandingRegisters.length === 1 ? "" : "s"} still outstanding today.`,
      detail: outstandingRegisters.map((c) => c.name).join(" · "),
      cta: "Go to Attendance",
      href: "/attendance",
    },
    familiesInArrears.length > 0 && {
      headline: `${familiesInArrears.length} famil${familiesInArrears.length === 1 ? "y is" : "ies are"} in arrears.`,
      detail: `£${totalOutstanding.toFixed(2)} outstanding across all families`,
      cta: "Go to Fees",
      href: "/finance/fees",
    },
    awaitingDecision.length > 0 && {
      headline: `${awaitingDecision.length} admission${awaitingDecision.length === 1 ? "" : "s"} awaiting a decision.`,
      detail: "Enquiry, Application or Assessment stage",
      cta: "Go to Admissions",
      href: "/admissions",
    },
    openConcerns.length > 0 && {
      headline: `${openConcerns.length} behaviour concern${openConcerns.length === 1 ? "" : "s"} to review.`,
      detail: "Status: Open",
      cta: "Go to Concerns",
      href: "/concerns",
    },
    overdueTasks.length > 0 && {
      headline: `${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} overdue.`,
      detail: overdueTasks.map((t) => t.title).slice(0, 3).join(", "),
      cta: "Go to Tasks",
      href: "/tasks",
    },
    overdueComplaints.length > 0 && {
      headline: `${overdueComplaints.length} complaint${overdueComplaints.length === 1 ? "" : "s"} past SLA.`,
      detail: overdueComplaints.map((c) => c.reference).join(", "),
      cta: "Go to Complaints",
      href: "/communications/complaints",
    },
  ].filter(Boolean) as { headline: string; detail: string; cta: string; href: string }[];

  const [hero, ...rest] = needsYou;

  const daysWithMarks = trend.filter((d) => d.markedCount > 0);
  const weekAveragePct =
    daysWithMarks.length === 0 ? 0 : Math.round(daysWithMarks.reduce((sum, d) => sum + d.pct, 0) / daysWithMarks.length);
  const dayFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short" });

  const dateFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Overview</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ["On roll", String(onRollCount), false],
            ["Present today", `${presentPct}%`, false],
            ["Registers in", `${submittedCount}/${withPupils.length}`, false],
            ["Fees overdue", String(familiesInArrears.length), familiesInArrears.length > 0],
            ["Unread", String(unreadMessages.length), false],
            ["Tasks overdue", String(overdueTasks.length), overdueTasks.length > 0],
          ] as const
        ).map(([label, value, alert]) => (
          <div key={label} className="rounded-xl border border-border bg-[var(--surface)] p-4">
            <p className={cn("font-heading text-h3 font-medium", alert ? "text-[var(--alert)]" : "text-[var(--ink)]")}>{value}</p>
            <p className="text-small text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          {hero ? (
            <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
              <p className="text-tiny font-medium tracking-wide text-[var(--alert)] uppercase">
                Needs you · {dateFormatter.format(new Date())}
              </p>
              <h2 className="mt-1 font-heading text-h3 font-medium text-[var(--ink)]">{hero.headline}</h2>
              <p className="mt-1 text-small text-[var(--ink-2)]">{hero.detail}</p>
              <Link
                href={hero.href}
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
              >
                {hero.cta}
              </Link>

              {rest.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">After that</p>
                  <div className="flex flex-col gap-1.5">
                    {rest.map((item, i) => (
                      <Link key={i} href={item.href} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]">
                        <span className="text-small text-[var(--ink)]">{item.headline}</span>
                        <span className="text-tiny font-medium text-[var(--primary)]">{item.cta} →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
              <p className="text-tiny font-medium tracking-wide text-[var(--success)] uppercase">Needs you</p>
              <p className="mt-1 text-small text-[var(--ink-2)]">Nothing needs attention right now.</p>
            </div>
          )}

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

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">This week · Attendance trend</p>
              <p className="font-heading text-h4 font-medium text-[var(--ink)]">{weekAveragePct}%</p>
            </div>
            <BarChart
              bars={trend.map((d, i) => ({
                label: dayFormatter.format(new Date(`${d.date}T12:00:00`)),
                value: d.pct,
                highlight: i === trend.length - 1,
              }))}
            />
          </div>

          <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
            <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">This term · Fees collected</p>
            <div className="flex items-center gap-4">
              <DonutChart
                centerValue={`${collectedPct}%`}
                centerLabel="collected"
                segments={[
                  { value: settledCount, colorVar: "var(--success)" },
                  { value: dueCount, colorVar: "var(--warn-bg)" },
                  { value: familiesInArrears.length, colorVar: "var(--alert)" },
                ]}
              />
              <div className="flex flex-col gap-1 text-small">
                <p className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[var(--success)]" /> Settled <span className="text-[var(--muted)]">{settledCount}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[var(--warn-bg)]" /> Due <span className="text-[var(--muted)]">{dueCount}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[var(--alert)]" /> Overdue <span className="text-[var(--muted)]">{familiesInArrears.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
            <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Today · Attendance split</p>
            <div className="flex items-center gap-4">
              <DonutChart
                centerValue={`${presentPct}%`}
                centerLabel="present today"
                segments={[
                  { value: presentTotal, colorVar: "var(--success)" },
                  { value: lateTotal, colorVar: "var(--warn-bg)" },
                  { value: absentTotal, colorVar: "var(--alert)" },
                ]}
              />
              <div className="flex flex-col gap-1 text-small">
                <p className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[var(--success)]" /> Present <span className="text-[var(--muted)]">{presentTotal}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[var(--warn-bg)]" /> Late <span className="text-[var(--muted)]">{lateTotal}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[var(--alert)]" /> Absent <span className="text-[var(--muted)]">{absentTotal}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
