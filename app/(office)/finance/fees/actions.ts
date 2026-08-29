"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { feePayment, household } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";
import { generateFeeInvoicesForAllEnrolled } from "@/lib/db/fee-generation";

export async function recordPayment(formData: FormData) {
  const householdId = String(formData.get("householdId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const amount = Number(amountRaw);

  if (!householdId || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Enter a valid payment amount." };
  }

  const madrasah = await getMadrasah();
  const [householdRow] = await db.select().from(household).where(eq(household.id, householdId)).limit(1);
  if (!householdRow || householdRow.madrasahId !== madrasah.id) {
    return { ok: false, message: "Household not found." };
  }

  await db.insert(feePayment).values({
    madrasahId: madrasah.id,
    householdId,
    amount: String(amount),
    paidAt: new Date().toISOString().slice(0, 10),
    note: note || null,
  });

  revalidatePath("/finance/fees");
  return { ok: true };
}

// Backfills invoices for any enrolled pupil that doesn't have any yet (e.g. a pupil
// enrolled via Admissions after the last generation pass) — safe to call repeatedly,
// see lib/db/fee-generation.ts.
export async function generateMissingInvoices() {
  const madrasah = await getMadrasah();
  const result = await generateFeeInvoicesForAllEnrolled(madrasah.id);
  revalidatePath("/finance/fees");
  return result;
}
