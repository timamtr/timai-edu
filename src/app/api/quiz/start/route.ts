import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startQuizSchema } from "@/lib/validations/testing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = startQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Параметрлер қате" }, { status: 400 });
  }

  let query = supabase
    .from("questions")
    .select(
      "id, topic_id, question_type, difficulty, prompt, code_snippet, image_url, points, question_options(id, label, option_text, sort_order)"
    )
    .eq("is_published", true);

  if (parsed.data.topicId) {
    query = query.eq("topic_id", parsed.data.topicId);
  }

  const { data: pool, error: poolError } = await query;
  if (poolError || !pool || pool.length === 0) {
    return NextResponse.json(
      { error: "Бұл тақырыпта сұрақтар табылмады" },
      { status: 404 }
    );
  }

  // Перемешиваем пул вопросов на сервере
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(
    0,
    Math.min(parsed.data.questionCount, shuffled.length)
  );

  const { data: session, error: sessionError } = await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      topic_id: parsed.data.topicId || null,
      question_count: selected.length,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Квизді бастау мүмкін болмады" },
      { status: 500 }
    );
  }

  const formattedQuestions = selected.map((q) => ({
    ...q,
    options: (q.question_options ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  }));

  return NextResponse.json({
    sessionId: session.id,
    questions: formattedQuestions,
  });
}
