// Provisional viewer session (design/TECH_STACK.md build order item 1 — "schema + RLS +
// auth + tenant bootstrap" — isn't built; this is the honest stand-in). A cookie records
// which staff member or guardian is "signed in", mirroring the prototype's own demo
// account picker (design/README.md sign-in modal). No password, no verification — anyone
// can pick any name, exactly like the prototype. Replace with real Supabase Auth
// sessions when that's built; every call site below is a single choke point for that swap.
import { cookies } from "next/headers";

const STAFF_COOKIE = "mti_viewer_staff";
const GUARDIAN_COOKIE = "mti_viewer_guardian";
const PUPIL_COOKIE = "mti_viewer_pupil";
const PENDING_PUPIL_COOKIE = "mti_pupil_pending";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getViewerStaffId(): Promise<string | null> {
  const store = await cookies();
  return store.get(STAFF_COOKIE)?.value ?? null;
}

export async function setViewerStaffId(staffId: string) {
  const store = await cookies();
  store.set(STAFF_COOKIE, staffId, COOKIE_OPTIONS);
}

export async function clearViewerStaffId() {
  const store = await cookies();
  store.delete(STAFF_COOKIE);
}

export async function getViewerGuardianId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUARDIAN_COOKIE)?.value ?? null;
}

export async function setViewerGuardianId(guardianId: string) {
  const store = await cookies();
  store.set(GUARDIAN_COOKIE, guardianId, COOKIE_OPTIONS);
}

export async function clearViewerGuardianId() {
  const store = await cookies();
  store.delete(GUARDIAN_COOKIE);
  // Handing the device back to a parent also ends the pupil's own sub-session.
  store.delete(PUPIL_COOKIE);
}

// The pupil sub-session (design/README.md "Pupil ... reached only by a 4-digit passcode
// gate from inside the parent portal"). Short-lived by design — cleared whenever the
// guardian session ends, and meant to be handed back after one sitting.
export async function getViewerPupilId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PUPIL_COOKIE)?.value ?? null;
}

export async function setViewerPupilId(pupilId: string) {
  const store = await cookies();
  store.set(PUPIL_COOKIE, pupilId, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 6 });
}

export async function clearViewerPupilId() {
  const store = await cookies();
  store.delete(PUPIL_COOKIE);
}

// Set the moment a guardian taps "Hand to <child>" — names which pupil the passcode
// gate on /pupil should check against, before the passcode itself is entered.
export async function getPendingPupilId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PENDING_PUPIL_COOKIE)?.value ?? null;
}

export async function setPendingPupilId(pupilId: string) {
  const store = await cookies();
  store.set(PENDING_PUPIL_COOKIE, pupilId, { ...COOKIE_OPTIONS, maxAge: 60 * 10 });
}

export async function clearPendingPupilId() {
  const store = await cookies();
  store.delete(PENDING_PUPIL_COOKIE);
}
