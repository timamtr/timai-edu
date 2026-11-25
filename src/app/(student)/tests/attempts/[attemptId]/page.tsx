import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getAttemptResultData } from "@/services/testing";
import { BookmarkButton } from "@/components/tests/bookmark-button";

async function ResultPageContent({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const profile = await requireAuth();
  const data = await getAttemptResultData(attemptId, profile.id);

  if (!data) {
    notFound();
  }

  const pct = Math.round(Number(data.attempt.percentage || 0));
  const passed = pct >= data.passingScore;
  const mins = Math.floor(data.attempt.time_spent_seconds / 60);
  const secs = data.attempt.time_spent_seconds % 60;
  const bookmarkedSet = new Set(data.bookmarkedIds);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Тесттер тізіміне
        </Link>

        <Link
          href={`/tests/${data.testId}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          Қайта тапсыру
        </Link>
      </div>

      {/* Сводка результата */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                passed
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
              }`}
            >
              {passed ? "Шектік балл жиналды" : "Қосымша дайындық қажет"}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-foreground">
              {data.testTitle}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-primary">{pct}%</div>
            <div className="text-xs text-muted-foreground">
              {data.attempt.score} / {data.attempt.max_score} балл
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 p-3.5">
            <div className="text-xs text-muted-foreground">Жинаған балл</div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {data.attempt.score} / {data.attempt.max_score}
            </div>
          </div>

          <div className="rounded-xl bg-success/10 p-3.5">
            <div className="text-xs text-success">Дұрыс жауап</div>
            <div className="mt-1 text-lg font-bold text-success">
              {data.attempt.correct_count}
            </div>
          </div>

          <div className="rounded-xl bg-destructive/10 p-3.5">
            <div className="text-xs text-destructive">Қате жауап</div>
            <div className="mt-1 text-lg font-bold text-destructive">
              {data.attempt.wrong_count}
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-3.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Уақыт
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {mins} мин {secs} сек
            </div>
          </div>
        </div>
      </div>

      {/* Подробный разбор каждого вопроса */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Әр сұрақтың толық талдауы
        </h2>

        {data.review.map((item, idx) => (
          <div
            key={item.question_id}
            className="rounded-2xl border border-border bg-card p-6 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.is_correct ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Дұрыс (+{item.points_awarded})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    Қате (0/{item.points})
                  </span>
                )}
                <span className="text-xs font-semibold text-muted-foreground">
                  Сұрақ #{idx + 1}
                </span>
              </div>

              <BookmarkButton
                questionId={item.question_id}
                initialBookmarked={bookmarkedSet.has(item.question_id)}
              />
            </div>

            <p className="mt-4 text-base font-semibold text-foreground">
              {item.prompt}
            </p>

            {item.code_snippet && (
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#182033] p-4 font-mono text-xs leading-6 text-white">
                <code>{item.code_snippet}</code>
              </pre>
            )}

            <div className="mt-4 space-y-2">
              {item.options.map((opt) => {
                const isSelected = item.selected_option_ids.includes(opt.id);
                const isCorrect = item.correct_option_ids.includes(opt.id);

                let style = "border-border bg-background text-foreground";
                if (isCorrect) {
                  style = "border-success bg-success/10 text-foreground";
                } else if (isSelected && !isCorrect) {
                  style =
                    "border-destructive bg-destructive/10 text-foreground";
                }

                return (
                  <div
                    key={opt.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{opt.label}.</span>
                      <span>{opt.option_text}</span>
                    </div>
                    <div className="text-xs font-semibold">
                      {isCorrect && (
                        <span className="text-success">Дұрыс жауап</span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="text-destructive">Сіздің жауабыңыз</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {item.explanation && (
              <div className="mt-4 rounded-xl bg-secondary/50 p-4 text-sm text-foreground">
                <span className="font-semibold text-primary">Түсіндірме: </span>
                {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-card" />}>
      <ResultPageContent params={params} />
    </Suspense>
  );
}
