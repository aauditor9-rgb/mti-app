import Link from "next/link";
import { HolidayTickButton } from "@/components/parent/holiday-tick-button";
import { cn } from "@/lib/utils";
import { getCurrentGuardian, getHolidayRevisionWindow, getMadrasah, getParentHomeworkList } from "@/lib/db/queries";

export default async function ParentLearningPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; tab?: string }>;
}) {
  const { child, tab = "homework" } = await searchParams;
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return null;
  const activeChild = guardianRow.children.find((c) => c.id === child) ?? guardianRow.children[0];
  if (!activeChild) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{activeChild.name}</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Learning</h1>
      </div>

      <div className="flex gap-2">
        {(["homework", "quiz", "holiday-revision"] as const).map((t) => (
          <Link
            key={t}
            href={`/parent/learning?tab=${t}${child ? `&child=${child}` : ""}`}
            className={cn(
              "rounded-full px-3 py-1 text-small font-medium",
              tab === t ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]",
            )}
          >
            {t === "homework" ? "Homework" : t === "quiz" ? "ʿIlm Quiz" : "Holiday Revision"}
          </Link>
        ))}
      </div>

      {tab === "homework" && <HomeworkTab madrasahId={madrasah.id} pupilId={activeChild.id} />}
      {tab === "quiz" && <QuizTab />}
      {tab === "holiday-revision" && activeChild.classId && (
        <HolidayRevisionTab madrasahId={madrasah.id} classId={activeChild.classId} pupilId={activeChild.id} guardianId={guardianRow.id} />
      )}
    </div>
  );
}

async function HomeworkTab({ madrasahId, pupilId }: { madrasahId: string; pupilId: string }) {
  const submissions = await getParentHomeworkList(madrasahId, pupilId);

  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
      <p className="mb-3 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Homework this week</p>
      {submissions.length === 0 ? (
        <p className="text-small text-[var(--muted)]">No homework set yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {submissions.map((s) => (
            <div key={s.id} className="py-3">
              <p className="text-small font-medium text-[var(--ink)]">{s.homework.subject}</p>
              <p className="text-small text-[var(--ink-2)]">{s.homework.task}</p>
              <p className="mt-1 text-tiny text-[var(--muted)]">
                Due {s.homework.dueDate}
                {s.homework.setBy && <> · set by {s.homework.setBy.name}</>}
                {s.completed && <span className="ml-2 text-[var(--success)]">Done</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizTab() {
  return (
    <div className="rounded-xl border border-border bg-[var(--surface)] p-5">
      <p className="mb-2 text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">Learn together at home</p>
      <p className="text-small text-[var(--ink-2)]">
        Sit with your child and work through a round together — pick their book, then a topic or a single sub-topic. Ten
        multiple-choice questions takes about five minutes.
      </p>
      <p className="mt-3 text-small text-[var(--muted)]">No question bank has been set up yet.</p>
    </div>
  );
}

async function HolidayRevisionTab({
  madrasahId,
  classId,
  pupilId,
  guardianId,
}: {
  madrasahId: string;
  classId: string;
  pupilId: string;
  guardianId: string;
}) {
  const window = await getHolidayRevisionWindow(madrasahId, classId);
  const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

  if (!window || window.days.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        No holiday revision has been set for this class yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[var(--surface)]">
      {window.days.map((d) => {
        const completion = d.completions.find((c) => c.pupilId === pupilId);
        return (
          <div key={d.id} className="flex flex-wrap items-start gap-3 border-t border-border p-3 first:border-t-0">
            <span className="w-24 shrink-0 text-tiny font-medium text-[var(--ink)]">{dateFmt.format(new Date(`${d.date}T00:00:00Z`))}</span>
            <div className="min-w-0 flex-1 text-tiny text-[var(--ink-2)]">
              {d.quranQaaidah && <p>Qur&apos;an/Qā&apos;idah: {d.quranQaaidah}</p>}
              {d.surahMemorisation && <p>Surah: {d.surahMemorisation}</p>}
              {d.islamicStudies && <p>Islamic Studies: {d.islamicStudies}</p>}
              {d.duas && <p>Du&apos;as: {d.duas}</p>}
              {!d.quranQaaidah && !d.surahMemorisation && !d.islamicStudies && !d.duas && <p className="text-[var(--muted)]">Nothing set for this day.</p>}
            </div>
            <HolidayTickButton dayId={d.id} pupilId={pupilId} guardianId={guardianId} completed={!!completion?.completedAt} />
          </div>
        );
      })}
    </div>
  );
}
