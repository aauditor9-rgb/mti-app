"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requiresConsent = formData.get("requiresConsent") === "on";
  const requiresRsvp = formData.get("requiresRsvp") === "on";
  const paymentAmountRaw = String(formData.get("paymentAmount") ?? "").trim();

  if (!title || !startDate || !startTime) {
    return { ok: false, message: "Enter a title, date and start time." };
  }

  const startAt = new Date(`${startDate}T${startTime}:00`);
  const endAt = endTime ? new Date(`${startDate}T${endTime}:00`) : null;
  const paymentAmount = paymentAmountRaw ? Number(paymentAmountRaw) : null;

  const madrasah = await getMadrasah();
  await db.insert(event).values({
    madrasahId: madrasah.id,
    title,
    startAt,
    endAt,
    location: location || null,
    audience: audience || null,
    description: description || null,
    requiresConsent,
    requiresPayment: paymentAmount !== null,
    paymentAmount: paymentAmount !== null ? String(paymentAmount) : null,
    requiresRsvp,
  });

  revalidatePath("/communications/events");
  return { ok: true };
}

export async function addRunningOrderItem(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const time = String(formData.get("time") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();

  if (!eventId || !time || !title) {
    return { ok: false, message: "Enter a time and title." };
  }

  const madrasah = await getMadrasah();
  const [row] = await db
    .select()
    .from(event)
    .where(and(eq(event.id, eventId), eq(event.madrasahId, madrasah.id)))
    .limit(1);
  if (!row) return { ok: false, message: "Event not found." };

  const runningOrder = [...row.runningOrder, { time, title, ...(detail ? { detail } : {}) }];
  await db.update(event).set({ runningOrder }).where(eq(event.id, eventId));

  revalidatePath("/communications/events");
  return { ok: true };
}
