// Viewer identity. Staff/guardian identity is derived from the real Supabase Auth
// session (see middleware.ts + lib/supabase/*) joined against staff.user_id /
// guardian.user_id — there is no separate "who's signed in" cookie for them any more.
// Every call site was already routed through getViewerStaffId()/getViewerGuardianId(),
// which is what made this swap a one-file change.
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { guardian, staff } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

const PUPIL_COOKIE = "mti_viewer_pupil";
const PENDING_PUPIL_COOKIE = "mti_pupil_pending";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getViewerStaffId(): Promise<string | null> {
  const authUserId = await getAuthUserId();
  if (!authUserId) return null;
  const [row] = await db.select({ id: staff.id }).from(staff).where(eq(staff.userId, authUserId)).limit(1);
  return row?.id ?? null;
}

export async function getViewerGuardianId(): Promise<string | null> {
  const authUserId = await getAuthUserId();
  if (!authUserId) return null;
  const [row] = await db.select({ id: guardian.id }).from(guardian).where(eq(guardian.userId, authUserId)).limit(1);
  return row?.id ?? null;
}

export async function signOutViewer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(PUPIL_COOKIE);
  store.delete(PENDING_PUPIL_COOKIE);
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
