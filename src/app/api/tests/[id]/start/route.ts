import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: testId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`start-test:${user.id}`, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Тым көп сұраныс. Бір минуттан кейін қайталаңыз." },
      { status: 429 }
    );
  }

  const { data: existingAttempt } = await supabase
    .from("test_attempts")
    .select("id")
    .eq("test_id", testId)
    .eq("user_id", user.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAttempt) {
    return NextResponse.json({ attemptId: existingAttempt.id });
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id")
    .eq("id", testId)
    .eq("is_published", true)
    .single();

  if (!test) {
    return NextResponse.json({ error: "Тест табылмады" }, { status: 404 });
  }

  const { data: attempt, error } = await supabase
    .from("test_attempts")
    .insert({
      test_id: testId,
      user_id: user.id,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !attempt) {
    return NextResponse.json(
      { error: "Тестті бастау мүмкін болмады" },
      { status: 500 }
    );
  }

  return NextResponse.json({ attemptId: attempt.id });
}
