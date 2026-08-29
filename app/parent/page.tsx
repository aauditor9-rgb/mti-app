import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getCurrentGuardian,
  getHouseholdFeeSummaryForPupil,
  getMadrasah,
  getPupilAttendanceSummary,
  countHomeworkDueThisWeek,
  listExamResultsForPupil,
  listPublishedReportsForPupil,
} from "@/lib/db/queries";

export default async function ParentRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; tab?: string }>;
}) {
  const { child, tab = "record" } = await searchParams;
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return null;

  const activeChild = guardianRow.children.find((c) => c.id === child) ?? guardianRow.children[0];
  if (!activeChild) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        No children are linked to your account yet.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">My Child</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">{activeChild.name}</h1>
      </div>

      <div className="flex gap-2">
        {(["record", "timetable", "reports"] as const).map((t) => (
          <Link
            key={t}
            href={`/parent?tab=${t}${child ? `&child=${child}` : ""}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              tab === t ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
            )}
          >
            {t === "record" ? "Record" : t === "timetable" ? "Timetable" : "Reports & Exams"}
          </Link>
        ))}
      </div>

      {tab === "record" && <RecordTab madrasahId={madrasah.id} pupilId={activeChild.id} className={activeChild.class?.name ?? null} />}
      {tab === "timetable" && <TimetableTab className={activeChild.class?.name ?? null} timing={activeChild.class?.timing ?? null} lessons={activeChild.class?.lessons ?? []} />}
      {tab === "reports" && <ReportsTab pupilId={activeChild.id} />}
    </div>
  );
}

async function RecordTab({ madrasahId, pupilId, className }: { madrasahId: string; pupilId: string; className: string | null }) {
  const [attendance, homeworkCount, fees] = await Promise.all([
    getPupilAttendanceSummary(madrasahId, pupilId),
    countHomeworkDueThisWeek(madrasahId, pupilId),
    getHouseholdFeeSummaryForPupil(madrasahId, pupilId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="text-small text-[var(--ink-2)]">{className ?? "No class assigned"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/parent/requests" className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-small font-medium text-[var(--ink)]">
            Report an absence
          </Link>
          <Link href="/parent/messages" className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-small font-medium text-[var(--ink)]">
            Message the teacher
          </Link>
        </div>
      </div>

      {fees && fees.nextDueDate && (
        <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Next fee due</p>
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">
            £{fees.lines.find((l) => l.status !== "Paid")?.amount.toFixed(2) ?? fees.totalOutstanding.toFixed(2)}
          </p>
          <p className="text-small text-[var(--muted)]">Due {fees.nextDueDate}</p>
          <Link href="/parent/fees" className="mt-2 inline-block text-small font-medium text-[var(--primary)] hover:underline">
            Pay now →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{attendance.attendancePct}%</p>
          <p className="text-small text-[var(--muted)]">Attendance</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{attendance.lateCount}</p>
          <p className="text-small text-[var(--muted)]">Late arrivals</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--surface)] p-4">
          <p className="font-heading text-h3 font-medium text-[var(--ink)]">{homeworkCount}</p>
          <p className="text-small text-[var(--muted)]">Work set this week</p>
        </div>
      </div>
    </div>
  );
}

function TimetableTab({ className, timing, lessons }: { className: string | null; timing: string | null; lessons: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
      <p className="font-medium text-[var(--ink)]">{className ?? "No class assigned"}</p>
      <p className="text-small text-[var(--muted)]">{timing ?? "—"}</p>
      {lessons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {lessons.map((l) => (
            <span key={l} className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-tiny font-medium text-[var(--ink-2)]">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

async function ReportsTab({ pupilId }: { pupilId: string }) {
  const [reports, results] = await Promise.all([listPublishedReportsForPupil(pupilId), listExamResultsForPupil(pupilId)]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">School report</p>
        {reports.length === 0 ? (
          <p className="text-small text-[var(--muted)]">
            No report has been published yet. You&apos;ll be notified here and by message as soon as it&apos;s ready.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-lg bg-background p-3">
                <p className="text-small font-medium text-[var(--ink)]">{r.term?.name ?? "Term"}</p>
                {r.summary && <p className="text-small text-[var(--ink-2)]">{r.summary}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Published exam results</p>
        {results.length === 0 ? (
          <p className="text-small text-[var(--muted)]">No exam results published yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 text-small">
                <div>
                  <p className="font-medium text-[var(--ink)]">{r.examination.title}</p>
                  <p className="text-tiny text-[var(--muted)]">{r.examination.term?.name ?? ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--ink)]">
                    {r.score}/{r.examination.maxScore}
                  </p>
                  {r.grade && <p className="text-tiny text-[var(--muted)]">Grade {r.grade}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
