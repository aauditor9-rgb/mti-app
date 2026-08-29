"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { staff, staffRoleEnum } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

function orNull(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

export async function addStaffMember(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "Teacher");

  if (!name) return { ok: false, message: "Enter a name." };
  if (!staffRoleEnum.enumValues.includes(role as (typeof staffRoleEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid role." };
  }

  const madrasah = await getMadrasah();
  await db.insert(staff).values({
    madrasahId: madrasah.id,
    name,
    role: role as (typeof staffRoleEnum.enumValues)[number],
    title: orNull(formData.get("title")),
    phone: orNull(formData.get("phone")),
    email: orNull(formData.get("email")),
    payRate: orNull(formData.get("payRate")),
    hours: orNull(formData.get("hours")),
    portalAccess: formData.get("portalAccess") === "on",
    dbsExpiry: orNull(formData.get("dbsExpiry")),
    firstAidExpiry: orNull(formData.get("firstAidExpiry")),
    safeguardingExpiry: orNull(formData.get("safeguardingExpiry")),
  });

  revalidatePath("/staff/directory");
  return { ok: true };
}
