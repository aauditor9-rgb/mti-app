import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ageFromDob } from "@/lib/derive/age";
import { getMadrasah, getPupil } from "@/lib/db/queries";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Attendance", "Learning", "Welfare", "Finance", "History"];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function StudentDetailPage(props: PageProps<"/students/[id]">) {
  const { id } = await props.params;
  const madrasah = await getMadrasah();
  const pupil = await getPupil(madrasah.id, id);
  if (!pupil) notFound();

  const guardians = pupil.household?.guardians ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Students</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Student Records</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link
          href="/students"
          className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-3.5" /> Back to student records
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-body font-medium text-primary-foreground">
              {initials(pupil.name)}
            </div>
            <div>
              <h2 className="font-heading text-h4 font-medium text-[var(--ink)]">{pupil.name}</h2>
              <p className="text-small text-[var(--muted)]">
                {pupil.displayId} · {pupil.class?.name ?? "Unallocated"} · Age {ageFromDob(pupil.dob)} ·{" "}
                {pupil.gender === "M" ? "Boy" : "Girl"}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-tiny font-medium",
              pupil.enrolmentState === "Enrolled" && "bg-[var(--success-bg)] text-[var(--success)]",
              pupil.enrolmentState === "Left" && "bg-[var(--warn-bg)] text-[var(--ink-2)]",
              pupil.enrolmentState === "Archived" && "bg-[var(--surface-2)] text-[var(--muted)]",
            )}
          >
            {pupil.enrolmentState}
          </span>
        </div>

        <div className="mt-4 flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <span
              key={tab}
              className={cn(
                "rounded-t-lg px-3 py-2 text-small font-medium",
                tab === "Overview"
                  ? "border-b-2 border-primary text-[var(--primary)]"
                  : "text-[var(--muted-2)]",
              )}
              title={tab === "Overview" ? undefined : "Not built yet"}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 py-5 sm:grid-cols-3">
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Date of birth</p>
            <p className="text-body text-[var(--ink)]">{pupil.dob}</p>
          </div>
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Class</p>
            <p className="text-body text-[var(--ink)]">{pupil.class?.name ?? "Unallocated"}</p>
          </div>
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Allergies</p>
            <p className="text-body text-[var(--ink)]">{pupil.allergies}</p>
          </div>
          <div>
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Medical notes</p>
            <p className="text-body text-[var(--ink)]">{pupil.medicalNotes}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Learning notes</p>
            <p className="text-body text-[var(--ink)]">{pupil.learningNotes}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Household</p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {guardians.map((g) => (
              <div key={g.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[var(--ink)]">{g.name}</p>
                  <Badge variant="outline">{g.relation}</Badge>
                </div>
                <p className="mt-1 text-small text-[var(--ink-2)]">{g.phone}</p>
                {g.email && <p className="text-small text-[var(--ink-2)]">{g.email}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
