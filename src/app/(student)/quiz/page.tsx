import { Suspense } from "react";
import { requireAuth } from "@/features/auth/server-auth";
import { getSubjectsAndTopics } from "@/services/learning";
import { QuizPlayer } from "@/components/tests/quiz-player";

async function QuizPageContent() {
  const profile = await requireAuth();
  const { topics } = await getSubjectsAndTopics(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Жылдам квиз режимі
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Қысқа жаттығулар арқылы біліміңді тексеріп, бірден түсіндірме ал.
        </p>
      </div>

      <QuizPlayer topics={topics} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-card" />}>
      <QuizPageContent />
    </Suspense>
  );
}
