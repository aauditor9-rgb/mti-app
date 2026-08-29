// Concern categories, severities and statuses — the fixed vocabularies from
// design/README.md "Concerns", read everywhere a concern is created or filtered.

export const CONCERN_CATEGORIES = [
  "Talking",
  "Disruption",
  "Incomplete work",
  "Poor effort",
  "Disrespect",
  "Uniform issue",
  "Repeated lateness",
  "Unsafe conduct",
  "Bullying",
  "Other",
] as const;
export type ConcernCategory = (typeof CONCERN_CATEGORIES)[number];

export const CONCERN_SEVERITIES = ["Low", "Medium", "High"] as const;
export type ConcernSeverity = (typeof CONCERN_SEVERITIES)[number];

export const CONCERN_STATUSES = ["Open", "Action taken", "Parent informed", "Resolved"] as const;
export type ConcernStatus = (typeof CONCERN_STATUSES)[number];

// A High-severity concern always notifies safeguarding automatically — see the
// `concern` table comment in lib/db/schema.ts for why this stops at a data field
// rather than the full DSL-gated safeguarding case system.
export function autoNotifiesSafeguarding(severity: ConcernSeverity): boolean {
  return severity === "High";
}
