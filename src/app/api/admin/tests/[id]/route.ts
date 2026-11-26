import { NextResponse } from "next/server";
import { requireAdminApi } from "@/features/auth/api-guard";
import { adminTestSchema } from "@/lib/validations/admin";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if ("errorResponse" in guard) return guard.errorResponse;

  const { id } = await context.params;
  const body = await request.json();

  if (typeof body.isPublished === "boolean" && Object.keys(body).length === 1) {
    const { error } = await guard.supabase
      .from("tests")
      .update({ is_published: body.isPublished })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  const parsed = adminTestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Валидация қатесі" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const { error } = await guard.supabase
    .from("tests")
    .update({
      subject_id: d.subjectId,
      test_category: d.testCategory,
      topic_id: d.testCategory === "topic" ? d.topicId || null : null,
      section_title: d.testCategory === "section" ? d.sectionTitle || null : null,
      title: d.title,
      description: d.description || null,
      duration_minutes: d.durationMinutes,
      passing_score: d.passingScore,
      is_published: d.isPublished,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await guard.supabase.from("test_questions").delete().eq("test_id", id);

  if (d.questionIds.length > 0) {
    const rows = d.questionIds.map((qId, idx) => ({
      test_id: id,
      question_id: qId,
      sort_order: idx + 1,
    }));
    await guard.supabase.from("test_questions").insert(rows);
  }

  return NextResponse.json({ id });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if ("errorResponse" in guard) return guard.errorResponse;

  const { id } = await context.params;
  const { error } = await guard.supabase.from("tests").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
