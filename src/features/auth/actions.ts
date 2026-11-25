"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export interface AuthActionResult {
  error?: string;
  success?: string;
}

export async function loginAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Электрондық пошта немесе құпиясөз қате. Қайта тексеріңіз.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  redirect("/dashboard");
}

export async function registerAction(formData: {
  fullName: string;
  grade: "9" | "10" | "11";
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
        grade: Number(parsed.data.grade),
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Бұл электрондық пошта бұрын тіркелген." };
    }
    return { error: "Тіркелу кезінде қате шықты. Кейінірек қайталап көріңіз." };
  }

  // Сохраняем класс ученика, если сессия активна сразу (когда email confirmation отключен)
  if (data.user && data.session) {
    await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        grade: Number(parsed.data.grade),
      })
      .eq("id", data.user.id);

    redirect("/dashboard");
  }

  return {
    success:
      "Тіркелу сәтті өтті! Электрондық поштаңызға жіберілген сілтеме арқылы аккаунтты растаңыз.",
  };
}

export async function forgotPasswordAction(formData: {
  email: string;
}): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return {
      error: "Хат жіберу мүмкін болмады. Біраз уақыттан кейін қайталап көріңіз.",
    };
  }

  return {
    success:
      "Құпиясөзді қалпына келтіру сілтемесі электрондық поштаңызға жіберілді.",
  };
}

export async function resetPasswordAction(formData: {
  password: string;
  confirmPassword: string;
}): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Деректер қате" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Құпиясөзді жаңарту сәтсіз аяқталды. Сілтеменің мерзімі өтіп кеткен болуы мүмкін.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
