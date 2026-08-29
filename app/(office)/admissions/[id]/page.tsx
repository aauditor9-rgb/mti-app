import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicantControls } from "@/components/office/applicant-controls";
import { ageFromDob } from "@/lib/derive/age";
import { slaStatus, type AdmissionStage } from "@/lib/derive/admissions";
import { getApplicant, getMadrasah, listClasses } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function ApplicantDetailPage(props: PageProps<"/admissions/[id]">) {
  const { id } = await props.params;
  const madrasah = await getMadrasah();
  const [applicant, classes] = await Promise.all([getApplicant(madrasah.id, id), listClasses(madrasah.id)]);
  if (!applicant) notFound();

  const sla = slaStatus(applicant.stage as AdmissionStage, applicant.stageEnteredAt);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">People</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Admissions</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link
          href="/admissions"
          className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-3.5" /> Back to admissions
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-heading text-h3 font-medium text-[var(--ink)]">
              {applicant.firstName} {applicant.lastName}
            </h2>
            <p className="text-small text-[var(--ink-2)]">
              {applicant.requestedYear} · Age {ageFromDob(applicant.dob)} · {applicant.gender === "M" ? "Boy" : "Girl"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-tiny font-medium",
                applicant.priority.band === "High" && "bg-[var(--alert-bg)] text-[var(--alert)]",
                applicant.priority.band === "Medium" && "bg-[var(--warn-bg)] text-[var(--ink-2)]",
                applicant.priority.band === "Standard" && "bg-[var(--surface-2)] text-[var(--muted)]",
              )}
            >
              {applicant.priority.band} priority · {applicant.priority.score}
            </span>
            {sla.slaDays !== null && (
              <span className={cn("text-tiny", sla.overdue ? "font-medium text-[var(--alert)]" : "text-[var(--muted)]")}>
                {sla.daysInStage}d of {sla.slaDays}d SLA{sla.overdue ? " · overdue" : ""}
              </span>
            )}
          </div>
        </div>

        {applicant.priority.reasons.length > 0 && (
          <p className="mt-2 text-tiny text-[var(--muted)]">{applicant.priority.reasons.join(" · ")}</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Guardian</p>
            <p className="text-body text-[var(--ink)]">{applicant.guardianName}</p>
            <p className="text-small text-[var(--ink-2)]">{applicant.guardianPhone}</p>
            {applicant.guardianEmail && <p className="text-small text-[var(--ink-2)]">{applicant.guardianEmail}</p>}
          </div>
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Submitted</p>
            <p className="text-body text-[var(--ink)]">{applicant.submittedAt}</p>
            <p className="text-small text-[var(--ink-2)]">
              Qur&apos;an: {applicant.quranLevel || "Not started"}
            </p>
          </div>
          {applicant.note && (
            <div className="sm:col-span-2">
              <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Note</p>
              <p className="text-body text-[var(--ink)]">{applicant.note}</p>
            </div>
          )}
          {applicant.class && (
            <div>
              <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Allocated class</p>
              <p className="text-body text-[var(--ink)]">{applicant.class.name}</p>
            </div>
          )}
          {applicant.stage === "Declined" && applicant.declineReason && (
            <div className="sm:col-span-2">
              <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Decline reason</p>
              <p className="text-body text-[var(--ink)]">{applicant.declineReason}</p>
            </div>
          )}
          {applicant.enrolledPupil && (
            <div className="sm:col-span-2 rounded-lg bg-[var(--success-bg)] p-3">
              <p className="text-small font-medium text-[var(--success)]">
                Enrolled as a pupil —{" "}
                <Link href="/students" className="underline">
                  view student records
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <ApplicantControls
            applicantId={applicant.id}
            stage={applicant.stage as AdmissionStage}
            classId={applicant.classId}
            classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Stage log</p>
          <div className="flex flex-col gap-1.5">
            {applicant.stageLog.map((l) => (
              <p key={l.id} className="text-small text-[var(--ink-2)]">
                <span className="font-medium text-[var(--ink)]">{l.stage}</span> · {fmtDateTime(l.changedAt.toISOString())}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
