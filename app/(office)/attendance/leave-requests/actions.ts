"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leaveRequest, leaveRequestStatusEnum } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function decideLeaveRequest(requestId: string, status: (typeof leaveRequestStatusEnum.enumValues)[number]) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(leaveRequest).where(eq(leaveRequest.id, requestId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) return { ok: false, message: "Request not found." };

  await db.update(leaveRequest).set({ status, decidedAt: new Date() }).where(eq(leaveRequest.id, requestId));

  revalidatePath("/attendance/leave-requests");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
