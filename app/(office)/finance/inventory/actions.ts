"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inventoryCategoryEnum, inventoryItem } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

export async function adjustStock(itemId: string, delta: number) {
  const madrasah = await getMadrasah();
  await db
    .update(inventoryItem)
    .set({ stock: sql`greatest(0, ${inventoryItem.stock} + ${delta})` })
    .where(and(eq(inventoryItem.id, itemId), eq(inventoryItem.madrasahId, madrasah.id)));

  revalidatePath("/finance/inventory");
  return { ok: true };
}

export async function addInventoryItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const stock = Number(formData.get("stock") ?? 0);
  const reorderLevel = Number(formData.get("reorderLevel") ?? 0);
  const price = String(formData.get("price") ?? "");

  if (!name || !category || !Number.isFinite(Number(price))) {
    return { ok: false, message: "Enter a name, category and price." };
  }
  if (!inventoryCategoryEnum.enumValues.includes(category as (typeof inventoryCategoryEnum.enumValues)[number])) {
    return { ok: false, message: "Invalid category." };
  }

  const madrasah = await getMadrasah();
  await db.insert(inventoryItem).values({
    madrasahId: madrasah.id,
    name,
    category: category as (typeof inventoryCategoryEnum.enumValues)[number],
    stock: Number.isFinite(stock) ? stock : 0,
    reorderLevel: Number.isFinite(reorderLevel) ? reorderLevel : 0,
    price,
  });

  revalidatePath("/finance/inventory");
  return { ok: true };
}
