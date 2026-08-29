"use client";

import { useTransition } from "react";
import { bookParentsEveningSlot } from "@/app/parent/requests/actions";

export function BookSlotButton({ slotId, pupilId, booked, full }: { slotId: string; pupilId: string; booked: boolean; full: boolean }) {
  const [pending, startTransition] = useTransition();

  function book() {
    startTransition(async () => {
      await bookParentsEveningSlot(slotId, pupilId);
    });
  }

  if (booked) {
    return <span className="rounded-full bg-[var(--success-bg)] px-2.5 py-1 text-tiny font-medium text-[var(--success)]">Booked</span>;
  }

  return (
    <button
      onClick={book}
      disabled={pending || full}
      className="rounded-full bg-primary px-3 py-1 text-tiny font-medium text-primary-foreground disabled:opacity-50"
    >
      {full ? "Full" : "Book"}
    </button>
  );
}
