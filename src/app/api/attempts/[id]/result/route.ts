import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
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

  const { data: attempt, error: attemptError } = await supabase
    .from("test_attempts")
    .select("*, tests(title, passing_score)")
    .eq("id", attemptId)
    .single();

  if (attemptError || !attempt) {
    return NextResponse.json({ error: "Нәтиже табылмады" }, { status: 404 });
  }

  if (attempt.status !== "completed") {
    return NextResponse.json(
      { error: "Тест әлі аяқталмаған" },
      { status: 400 }
    );
  }

  const { data: review, error: reviewError } = await supabase.rpc(
    "get_attempt_review",
    { p_attempt_id: attemptId }
  );

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 403 });
  }

  return NextResponse.json({ attempt, review });
}
