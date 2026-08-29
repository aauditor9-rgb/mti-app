// Fees (design/README.md "Fees"). Charges are generated once per pupil per academic
// year from madrasah's fee config + the calendar's terms; every line's paid/due/overdue
// status is derived by allocating a household's cumulative payments across its lines
// oldest-due-first (invariant 1) — never stored, never toggled by hand.
//
// The prototype's own example family shows Term 3 marked "paid" while the earlier
// Term 1/2 lines show "due"/"overdue" — inconsistent with any single allocation rule
// (same kind of prototype gap found in Homework/Du'as/Surahs this build). This uses a
// real, consistent oldest-due-date-first allocation instead.
import { todayLondon } from "./age";

export type FeeLineKind = "Enrolment" | "Tuition" | "Discount";

export type FeeLineInput = {
  id: string;
  kind: FeeLineKind;
  label: string;
  amount: number;
  dueDate: string;
};

export type FeeLineStatus = "Paid" | "Due" | "Overdue";

export type FeeLineWithStatus = FeeLineInput & { status: FeeLineStatus };

export function computeHouseholdFeeSummary(lines: FeeLineInput[], totalPaid: number, today: string = todayLondon()) {
  const sorted = [...lines].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  let remaining = totalPaid;
  let shortfallHit = false;
  const withStatus: FeeLineWithStatus[] = sorted.map((line) => {
    if (line.amount <= 0) {
      // Discount lines reduce what's owed automatically — nothing to "pay".
      return { ...line, status: "Paid" as const };
    }
    if (!shortfallHit && remaining >= line.amount) {
      remaining -= line.amount;
      return { ...line, status: "Paid" as const };
    }
    shortfallHit = true;
    return { ...line, status: (line.dueDate < today ? "Overdue" : "Due") as FeeLineStatus };
  });

  const totalInvoiced = lines.reduce((sum, l) => sum + l.amount, 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);
  const overdueLines = withStatus.filter((l) => l.status === "Overdue");
  const dueLines = withStatus.filter((l) => l.status === "Due");

  const householdStatus: "Overdue" | "Due" | "Settled" =
    overdueLines.length > 0 ? "Overdue" : dueLines.length > 0 ? "Due" : "Settled";

  const nextDue = [...dueLines, ...overdueLines].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;

  return {
    lines: withStatus,
    totalInvoiced,
    totalPaid: Math.min(totalPaid, totalInvoiced),
    totalOutstanding,
    householdStatus,
    nextDueDate: nextDue?.dueDate ?? null,
  };
}

export function generateFeeLinesForPupil(input: {
  pupilId: string;
  enrolmentFee: number;
  termlyTuitionFee: number;
  siblingDiscountPct: number;
  isSibling: boolean;
  enrolledOn: string;
  terms: { id: string; name: string; startDate: string }[];
}) {
  const lines: { pupilId: string; kind: FeeLineKind; label: string; termId: string | null; amount: number; dueDate: string }[] = [
    {
      pupilId: input.pupilId,
      kind: "Enrolment",
      label: "Enrolment Fee",
      termId: null,
      amount: input.enrolmentFee,
      dueDate: input.enrolledOn,
    },
  ];

  for (const term of input.terms) {
    lines.push({
      pupilId: input.pupilId,
      kind: "Tuition",
      label: `${term.name} Tuition`,
      termId: term.id,
      amount: input.termlyTuitionFee,
      dueDate: term.startDate,
    });
    if (input.isSibling && input.siblingDiscountPct > 0) {
      const discount = Math.round(input.termlyTuitionFee * (input.siblingDiscountPct / 100) * 100) / 100;
      lines.push({
        pupilId: input.pupilId,
        kind: "Discount",
        label: `${term.name} Sibling Discount (${input.siblingDiscountPct}%)`,
        termId: term.id,
        amount: -discount,
        dueDate: term.startDate,
      });
    }
  }

  return lines;
}
