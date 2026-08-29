"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pupil } from "@/lib/db/schema";
import { clearPendingPupilId, clearViewerPupilId, getPendingPupilId, setViewerPupilId } from "@/lib/session";

export async function verifyPupilPasscode(passcode: string) {
  const pendingPupilId = await getPendingPupilId();
  if (!pendingPupilId) return { ok: false, message: "Ask a parent to hand you the device from the Parent portal." };

  const [row] = await db.select().from(pupil).where(eq(pupil.id, pendingPupilId)).limit(1);
  if (!row) return { ok: false, message: "Pupil not found." };
  if (!row.passcode || row.passcode !== passcode) return { ok: false, message: "That passcode isn't right." };

  await setViewerPupilId(pendingPupilId);
  await clearPendingPupilId();
  redirect("/pupil");
}

export async function backToParent() {
  await clearViewerPupilId();
  redirect("/parent");
}
