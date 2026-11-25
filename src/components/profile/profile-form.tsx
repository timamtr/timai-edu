"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Profile } from "@/types/database";
import { updateProfileAction } from "@/features/lessons/actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [grade, setGrade] = useState<"9" | "10" | "11">(
    (String(profile.grade || 11) as "9" | "10" | "11")
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const res = await updateProfileAction({ fullName, grade });
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setMessage(res.success);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3.5 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Электрондық пошта
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full rounded-xl border border-input bg-muted px-3.5 py-2.5 text-sm text-muted-foreground"
        />
      </div>

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
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
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
          value={grade}
          onChange={(e) => setGrade(e.target.value as "9" | "10" | "11")}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="9">9-сынып</option>
          <option value="10">10-сынып</option>
          <option value="11">11-сынып</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5] disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Өзгерістерді сақтау
      </button>
    </form>
  );
}
