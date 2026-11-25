"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Send,
} from "lucide-react";
import type { Question } from "@/types/database";
import { BookmarkButton } from "./bookmark-button";

interface TestPlayerProps {
  attemptId: string;
  testTitle: string;
  durationMinutes: number;
  startedAt: string;
  questions: Question[];
  initialAnswers: Record<string, string[]>;
  bookmarkedIds: string[];
}

export function TestPlayer({
  attemptId,
  testTitle,
  durationMinutes,
  startedAt,
  questions,
  initialAnswers,
  bookmarkedIds,
}: TestPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSeconds = durationMinutes * 60;
  const startMs = new Date(startedAt).getTime();

  const computeRemaining = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startMs) / 1000);
    return Math.max(0, totalSeconds - Math.max(0, elapsed));
  }, [startMs, totalSeconds]);

  const [secondsLeft, setSecondsLeft] = useState<number>(computeRemaining);
  const autoSubmittedRef = useRef(false);

  const submitTest = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const spent = Math.min(
      totalSeconds,
      Math.max(1, Math.floor((Date.now() - startMs) / 1000))
    );

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSpentSeconds: spent }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Тестті аяқтау кезінде қате шықты");
        setSubmitting(false);
        return;
      }
      router.replace(`/tests/attempts/${attemptId}`);
      router.refresh();
    } catch {
      setError("Желі қатесі. Қайталап көріңіз.");
      setSubmitting(false);
    }
  }, [attemptId, router, startMs, submitting, totalSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      const rem = computeRemaining();
      setSecondsLeft(rem);
      if (rem === 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitTest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [computeRemaining, submitTest]);

  const currentQuestion = questions[currentIndex];
  const bookmarkedSet = new Set(bookmarkedIds);

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Бұл тестте сұрақтар табылмады.
      </div>
    );
  }

  const isMultiple = currentQuestion.question_type === "multiple_choice";
  const selectedForCurrent = answers[currentQuestion.id] || [];

  const handleSelectOption = async (optionId: string) => {
    let nextSelected: string[];
    if (isMultiple) {
      nextSelected = selectedForCurrent.includes(optionId)
        ? selectedForCurrent.filter((id) => id !== optionId)
        : [...selectedForCurrent, optionId];
    } else {
      nextSelected = [optionId];
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: nextSelected,
    }));

    setSaving(true);
    try {
      await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionIds: nextSelected,
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLowTime = secondsLeft <= 60;

  const answeredCount = questions.filter(
    (q) => (answers[q.id]?.length ?? 0) > 0
  ).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Верхняя панель с таймером */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-foreground sm:text-lg">
            {testTitle}
          </h1>
          <p className="text-xs text-muted-foreground">
            Жауап берілді: {answeredCount} / {questions.length}{" "}
            {saving && "• Сақталуда..."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-sm font-bold ${
              isLowTime
                ? "bg-destructive/15 text-destructive"
                : "bg-secondary text-primary"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
          >
            <Send className="h-4 w-4" />
            Аяқтау
          </button>
        </div>
      </div>

      {/* Навигатор по номерам вопросов */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-4 shadow-xs">
        {questions.map((q, idx) => {
          const isAnswered = (answers[q.id]?.length ?? 0) > 0;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                isCurrent
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : isAnswered
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Карточка текущего вопроса */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
              Сұрақ {currentIndex + 1} / {questions.length}
            </span>
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {isMultiple ? "Бірнеше дұрыс жауап" : "Бір дұрыс жауап"}
            </span>
          </div>

          <BookmarkButton
            key={currentQuestion.id}
            questionId={currentQuestion.id}
            initialBookmarked={bookmarkedSet.has(currentQuestion.id)}
          />
        </div>

        <h2 className="mt-5 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
          {currentQuestion.prompt}
        </h2>

        {currentQuestion.code_snippet && (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#182033] p-4 font-mono text-xs leading-6 text-white sm:text-sm">
            <code>{currentQuestion.code_snippet}</code>
          </pre>
        )}

        <div className="mt-6 space-y-3">
          {(currentQuestion.options ?? []).map((opt) => {
            const checked = selectedForCurrent.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                  checked
                    ? "border-primary bg-secondary/60 text-foreground shadow-xs"
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    checked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {checked && isMultiple ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    opt.label
                  )}
                </span>
                <span className="text-sm font-medium">{opt.option_text}</span>
              </button>
            );
          })}
        </div>

        {/* Кнопки Назад / Вперёд */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Алдыңғы
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
            >
              Келесі
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-success px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-success/90"
            >
              <Send className="h-4 w-4" />
              Тестті аяқтау
            </button>
          )}
        </div>
      </div>

      {/* Подтверждение завершения */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3 text-warning">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-foreground">
                Тестті аяқтауды растау
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Сіз {questions.length} сұрақтың{" "}
              <span className="font-semibold text-foreground">
                {answeredCount}
              </span>{" "}
              сұрағына жауап бердіңіз. Аяқтағаннан кейін жауаптарды өзгерту
              мүмкін болмайды.
            </p>
            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Қайту
              </button>
              <button
                type="button"
                onClick={submitTest}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Иә, аяқтау
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
