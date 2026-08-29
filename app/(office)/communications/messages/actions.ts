"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { message, messageAudienceEnum, messageChannelEnum, messageDirectionEnum } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function sendMessage(formData: FormData) {
  const audience = String(formData.get("audience") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const direction = String(formData.get("direction") ?? "Outbound");
  const channel = String(formData.get("channel") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!contactName || !body) return { ok: false, message: "Enter a contact name and message." };
  if (!messageAudienceEnum.enumValues.includes(audience as (typeof messageAudienceEnum.enumValues)[number])) {
    return { ok: false, message: "Choose who this is to/from." };
  }
  if (!messageChannelEnum.enumValues.includes(channel as (typeof messageChannelEnum.enumValues)[number])) {
    return { ok: false, message: "Choose a channel." };
  }
  if (!messageDirectionEnum.enumValues.includes(direction as (typeof messageDirectionEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid direction." };
  }

  const madrasah = await getMadrasah();
  await db.insert(message).values({
    madrasahId: madrasah.id,
    audience: audience as (typeof messageAudienceEnum.enumValues)[number],
    contactName,
    direction: direction as (typeof messageDirectionEnum.enumValues)[number],
    channel: channel as (typeof messageChannelEnum.enumValues)[number],
    body,
    readAt: direction === "Outbound" ? new Date() : null,
  });

  revalidatePath("/communications/messages");
  revalidatePath("/teacher", "layout");
  revalidatePath("/parent", "layout");
  return { ok: true };
}

export async function markMessageRead(messageId: string) {
  const madrasah = await getMadrasah();
  await db
    .update(message)
    .set({ readAt: new Date() })
    .where(and(eq(message.id, messageId), eq(message.madrasahId, madrasah.id)));

  revalidatePath("/communications/messages");
  revalidatePath("/teacher", "layout");
  revalidatePath("/parent", "layout");
  return { ok: true };
}
