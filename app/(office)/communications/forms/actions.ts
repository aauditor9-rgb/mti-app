"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { formResponse, formTemplate } from "@/lib/db/schema";
import { getMadrasah, listPupils } from "@/lib/db/queries";

export async function createFormTemplate(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const audienceLabel = String(formData.get("audienceLabel") ?? "All years").trim() || "All years";
  const deadline = String(formData.get("deadline") ?? "");

  if (!title || !deadline) return { ok: false, message: "Enter a title and deadline." };

  const madrasah = await getMadrasah();
  const [row] = await db
    .insert(formTemplate)
    .values({ madrasahId: madrasah.id, title, audienceLabel, deadline })
    .returning();

  const pupils = await listPupils(madrasah.id);
  const householdIds = [...new Set(pupils.filter((p) => p.enrolmentState === "Enrolled" && p.householdId).map((p) => p.householdId!))];
  if (householdIds.length > 0) {
    await db.insert(formResponse).values(
      householdIds.map((householdId) => ({ madrasahId: madrasah.id, formTemplateId: row.id, householdId })),
    );
  }

  revalidatePath("/communications/forms");
  return { ok: true };
}

export async function toggleFormResponse(responseId: string, completed: boolean) {
  const madrasah = await getMadrasah();
  await db
    .update(formResponse)
    .set({ completedAt: completed ? new Date() : null })
    .where(and(eq(formResponse.id, responseId), eq(formResponse.madrasahId, madrasah.id)));

  revalidatePath("/communications/forms");
  return { ok: true };
}
