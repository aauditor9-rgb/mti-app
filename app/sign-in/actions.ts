"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { guardian, staff } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

function safeNext(next: FormDataEntryValue | null): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function signIn(_prevState: { ok: boolean; message?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { ok: false, message: "Incorrect email or password." };
  }

  const [staffRow] = await db.select({ id: staff.id, role: staff.role }).from(staff).where(eq(staff.userId, data.user.id)).limit(1);
  if (staffRow) {
    redirect(next ?? (staffRow.role === "Office Staff" ? "/" : "/teacher"));
  }

  const [guardianRow] = await db.select({ id: guardian.id }).from(guardian).where(eq(guardian.userId, data.user.id)).limit(1);
  if (guardianRow) {
    redirect(next ?? "/parent");
  }

  await supabase.auth.signOut();
  return { ok: false, message: "This account isn't linked to a staff or guardian record yet — ask the office to set it up." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
