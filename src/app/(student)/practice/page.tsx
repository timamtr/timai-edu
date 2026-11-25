import { Suspense } from "react";
import { requireAuth } from "@/features/auth/server-auth";
import { getPracticeQuestionsData } from "@/services/testing";
import { PracticeBoard } from "@/components/tests/practice-board";

async function PracticePageContent() {
  const profile = await requireAuth();
  const { questions, bookmarkedIds } = await getPracticeQuestionsData(
    profile.id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Практикалық тапсырмалар
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Python, алгоритмдер, санау жүйелері, логика, SQL және кодты талдау
          бойынша есептер.
        </p>
      </div>

      <PracticeBoard questions={questions} bookmarkedIds={bookmarkedIds} />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-card" />}>
      <PracticePageContent />
    </Suspense>
  );
}
