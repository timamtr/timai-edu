"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toggleLessonCompleteAction } from "@/features/lessons/actions";

export function CompleteLessonButton({
  lessonId,
  lessonSlug,
  initialCompleted,
}: {
  lessonId: string;
  lessonSlug: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !completed;
    startTransition(async () => {
      const res = await toggleLessonCompleteAction(
        lessonId,
        lessonSlug,
        nextState
      );
      if (res?.success) {
        setCompleted(nextState);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
        completed
          ? "bg-success text-white hover:bg-success/90"
          : "bg-primary text-primary-foreground hover:bg-[#233FA5]"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : completed ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {completed ? "Сабақ аяқталды ✓" : "Сабақты аяқтау"}
    </button>
  );
}
