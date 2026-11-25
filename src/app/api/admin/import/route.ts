import { NextResponse } from "next/server";
import { requireAdminApi } from "@/features/auth/api-guard";
import { bulkImportPayloadSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("errorResponse" in guard) return guard.errorResponse;

  const body = await request.json();
  const parsed = bulkImportPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Импорт деректері қате" },
      { status: 400 }
    );
  }

  const { data: importedCount, error } = await guard.supabase.rpc(
    "admin_bulk_import_questions",
    {
      p_items: parsed.data.items,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ importedCount });
}
