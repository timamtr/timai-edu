import { z } from "zod";

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid("Сұрақ идентификаторы қате"),
  selectedOptionIds: z.array(z.string().uuid()).default([]),
});

export const submitAttemptSchema = z.object({
  timeSpentSeconds: z.number().int().min(0).max(86400).default(0),
});

export const startQuizSchema = z.object({
  topicId: z.string().uuid().nullable().optional(),
  questionCount: z.union([z.literal(5), z.literal(10), z.literal(15)]),
});

export const quizAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionIds: z.array(z.string().uuid()).min(1, "Жауап нұсқасын таңдаңыз"),
});

export const toggleBookmarkSchema = z.object({
  questionId: z.string().uuid(),
});
