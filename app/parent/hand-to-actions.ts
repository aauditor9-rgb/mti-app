"use server";

import { redirect } from "next/navigation";
import { setPendingPupilId } from "@/lib/session";

export async function handToPupil(pupilId: string) {
  await setPendingPupilId(pupilId);
  redirect("/pupil");
}
