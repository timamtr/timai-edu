"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/features/auth/actions";

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      grade: "11",
    },
  });

  const onSubmit = (values: RegisterInput) => {
    setServerError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await registerAction(values);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.success);
      }
    });
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Жаңа аккаунт ашу
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          ҰБТ-ға информатика пәнінен дайындықты бастаңыз
        </p>
      </div>

      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <span>{successMessage}</span>
          </div>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
          >
            Кіру бетіне өту
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Аты-жөніңіз
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Асқаров Әлихан"
              {...register("fullName")}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="grade"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Сыныбыңыз
            </label>
            <select
              id="grade"
              {...register("grade")}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="9">9-сынып</option>
              <option value="10">10-сынып</option>
              <option value="11">11-сынып (ҰБТ түлегі)</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-xs text-destructive">
                {errors.grade.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Электрондық пошта
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="oqushy@example.kz"
              {...register("email")}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Құпиясөз
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Кемінде 6 таңба"
              {...register("password")}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Құпиясөзді растаңыз
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Құпиясөзді қайталаңыз"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-[#233FA5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Тіркелу орындалуда..." : "Тіркелу"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Аккаунтыңыз бар ма?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Кіру
        </Link>
      </p>
    </div>
  );
}
