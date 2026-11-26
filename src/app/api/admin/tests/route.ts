import { NextResponse } from "next/server";
import { requireAdminApi } from "@/features/auth/api-guard";
import { adminTestSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("errorResponse" in guard) return guard.errorResponse;

  const body = await request.json();
  const parsed = adminTestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Валидация қатесі" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const { data: test, error } = await guard.supabase
    .from("tests")
    .insert({
      subject_id: d.subjectId,
      test_category: d.testCategory,
      topic_id: d.testCategory === "topic" ? d.topicId || null : null,
      section_title: d.testCategory === "section" ? d.sectionTitle || null : null,
      title: d.title,
      description: d.description || null,
      duration_minutes: d.durationMinutes,
      passing_score: d.passingScore,
      is_published: d.isPublished,
      created_by: guard.userId,
    })
    .select("id")
    .single();

  if (error || !test) {
    return NextResponse.json(
      { error: error?.message || "Тест құру қатесі" },
      { status: 400 }
    );
  }

  if (d.questionIds.length > 0) {
    const rows = d.questionIds.map((qId, idx) => ({
      test_id: test.id,
      question_id: qId,
      sort_order: idx + 1,
    }));
    await guard.supabase.from("test_questions").insert(rows);
  }

  return NextResponse.json({ id: test.id });
}
