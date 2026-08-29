"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { calendarSet, holiday, term } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createCalendarSet(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const academicYearStart = String(formData.get("academicYearStart") ?? "");
  const academicYearEnd = String(formData.get("academicYearEnd") ?? "");
  const teachingDays = formData.getAll("teachingDays").map(String);

  if (!name || !academicYearStart || !academicYearEnd || teachingDays.length === 0) {
    return { ok: false, message: "Enter a name, academic year and at least one teaching day." };
  }

  const madrasah = await getMadrasah();
  await db.insert(calendarSet).values({
    madrasahId: madrasah.id,
    name,
    description: description || null,
    teachingDays,
    academicYearStart,
    academicYearEnd,
  });

  revalidatePath("/calendar");
  return { ok: true };
}

export async function addTerm(formData: FormData) {
  const calendarSetId = String(formData.get("calendarSetId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!calendarSetId || !name || !startDate || !endDate) {
    return { ok: false, message: "Enter a term name, start date and end date." };
  }
  if (endDate < startDate) {
    return { ok: false, message: "End date must be after the start date." };
  }

  const madrasah = await getMadrasah();
  await db.insert(term).values({ madrasahId: madrasah.id, calendarSetId, name, startDate, endDate });

  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteTerm(termId: string) {
  const madrasah = await getMadrasah();
  await db.delete(term).where(and(eq(term.id, termId), eq(term.madrasahId, madrasah.id)));
  revalidatePath("/calendar");
  return { ok: true };
}

export async function addHoliday(formData: FormData) {
  const calendarSetId = String(formData.get("calendarSetId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!calendarSetId || !name || !startDate || !endDate) {
    return { ok: false, message: "Enter a holiday name, start date and end date." };
  }
  if (endDate < startDate) {
    return { ok: false, message: "End date must be after the start date." };
  }

  const madrasah = await getMadrasah();
  await db.insert(holiday).values({ madrasahId: madrasah.id, calendarSetId, name, startDate, endDate });

  revalidatePath("/calendar");
  return { ok: true };
}

export async function toggleHoliday(holidayId: string, enabled: boolean) {
  const madrasah = await getMadrasah();
  await db.update(holiday).set({ enabled }).where(and(eq(holiday.id, holidayId), eq(holiday.madrasahId, madrasah.id)));
  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteHoliday(holidayId: string) {
  const madrasah = await getMadrasah();
  await db.delete(holiday).where(and(eq(holiday.id, holidayId), eq(holiday.madrasahId, madrasah.id)));
  revalidatePath("/calendar");
  return { ok: true };
}
