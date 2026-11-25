import { NextResponse } from "next/server";
import { requireAdminApi } from "@/features/auth/api-guard";
import { adminQuestionSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("errorResponse" in guard) return guard.errorResponse;

  const body = await request.json();
  const parsed = adminQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Валидация қатесі" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const { data: questionId, error } = await guard.supabase.rpc(
    "admin_upsert_question",
    {
      p_question_id: null,
      p_subject_id: d.subjectId,
      p_topic_id: d.topicId,
      p_question_type: d.questionType,
      p_difficulty: d.difficulty,
      p_prompt: d.prompt,
      p_code_snippet: d.codeSnippet || "",
      p_image_url: d.imageUrl || "",
      p_explanation: d.explanation || "",
      p_points: d.points,
      p_is_published: d.isPublished,
      p_options: d.options,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: questionId });
}
