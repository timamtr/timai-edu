import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/features/auth/server-auth";
import { getAttemptPlayData } from "@/services/testing";
import { TestPlayer } from "@/components/tests/test-player";

async function PlayPageContent({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const profile = await requireAuth();
  const data = await getAttemptPlayData(attemptId, profile.id);

  if (!data) {
    notFound();
  }

  if (data.status !== "in_progress") {
    redirect(`/tests/attempts/${data.attemptId}`);
  }

  return (
    <TestPlayer
      attemptId={data.attemptId}
      testTitle={data.testTitle}
      durationMinutes={data.durationMinutes}
      startedAt={data.startedAt}
      questions={data.questions}
      initialAnswers={data.initialAnswers}
      bookmarkedIds={data.bookmarkedIds}
    />
  );
}

export default function TestPlayPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-card" />}>
      <PlayPageContent params={params} />
    </Suspense>
  );
}
