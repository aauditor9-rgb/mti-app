"use client";

import { useState, useTransition } from "react";
import { saveExamResult } from "@/app/(office)/examinations/actions";

export function ExamResultRow({
  examinationId,
  pupilId,
  pupilName,
  score,
  grade,
}: {
  examinationId: string;
  pupilId: string;
  pupilName: string;
  score: number | null;
  grade: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [scoreValue, setScoreValue] = useState(score?.toString() ?? "");
  const [gradeValue, setGradeValue] = useState(grade ?? "");

  function save() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("examinationId", examinationId);
      formData.set("pupilId", pupilId);
      formData.set("score", scoreValue);
      formData.set("grade", gradeValue);
      await saveExamResult(formData);
    });
  }

  return (
    <div className="flex items-center gap-3 border-t border-border p-3 first:border-t-0 text-small">
      <span className="flex-1 text-[var(--ink)]">{pupilName}</span>
      <input
        value={scoreValue}
        onChange={(e) => setScoreValue(e.target.value)}
        onBlur={save}
        placeholder="Score"
        type="number"
        className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-small"
      />
      <input
        value={gradeValue}
        onChange={(e) => setGradeValue(e.target.value)}
        onBlur={save}
        placeholder="Grade"
        className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-small"
      />
      {pending && <span className="text-tiny text-[var(--muted)]">Saving…</span>}
    </div>
  );
}
