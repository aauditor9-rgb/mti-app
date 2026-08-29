"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { task, taskCategoryEnum, taskPriorityEnum } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const assignedTo = String(formData.get("assignedTo") ?? "").trim();
  const category = String(formData.get("category") ?? "General");
  const priority = String(formData.get("priority") ?? "Medium");
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!title || !assignedTo || !dueDate) {
    return { ok: false, message: "Enter a title, assignee and due date." };
  }
  if (!taskCategoryEnum.enumValues.includes(category as (typeof taskCategoryEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid category." };
  }
  if (!taskPriorityEnum.enumValues.includes(priority as (typeof taskPriorityEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid priority." };
  }

  const madrasah = await getMadrasah();
  await db.insert(task).values({
    madrasahId: madrasah.id,
    title,
    assignedTo,
    category: category as (typeof taskCategoryEnum.enumValues)[number],
    priority: priority as (typeof taskPriorityEnum.enumValues)[number],
    dueDate,
  });

  revalidatePath("/tasks");
  return { ok: true };
}

export async function toggleTaskComplete(taskId: string, completed: boolean) {
  const madrasah = await getMadrasah();
  await db
    .update(task)
    .set({ completedAt: completed ? new Date() : null })
    .where(and(eq(task.id, taskId), eq(task.madrasahId, madrasah.id)));

  revalidatePath("/tasks");
  return { ok: true };
}

export async function deleteTask(taskId: string) {
  const madrasah = await getMadrasah();
  await db.delete(task).where(and(eq(task.id, taskId), eq(task.madrasahId, madrasah.id)));

  revalidatePath("/tasks");
  return { ok: true };
}
