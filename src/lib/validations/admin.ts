import { z } from "zod";

export const questionOptionInputSchema = z.object({
  label: z.string().min(1).max(5),
  option_text: z.string().min(1, "Жауап нұсқасы бос болмауы тиіс"),
  is_correct: z.boolean(),
});

export const adminQuestionSchema = z
  .object({
    subjectId: z.string().uuid("Пәнді таңдаңыз"),
    topicId: z.string().uuid("Тақырыпты таңдаңыз"),
    questionType: z.enum([
      "single_choice",
      "multiple_choice",
      "true_false",
      "short_answer",
      "code_output",
      "code_task",
    ]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    prompt: z.string().min(3, "Сұрақ мәтіні кемінде 3 таңба болуы тиіс"),
    codeSnippet: z.string().optional().default(""),
    imageUrl: z.string().optional().default(""),
    explanation: z.string().optional().default(""),
    points: z.number().int().min(1).max(10).default(1),
    isPublished: z.boolean().default(false),
    options: z
      .array(questionOptionInputSchema)
      .min(2, "Кемінде 2 жауап нұсқасы болуы тиіс")
      .max(8, "Ең көбі 8 жауап нұсқасы"),
  })
  .refine((data) => data.options.some((o) => o.is_correct), {
    message: "Кемінде бір дұрыс жауапты белгілеңіз",
    path: ["options"],
  })
  .refine(
    (data) =>
      data.questionType !== "single_choice" ||
      data.options.filter((o) => o.is_correct).length === 1,
    {
      message: "Бір дұрыс жауапты сұрақта тек 1 дұрыс нұсқа таңдалуы тиіс",
      path: ["options"],
    }
  );

export const adminTestSchema = z.object({
  subjectId: z.string().uuid("Пәнді таңдаңыз"),
  topicId: z.string().uuid().nullable().optional(),
  title: z.string().min(3, "Тест атауы кемінде 3 таңба болуы тиіс"),
  description: z.string().optional().default(""),
  durationMinutes: z.number().int().min(1).max(240).default(30),
  passingScore: z.number().int().min(0).max(100).default(60),
  isPublished: z.boolean().default(false),
  questionIds: z.array(z.string().uuid()).default([]),
});

export const bulkImportItemSchema = z.object({
  subject_id: z.string().uuid(),
  topic_id: z.string().uuid(),
  question_type: z.enum(["single_choice", "multiple_choice"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  prompt: z.string().min(3),
  code_snippet: z.string().optional().default(""),
  explanation: z.string().optional().default(""),
  points: z.number().int().min(1).max(10),
  is_published: z.boolean().default(true),
  options: z.array(questionOptionInputSchema).min(2),
});

export const bulkImportPayloadSchema = z.object({
  items: z.array(bulkImportItemSchema).min(1, "Импорттау үшін сұрақтар жоқ").max(500),
});
