import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { quizAnswerSchema } from "@/lib/validations/testing";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = quizAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Деректер қате" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("submit_quiz_answer", {
    p_session_id: sessionId,
    p_question_id: parsed.data.questionId,
    p_selected_option_ids: parsed.data.selectedOptionIds,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ feedback: data });
}
