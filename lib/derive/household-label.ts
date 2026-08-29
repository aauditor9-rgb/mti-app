// The one derivation for a household's display name — read everywhere a household is
// shown (student list, student detail). See design/README.md invariant 1.
export function householdLabel(guardians: { name: string; relation: string }[]): string {
  const father = guardians.find((g) => g.relation === "Father");
  const primary = father ?? guardians[0];
  if (!primary) return "Household";
  const parts = primary.name.trim().split(/\s+/);
  return `${parts[parts.length - 1]} household`;
}
