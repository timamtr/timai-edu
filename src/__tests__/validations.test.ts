import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { adminQuestionSchema, adminTestSchema } from "@/lib/validations/admin";
import { startQuizSchema } from "@/lib/validations/testing";

describe("Auth Validations", () => {
  it("accepts valid registration", () => {
    const res = registerSchema.safeParse({
      fullName: "Таткен Темірлан",
      grade: "11",
      email: "student@timai.kz",
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(res.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const res = registerSchema.safeParse({
      fullName: "Таткен Темірлан",
      grade: "10",
      email: "student@timai.kz",
      password: "Password123",
      confirmPassword: "WrongPassword",
    });
    expect(res.success).toBe(false);
  });

  it("validates login schema", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "123" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "ok@timai.kz", password: "secret123" }).success).toBe(true);
  });
});

describe("Admin & Testing Validations", () => {
  const sId = "11111111-1111-4111-8111-111111111111";
  const tId = "22222222-2222-4222-8222-222222222222";

  it("rejects single_choice with multiple correct options", () => {
    const res = adminQuestionSchema.safeParse({
      subjectId: sId,
      topicId: tId,
      questionType: "single_choice",
      difficulty: "easy",
      prompt: "Екілік жүйенің негізі",
      points: 1,
      isPublished: true,
      options: [
        { label: "A", option_text: "2", is_correct: true },
        { label: "B", option_text: "8", is_correct: true },
      ],
    });
    expect(res.success).toBe(false);
  });

  it("validates test creation and quiz limits", () => {
    expect(
      adminTestSchema.safeParse({
        subjectId: sId,
        topicId: null,
        title: "ҰБТ сынақ тесті",
        durationMinutes: 30,
        passingScore: 60,
        isPublished: true,
        questionIds: [tId],
      }).success
    ).toBe(true);
    expect(startQuizSchema.safeParse({ questionCount: 10 }).success).toBe(true);
    expect(startQuizSchema.safeParse({ questionCount: 7 }).success).toBe(false);
  });
});
