import { AddFormTemplateForm } from "@/components/office/add-form-template-form";
import { FormTemplateCard } from "@/components/office/form-template-card";
import { getFormTemplateResponses, getMadrasah, listFormTemplates } from "@/lib/db/queries";

export default async function FormsPage() {
  const madrasah = await getMadrasah();
  const templates = await listFormTemplates(madrasah.id);
  const responsesByTemplate = await Promise.all(templates.map((t) => getFormTemplateResponses(madrasah.id, t.id)));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Operations · Communications</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Forms &amp; Consent</h1>
        <p className="text-small text-[var(--muted)]">
          Reusable digital forms with completion tracking — issued to every household currently on roll.
        </p>
      </div>

      <AddFormTemplateForm />

      <div className="flex flex-col gap-2">
        {templates.length === 0 ? (
          <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
            No forms issued yet.
          </p>
        ) : (
          templates.map((t, i) => (
            <FormTemplateCard
              key={t.id}
              title={t.title}
              audienceLabel={t.audienceLabel}
              deadline={t.deadline}
              totalCount={t.totalCount}
              completedCount={t.completedCount}
              outstandingCount={t.outstandingCount}
              responses={responsesByTemplate[i]}
            />
          ))
        )}
      </div>
    </div>
  );
}
