"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/features/auth/server-auth";

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["student", "teacher", "admin"]),
});

export async function adminUpdateUserRoleAction(input: {
  userId: string;
  role: "student" | "teacher" | "admin";
}) {
  const admin = await requireRole(["admin"]);
  const parsed = updateRoleSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Рөл деректері қате" };
  }

  if (parsed.data.userId === admin.id && parsed.data.role !== "admin") {
    return { error: "Өз әкімшілік рөліңізді өшіре алмайсыз" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

const topicSchema = z.object({
  id: z.string().uuid().optional(),
  subjectId: z.string().uuid(),
  title: z.string().min(2, "Тақырып атауы кемінде 2 таңба болуы тиіс"),
  slug: z.string().min(2, "Slug кемінде 2 таңба болуы тиіс"),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export async function adminSaveTopicAction(input: z.infer<typeof topicSchema>) {
  await requireRole(["admin"]);
  const parsed = topicSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const d = parsed.data;
  const supabase = await createClient();

  if (d.id) {
    const { error } = await supabase
      .from("topics")
      .update({
        subject_id: d.subjectId,
        title: d.title,
        slug: d.slug,
        description: d.description || null,
        sort_order: d.sortOrder,
        is_published: d.isPublished,
      })
      .eq("id", d.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("topics").insert({
      subject_id: d.subjectId,
      title: d.title,
      slug: d.slug,
      description: d.description || null,
      sort_order: d.sortOrder,
      is_published: d.isPublished,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/content");
  revalidatePath("/subjects");
  return { success: true };
}

export async function adminDeleteTopicAction(topicId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) return { error: error.message };

  revalidatePath("/admin/content");
  revalidatePath("/subjects");
  return { success: true };
}

const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  topicId: z.string().uuid("Тақырыпты таңдаңыз"),
  title: z.string().min(3, "Сабақ атауы кемінде 3 таңба болуы тиіс"),
  slug: z.string().min(2, "Slug кемінде 2 таңба болуы тиіс"),
  description: z.string().optional().default(""),
  contentMd: z.string().min(5, "Сабақ мәтінін енгізіңіз"),
  estimatedMinutes: z.number().int().min(1).max(180).default(15),
  sortOrder: z.number().int().min(0).default(1),
  isPublished: z.boolean().default(true),
});

export async function adminSaveLessonAction(
  input: z.infer<typeof lessonSchema>
) {
  const admin = await requireRole(["admin"]);
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const d = parsed.data;
  const supabase = await createClient();

  if (d.id) {
    const { error } = await supabase
      .from("lessons")
      .update({
        topic_id: d.topicId,
        title: d.title,
        slug: d.slug,
        description: d.description || null,
        content_md: d.contentMd,
        estimated_minutes: d.estimatedMinutes,
        sort_order: d.sortOrder,
        is_published: d.isPublished,
      })
      .eq("id", d.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("lessons").insert({
      topic_id: d.topicId,
      title: d.title,
      slug: d.slug,
      description: d.description || null,
      content_md: d.contentMd,
      estimated_minutes: d.estimatedMinutes,
      sort_order: d.sortOrder,
      is_published: d.isPublished,
      created_by: admin.id,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/content");
  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function adminDeleteLessonAction(lessonId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: error.message };

  revalidatePath("/admin/content");
  revalidatePath("/subjects");
  return { success: true };
}
