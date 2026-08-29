"use client";

import { useTransition } from "react";
import { togglePublishExamination } from "@/app/(office)/examinations/actions";

export function PublishExamButton({ examinationId, published }: { examinationId: string; published: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await togglePublishExamination(examinationId, !published);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={
        published
          ? "rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-small font-medium text-[var(--ink-2)] disabled:opacity-50"
          : "rounded-lg bg-primary px-3 py-1.5 text-small font-medium text-primary-foreground disabled:opacity-50"
      }
    >
      {published ? "Unpublish" : "Publish results"}
    </button>
  );
}
