import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Электрондық поштаны енгізіңіз")
    .email("Электрондық пошта форматы қате"),
  password: z
    .string()
    .min(6, "Құпиясөз кемінде 6 таңбадан тұруы тиіс"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Аты-жөніңіз кемінде 2 таңбадан тұруы тиіс")
      .max(100, "Аты-жөніңіз тым ұзын"),
    grade: z.enum(["9", "10", "11"], {
      message: "Сыныпты таңдаңыз",
    }),
    email: z
      .string()
      .min(1, "Электрондық поштаны енгізіңіз")
      .email("Электрондық пошта форматы қате"),
    password: z
      .string()
      .min(6, "Құпиясөз кемінде 6 таңбадан тұруы тиіс")
      .max(72, "Құпиясөз 72 таңбадан аспауы тиіс"),
    confirmPassword: z
      .string()
      .min(1, "Құпиясөзді қайта енгізіңіз"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Құпиясөздер сәйкес келмейді",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Электрондық поштаны енгізіңіз")
    .email("Электрондық пошта форматы қате"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Жаңа құпиясөз кемінде 6 таңбадан тұруы тиіс")
      .max(72, "Құпиясөз 72 таңбадан аспауы тиіс"),
    confirmPassword: z
      .string()
      .min(1, "Құпиясөзді қайта енгізіңіз"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Құпиясөздер сәйкес келмейді",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
