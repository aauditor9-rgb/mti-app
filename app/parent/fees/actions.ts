"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { documentGuardianSignature, policyGuardianAck } from "@/lib/db/schema";
import { getCurrentGuardian, getMadrasah } from "@/lib/db/queries";

export async function signDocument(documentId: string) {
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return { ok: false, message: "Not signed in." };

  await db
    .insert(documentGuardianSignature)
    .values({ madrasahId: madrasah.id, documentId, guardianId: guardianRow.id, signedAt: new Date() })
    .onConflictDoUpdate({
      target: [documentGuardianSignature.documentId, documentGuardianSignature.guardianId],
      set: { signedAt: new Date() },
    });

  revalidatePath("/parent/fees");
  return { ok: true };
}

export async function acknowledgePolicyAsGuardian(policyId: string) {
  const madrasah = await getMadrasah();
  const guardianRow = await getCurrentGuardian(madrasah.id);
  if (!guardianRow) return { ok: false, message: "Not signed in." };

  await db
    .insert(policyGuardianAck)
    .values({ madrasahId: madrasah.id, policyId, guardianId: guardianRow.id, acknowledgedAt: new Date() })
    .onConflictDoUpdate({
      target: [policyGuardianAck.policyId, policyGuardianAck.guardianId],
      set: { acknowledgedAt: new Date() },
    });

  revalidatePath("/parent/fees");
  return { ok: true };
}
