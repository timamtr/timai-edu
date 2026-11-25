import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: test, error } = await supabase
    .from("tests")
    .select("*, test_questions(count)")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !test) {
    return NextResponse.json({ error: "Тест табылмады" }, { status: 404 });
  }

  return NextResponse.json({ data: test });
}
