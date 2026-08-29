// Homework acknowledgement progress — one derivation, read by the list and detail
// views alike (invariant 1). Matches design/README.md's set-work → publish → review
// flow, but computed live from homework_submission rows instead of a stored percentage.

export type HomeworkProgress = {
  donePct: number;
  doneCount: number;
  totalCount: number;
  label: string;
  tone: "success" | "warn" | "alert";
};

export function computeHomeworkProgress(submissions: { completed: boolean }[]): HomeworkProgress {
  const totalCount = submissions.length;
  const doneCount = submissions.filter((s) => s.completed).length;
  const donePct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const tone: HomeworkProgress["tone"] = donePct >= 70 ? "success" : donePct >= 50 ? "warn" : "alert";
  const label = doneCount === 0 ? "Just set — awaiting completion" : `${donePct}% complete`;

  return { donePct, doneCount, totalCount, label, tone };
}
