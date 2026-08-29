import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExamResultRow } from "@/components/office/exam-result-row";
import { PublishExamButton } from "@/components/office/publish-exam-button";
import { getExamination, getMadrasah } from "@/lib/db/queries";

export default async function ExaminationDetailPage(props: PageProps<"/examinations/[id]">) {
  const { id } = await props.params;
  const madrasah = await getMadrasah();
  const exam = await getExamination(madrasah.id, id);
  if (!exam) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">{exam.title}</h1>
      </div>

      <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
        <Link href="/examinations" className="mb-4 inline-flex items-center gap-1 text-small font-medium text-[var(--ink-2)] hover:text-[var(--ink)]">
          <ArrowLeft className="size-3.5" /> Back to examinations
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-small text-[var(--ink-2)]">
            {exam.term?.name ?? "No term"} {exam.examDate && `· ${exam.examDate}`} · out of {exam.maxScore}
          </p>
          <PublishExamButton examinationId={exam.id} published={!!exam.publishedAt} />
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          {exam.pupilRows.map(({ pupil, result }) => (
            <ExamResultRow key={pupil.id} examinationId={exam.id} pupilId={pupil.id} pupilName={pupil.name} score={result?.score ?? null} grade={result?.grade ?? null} />
          ))}
        </div>
      </div>
    </div>
  );
}
