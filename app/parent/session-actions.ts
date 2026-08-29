"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { guardian } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { clearViewerGuardianId, setViewerGuardianId } from "@/lib/session";

export async function pickParentGuardian(guardianId: string) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(guardian).where(eq(guardian.id, guardianId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id) {
    return { ok: false, message: "That guardian couldn't be found." };
  }
  await setViewerGuardianId(guardianId);
  redirect("/parent");
}

export async function logOutParent() {
  await clearViewerGuardianId();
  redirect("/parent");
}
