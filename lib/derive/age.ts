// Age and "today" as local Europe/London calendar dates — never via Date subtraction
// or toISOString(), which shift the day under BST. See design/README.md invariant 6.

export function todayLondon(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

export function ageFromDob(dob: string, today: string = todayLondon()): number {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}
