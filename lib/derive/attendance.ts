// Attendance codes and the register-close time — single source, read everywhere a mark
// or a register's lock state is shown. See design/README.md "Attendance" and invariant 1.

export const ATTENDANCE_CODES = ["P", "L", "I", "F", "T", "A", "U"] as const;
export type AttendanceCode = (typeof ATTENDANCE_CODES)[number];

// Registers close at 5:05pm — a single constant, never hardcoded on a screen (invariant 1).
export const REGISTER_CLOSE_TIME = "17:05";

export const ATTENDANCE_LABELS: Record<AttendanceCode, string> = {
  P: "Present",
  L: "Late",
  I: "Illness",
  F: "Family reason",
  T: "Travel",
  A: "Authorised other",
  U: "Unexplained",
};

// I/F/T/A are authorised absences; U is unauthorised.
export function isAuthorisedAbsence(code: AttendanceCode): boolean {
  return code === "I" || code === "F" || code === "T" || code === "A";
}

export function isAbsence(code: AttendanceCode): boolean {
  return code !== "P" && code !== "L";
}
