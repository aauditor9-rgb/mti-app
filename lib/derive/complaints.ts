// Complaints (design/README.md Communications "Complaints"): "acknowledged within 5
// working days and answered within 10 ... more than 3 months after the incident are
// flagged for exceptional-circumstances review." Working days approximated as calendar
// days minus weekends, same level of precision the prototype itself uses.
import { daysBetween } from "./admissions";

export const ACK_SLA_DAYS = 5;
export const RESOLVE_SLA_DAYS = 10;

export function complaintSlaStatus(submittedAt: string, acknowledgedAt: string | null, resolvedAt: string | null) {
  const daysSinceSubmitted = daysBetween(submittedAt);
  const ackOverdue = !acknowledgedAt && daysSinceSubmitted > ACK_SLA_DAYS;
  const resolveOverdue = !resolvedAt && daysSinceSubmitted > RESOLVE_SLA_DAYS;
  return { daysSinceSubmitted, ackOverdue, resolveOverdue };
}
