"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { firstAidLogEntry } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function addFirstAidLogEntry(formData: FormData) {
  const pupilId = String(formData.get("pupilId") ?? "");
  const date = String(formData.get("date") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const loggedByStaffId = String(formData.get("loggedByStaffId") ?? "").trim() || null;

  if (!pupilId || !date || !note) {
    return { ok: false, message: "Choose a pupil, date and enter what happened." };
  }

  const madrasah = await getMadrasah();
  await db.insert(firstAidLogEntry).values({ madrasahId: madrasah.id, pupilId, date, note, loggedByStaffId });

  revalidatePath("/safeguarding/medical");
  return { ok: true };
}
