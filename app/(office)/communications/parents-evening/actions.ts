"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { parentsEveningSession, parentsEveningSlot } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createParentsEveningSession(formData: FormData) {
  const madrasah = await getMadrasah();
  const date = String(formData.get("date") ?? "");
  if (!date) return { ok: false, message: "Choose a date." };

  await db.insert(parentsEveningSession).values({ madrasahId: madrasah.id, date });
  revalidatePath("/communications/parents-evening");
  return { ok: true };
}

export async function addParentsEveningSlot(formData: FormData) {
  const madrasah = await getMadrasah();
  const sessionId = String(formData.get("sessionId") ?? "");
  const staffId = String(formData.get("staffId") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!sessionId || !staffId || !time) return { ok: false, message: "Choose a teacher and a time." };

  const [session] = await db.select().from(parentsEveningSession).where(eq(parentsEveningSession.id, sessionId)).limit(1);
  if (!session || session.madrasahId !== madrasah.id) return { ok: false, message: "Session not found." };

  await db
    .insert(parentsEveningSlot)
    .values({ madrasahId: madrasah.id, sessionId, staffId, time })
    .onConflictDoNothing({ target: [parentsEveningSlot.sessionId, parentsEveningSlot.staffId, parentsEveningSlot.time] });

  revalidatePath("/communications/parents-evening");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
