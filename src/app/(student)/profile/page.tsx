import { Suspense } from "react";
import { requireAuth } from "@/features/auth/server-auth";
import { ProfileForm } from "@/components/profile/profile-form";

async function ProfileContent() {
  const profile = await requireAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Жеке профиль
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Аккаунт деректерін жаңарту
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-card" />}>
      <ProfileContent />
    </Suspense>
  );
}
