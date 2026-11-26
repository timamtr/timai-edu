import { Suspense } from "react";
import { requireAuth } from "@/features/auth/server-auth";
import { getPublishedTestsData } from "@/services/testing";
import { TestsCatalog } from "@/components/tests/tests-catalog";

async function TestsPageContent() {
  const profile = await requireAuth();
  const { topicAndSectionTests, topics } = await getPublishedTestsData(
    profile.id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Тақырыптық және бөлімдік тесттер
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Әр тақырыпты меңгеруге арналған тақырыптық тесттер мен 6 ірі бөлім
          бойынша қорытынды бекіту тесттері.
        </p>
      </div>

      <TestsCatalog tests={topicAndSectionTests} topics={topics} />
    </div>
  );
}

export default function TestsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      }
    >
      <TestsPageContent />
    </Suspense>
  );
}
