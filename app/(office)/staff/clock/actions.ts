"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clockModeEnum, madrasah, staffClockEvent } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function clockIn(staffId: string) {
  const madrasahRow = await getMadrasah();
  const [open] = await db
    .select()
    .from(staffClockEvent)
    .where(
      and(
        eq(staffClockEvent.staffId, staffId),
        eq(staffClockEvent.madrasahId, madrasahRow.id),
        isNull(staffClockEvent.clockedOutAt),
      ),
    )
    .limit(1);
  if (open) return { ok: false, message: "Already clocked in." };

  await db.insert(staffClockEvent).values({ madrasahId: madrasahRow.id, staffId, clockedInAt: new Date() });
  revalidatePath("/staff/clock");
  revalidatePath("/teacher", "layout");
  return { ok: true };
}

export async function clockOut(staffId: string) {
  const madrasahRow = await getMadrasah();
  const [open] = await db
    .select()
    .from(staffClockEvent)
    .where(
      and(
        eq(staffClockEvent.staffId, staffId),
        eq(staffClockEvent.madrasahId, madrasahRow.id),
        isNull(staffClockEvent.clockedOutAt),
      ),
    )
    .limit(1);
  if (!open) return { ok: false, message: "Not currently clocked in." };

  await db.update(staffClockEvent).set({ clockedOutAt: new Date() }).where(eq(staffClockEvent.id, open.id));
  revalidatePath("/staff/clock");
  revalidatePath("/teacher", "layout");
  return { ok: true };
}

export async function updateClockSettings(formData: FormData) {
  const requireLocation = formData.get("requireLocationToClockIn") === "on";
  const clockMode = String(formData.get("clockMode") ?? "Sign in & out");

  if (!clockModeEnum.enumValues.includes(clockMode as (typeof clockModeEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid clock mode." };
  }

  const madrasahRow = await getMadrasah();
  await db
    .update(madrasah)
    .set({ requireLocationToClockIn: requireLocation, clockMode: clockMode as (typeof clockModeEnum.enumValues)[number] })
    .where(eq(madrasah.id, madrasahRow.id));

  revalidatePath("/staff/clock");
  revalidatePath("/teacher", "layout");
  return { ok: true };
}
