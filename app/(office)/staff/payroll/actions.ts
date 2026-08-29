"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { staffPayrollRecord } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function togglePayrollPaid(staffId: string, month: string, paid: boolean) {
  const madrasah = await getMadrasah();

  await db
    .insert(staffPayrollRecord)
    .values({ madrasahId: madrasah.id, staffId, month, paid, paidAt: paid ? new Date() : null })
    .onConflictDoUpdate({
      target: [staffPayrollRecord.staffId, staffPayrollRecord.month],
      set: { paid, paidAt: paid ? new Date() : null },
    });

  revalidatePath("/staff/payroll");
  return { ok: true };
}
