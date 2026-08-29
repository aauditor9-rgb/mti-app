import Link from "next/link";
import { AddExaminationForm } from "@/components/office/add-examination-form";
import { getMadrasah, listExaminations, listTermsForMadrasah } from "@/lib/db/queries";

export default async function ExaminationsPage() {
  const madrasah = await getMadrasah();
  const [examinations, terms] = await Promise.all([listExaminations(madrasah.id), listTermsForMadrasah(madrasah.id)]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Examinations</h1>
      </div>

      <AddExaminationForm terms={terms.map((t) => ({ id: t.id, name: t.name }))} />

      {examinations.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No examinations set up yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {examinations.map((e) => (
            <Link key={e.id} href={`/examinations/${e.id}`} className="rounded-xl border border-border bg-[var(--surface)] p-4 hover:border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--ink)]">{e.title}</p>
                  <p className="text-small text-[var(--muted)]">
                    {e.term?.name ?? "No term"} {e.examDate && `· ${e.examDate}`} · {e.results.length} result{e.results.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-tiny text-[var(--muted)]">{e.publishedAt ? "Published" : "Draft"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
