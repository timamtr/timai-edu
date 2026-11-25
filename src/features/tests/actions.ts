"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/features/auth/server-auth";

const checkPracticeSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionIds: z.array(z.string().uuid()).min(1, "Жауап нұсқасын таңдаңыз"),
});

export async function checkPracticeAnswerAction(input: {
  questionId: string;
  selectedOptionIds: string[];
}) {
  await requireAuth();
  const parsed = checkPracticeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_practice_question", {
    p_question_id: parsed.data.questionId,
    p_selected_option_ids: parsed.data.selectedOptionIds,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    feedback: data as {
      is_correct: boolean;
      correct_option_ids: string[];
      explanation: string | null;
    },
  };
}
