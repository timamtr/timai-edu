"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/features/auth/server-auth";

export async function toggleLessonCompleteAction(
  lessonId: string,
  lessonSlug: string,
  completed: boolean
) {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: profile.id,
      lesson_id: lessonId,
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return { error: "Прогресті сақтау кезінде қате шықты" };
  }

  revalidatePath(`/lessons/${lessonSlug}`);
  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  return { success: true };
}

const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Аты-жөніңіз кемінде 2 таңба болуы тиіс").max(100),
  grade: z.enum(["9", "10", "11"]),
});

export async function updateProfileAction(formData: {
  fullName: string;
  grade: "9" | "10" | "11";
}) {
  const profile = await requireAuth();
  const parsed = profileUpdateSchema.safeParse(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      grade: Number(parsed.data.grade),
    })
    .eq("id", profile.id);

  if (error) {
    return { error: "Профильді жаңарту мүмкін болмады" };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Профиль сәтті жаңартылды!" };
}
