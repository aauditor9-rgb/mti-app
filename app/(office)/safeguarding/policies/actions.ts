"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { policyStaffAck } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function toggleStaffAck(ackId: string, acknowledged: boolean) {
  const madrasah = await getMadrasah();
  await db
    .update(policyStaffAck)
    .set({ acknowledgedAt: acknowledged ? new Date() : null })
    .where(and(eq(policyStaffAck.id, ackId), eq(policyStaffAck.madrasahId, madrasah.id)));

  revalidatePath("/safeguarding/policies");
  return { ok: true };
}
