import { HomeworkChecklist } from "@/components/office/homework-checklist";
import { cn } from "@/lib/utils";
import { getCurrentStaff, getHomework, getMadrasah, getTeacherClasses, listHomework } from "@/lib/db/queries";

const TONE_STYLE = {
  success: "bg-[var(--success)]",
  warn: "bg-[var(--warn-bg)]",
  alert: "bg-[var(--alert)]",
} as const;

export default async function TeacherHomeworkReviewPage() {
  const madrasah = await getMadrasah();
  const staff = await getCurrentStaff(madrasah.id);
  if (!staff) return null;

  const classes = await getTeacherClasses(madrasah.id, staff.id);
  const activeClass = classes[0];

  if (!activeClass) {
    return (
      <p className="mx-auto max-w-2xl rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
        You aren&apos;t set as the lead teacher of any class yet.
      </p>
    );
  }

  const allHomework = await listHomework(madrasah.id);
  const classHomework = allHomework.filter((h) => h.classId === activeClass.id);
  const details = await Promise.all(classHomework.map((h) => getHomework(madrasah.id, h.id)));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <p className="text-tiny font-medium tracking-wide text-[var(--muted)] uppercase">{activeClass.name}</p>
        <h1 className="font-heading text-h2 font-medium text-[var(--ink)]">Homework Review</h1>
      </div>

      {details.length === 0 ? (
        <p className="rounded-xl border border-border bg-[var(--surface)] p-8 text-center text-small text-[var(--muted)]">
          No homework set for {activeClass.name} yet. Use Set Work to assign a task — you&apos;ll track parent acknowledgement
          here.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {details.map((item) => {
            if (!item) return null;
            return (
              <div key={item.id} className="rounded-xl border border-border bg-[var(--surface)] p-5">
                <h2 className="font-heading text-h4 font-medium text-[var(--ink)]">{item.subject}</h2>
                <p className="text-small text-[var(--ink)]">{item.task}</p>
                <p className="mt-1 text-tiny text-[var(--muted)]">
                  Due {item.dueDate}
                  {item.setBy && <> · set by {item.setBy.name}</>}
                  {item.audience === "Selected students" && " · selected students only"}
                </p>
                <div className="mt-3">
                  <div className="h-[7px] overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className={cn("h-full rounded-full", TONE_STYLE[item.progress.tone])} style={{ width: `${item.progress.donePct}%` }} />
                  </div>
                  <p className="mt-1 text-tiny text-[var(--muted)]">
                    {item.progress.label} · {item.progress.doneCount}/{item.progress.totalCount}
                  </p>
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  {item.submissions.length === 0 ? (
                    <p className="text-small text-[var(--muted)]">No students to review.</p>
                  ) : (
                    <HomeworkChecklist
                      submissions={item.submissions.map((s) => ({
                        id: s.id,
                        completed: s.completed,
                        pupilDisplayId: s.pupil?.displayId ?? "",
                        pupilName: s.pupil?.name ?? "Unknown pupil",
                      }))}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
