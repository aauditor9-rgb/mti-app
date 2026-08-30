"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { madrasah } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function updateBranding(formData: FormData) {
  const madrasahRow = await getMadrasah();
  const name = String(formData.get("name") ?? "").trim();
  const brandAccent = String(formData.get("brandAccent") ?? "").trim();

  if (!name) return { ok: false, message: "Enter a madrasah name." };
  if (!/^#[0-9a-fA-F]{6}$/.test(brandAccent)) return { ok: false, message: "Accent colour must be a hex value like #C2603C." };

  await db.update(madrasah).set({ name, brandAccent }).where(eq(madrasah.id, madrasahRow.id));

  revalidatePath("/settings/branding");
  return { ok: true };
}
