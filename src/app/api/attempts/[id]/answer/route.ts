import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveAnswerSchema } from "@/lib/validations/testing";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = saveAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Деректер қате" },
      { status: 400 }
    );
  }

  // RLS дополнительно проверяет принадлежность попытки пользователю и статус in_progress
  const { error } = await supabase.from("user_answers").upsert(
    {
      attempt_id: attemptId,
      question_id: parsed.data.questionId,
      selected_option_ids: parsed.data.selectedOptionIds,
    },
    { onConflict: "attempt_id,question_id" }
  );

  if (error) {
    return NextResponse.json(
      { error: "Жауапты сақтау мүмкін болмады" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
