"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { signDocument } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createDocument(formData: FormData) {
  const madrasah = await getMadrasah();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title) return { ok: false, message: "Enter a title." };

  await db.insert(signDocument).values({ madrasahId: madrasah.id, title, description });

  revalidatePath("/communications/documents");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
