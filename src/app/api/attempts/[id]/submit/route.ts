import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitAttemptSchema } from "@/lib/validations/testing";
import { checkRateLimit } from "@/lib/utils/rate-limit";

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

  const rl = checkRateLimit(`submit-attempt:${user.id}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Тым көп сұраныс. Біраз күте тұрыңыз." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = submitAttemptSchema.safeParse(body);
  const timeSpentSeconds = parsed.success ? parsed.data.timeSpentSeconds : 0;

  const { data, error } = await supabase.rpc("submit_test_attempt", {
    p_attempt_id: attemptId,
    p_time_spent_seconds: timeSpentSeconds,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ result: data });
}
