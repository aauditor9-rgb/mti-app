import { HubTabs } from "@/components/office/hub-tabs";
import { EXAMINATIONS_TABS } from "@/lib/office-hubs";

export default function ExamBankPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <HubTabs tabs={EXAMINATIONS_TABS} />
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Reports &amp; Assessment · Examinations</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Exam Bank</h1>
        <p className="text-small text-[var(--muted)]">A reusable library of exam papers and questions.</p>
      </div>

      <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        Not built yet — no exam papers are stored anywhere in this app to show here honestly.
      </p>
    </div>
  );
}
