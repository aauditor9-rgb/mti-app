"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { guardian, household, klass, pupil, pupilGuardian } from "@/lib/db/schema";
import { getMadrasah } from "@/lib/db/queries";

// Students CSV template (design/README.md "CSV import for students/staff/classes"):
// name, dob, class, gender, guardian, guardian_email
export async function importStudentsCsv(formData: FormData) {
  const madrasah = await getMadrasah();
  const text = String(formData.get("csv") ?? "").trim();
  if (!text) return { ok: false, message: "Paste some CSV rows first." };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const dataLines = /name\s*,\s*dob/i.test(lines[0] ?? "") ? lines.slice(1) : lines;
  if (dataLines.length === 0) return { ok: false, message: "No data rows found." };

  const classes = await db.select().from(klass).where(eq(klass.madrasahId, madrasah.id));
  const classByName = new Map(classes.map((c) => [c.name.toLowerCase(), c]));

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const cols = dataLines[i].split(",").map((c) => c.trim());
    const [name, dob, className, genderRaw, guardianName, guardianEmail] = cols;
    const rowLabel = `Row ${i + 1}`;

    if (!name || !dob || !className || !genderRaw) {
      errors.push(`${rowLabel}: missing name, dob, class or gender.`);
      continue;
    }
    const gender = genderRaw.toUpperCase() === "M" || genderRaw.toUpperCase() === "F" ? (genderRaw.toUpperCase() as "M" | "F") : null;
    if (!gender) {
      errors.push(`${rowLabel}: gender must be M or F.`);
      continue;
    }
    const classRow = classByName.get(className.toLowerCase());
    if (!classRow) {
      errors.push(`${rowLabel}: class "${className}" not found.`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      errors.push(`${rowLabel}: dob must be YYYY-MM-DD.`);
      continue;
    }

    let householdId: string | null = null;
    if (guardianName) {
      let existingGuardian = null;
      if (guardianEmail) {
        [existingGuardian] = await db.select().from(guardian).where(and(eq(guardian.madrasahId, madrasah.id), eq(guardian.email, guardianEmail))).limit(1);
      }
      if (existingGuardian) {
        householdId = existingGuardian.householdId;
      } else {
        const [newHousehold] = await db.insert(household).values({ madrasahId: madrasah.id }).returning();
        await db.insert(guardian).values({
          madrasahId: madrasah.id,
          householdId: newHousehold.id,
          name: guardianName,
          email: guardianEmail || null,
        });
        householdId = newHousehold.id;
      }
    }

    const [newPupil] = await db
      .insert(pupil)
      .values({ madrasahId: madrasah.id, name, dob, gender, classId: classRow.id, householdId })
      .returning();

    if (householdId) {
      const [g] = await db.select().from(guardian).where(eq(guardian.householdId, householdId)).limit(1);
      if (g) {
        await db.insert(pupilGuardian).values({ madrasahId: madrasah.id, pupilId: newPupil.id, guardianId: g.id, isPrimary: true });
      }
    }

    imported += 1;
  }

  revalidatePath("/students");
  revalidatePath("/settings/data-import");
  return {
    ok: errors.length === 0,
    message: `Imported ${imported} student${imported === 1 ? "" : "s"}.${errors.length > 0 ? ` ${errors.length} row(s) skipped: ${errors.join(" ")}` : ""}`,
  };
}
