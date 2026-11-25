import { NextResponse } from "next/server";
import { requireAdminApi } from "@/features/auth/api-guard";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("errorResponse" in guard) return guard.errorResponse;

  const rl = checkRateLimit(`admin-upload:${guard.userId}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Жүктеу лимиті асып кетті. Бір минуттан кейін қайталаңыз." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл таңдалмаған" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Тек PNG, JPG немесе WEBP суреттері рұқсат етілген" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Файл өлшемі 2 МБ-тан аспауы тиіс" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await guard.supabase.storage
    .from("question-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = guard.supabase.storage
    .from("question-images")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
