import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get("topicId");

  const supabase = await createClient();
  let query = supabase
    .from("lessons")
    .select("id, topic_id, slug, title, description, estimated_minutes, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (topicId) {
    query = query.eq("topic_id", topicId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
