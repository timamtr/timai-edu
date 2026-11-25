import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleBookmarkSchema } from "@/lib/validations/testing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = toggleBookmarkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Деректер қате" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", parsed.data.questionId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return NextResponse.json({ bookmarked: false });
  }

  await supabase.from("bookmarks").insert({
    user_id: user.id,
    question_id: parsed.data.questionId,
  });

  return NextResponse.json({ bookmarked: true });
}
