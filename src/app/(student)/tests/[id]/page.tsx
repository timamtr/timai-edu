import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileQuestion,
  ShieldCheck,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getTestDetails } from "@/services/testing";
import { StartTestButton } from "@/components/tests/start-test-button";

async function TestDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuth();
  const data = await getTestDetails(id, profile.id);

  if (!data) {
    notFound();
  }

  const isUntVariant = data.test.testCategory === "unt_variant";
  const backHref = isUntVariant ? "/variants" : "/tests";
  const backLabel = isUntVariant
    ? "Барлық нұсқаларға оралу"
    : "Барлық тесттерге оралу";

  const inProgressAttempt = data.attempts.find(
    (a) => a.status === "in_progress"
  );
  const completedAttempts = data.attempts.filter(
    (a) => a.status === "completed"
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {isUntVariant
            ? "ҰБТ нұсқасы"
            : data.test.testCategory === "section"
            ? `Бөлімдік бекіту: ${data.test.sectionTitle || ""}`
            : data.test.topicTitle || "Тақырыптық тест"}
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {data.test.title}
        </h1>
        {data.test.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {data.test.description}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileQuestion className="h-4 w-4 text-primary" />
              Сұрақтар саны
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {data.test.questionsCount}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Берілетін уақыт
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {data.test.duration_minutes} мин
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              Өту шегі
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {data.test.passing_score}%
            </div>
          </div>
        </div>

        <div className="mt-6">
          <StartTestButton
            testId={data.test.id}
            hasInProgress={Boolean(inProgressAttempt)}
          />
        </div>
      </div>

      {completedAttempts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-base font-bold text-foreground">
            Алдыңғы талпыныстар тарихы
          </h2>
          <div className="mt-4 space-y-2.5">
            {completedAttempts.map((att, idx) => (
              <Link
                key={att.id}
                href={`/tests/attempts/${att.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Талпыныс #{completedAttempts.length - idx}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {att.score} / {att.max_score} балл •{" "}
                      {Math.floor(att.time_spent_seconds / 60)} мин{" "}
                      {att.time_spent_seconds % 60} сек
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    Number(att.percentage) >= data.test.passing_score
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {Math.round(Number(att.percentage))}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-card" />}>
      <TestDetailContent params={params} />
    </Suspense>
  );
}
