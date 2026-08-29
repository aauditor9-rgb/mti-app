"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { staff } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { clearViewerStaffId, setViewerStaffId } from "@/lib/session";

export async function pickTeacherStaff(staffId: string) {
  const madrasah = await getMadrasah();
  const [row] = await db.select().from(staff).where(eq(staff.id, staffId)).limit(1);
  if (!row || row.madrasahId !== madrasah.id || !row.portalAccess) {
    return { ok: false, message: "That staff member doesn't have portal access." };
  }
  await setViewerStaffId(staffId);
  redirect("/teacher");
}

export async function logOutTeacher() {
  await clearViewerStaffId();
  redirect("/teacher");
}
