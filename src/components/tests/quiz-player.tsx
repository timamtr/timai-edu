"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
  Zap,
} from "lucide-react";
import type { Question, Topic } from "@/types/database";

export function QuizPlayer({ topics }: { topics: Topic[] }) {
  const [topicId, setTopicId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(5);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    is_correct: boolean;
    correct_option_ids: string[];
    explanation: string | null;
  } | null>(null);
  const [correctTotal, setCorrectTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: topicId || null,
          questionCount,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Квизді бастау мүмкін болмады");
        setLoading(false);
        return;
      }
      setSessionId(json.sessionId);
      setQuestions(json.questions);
      setCurrentIndex(0);
      setSelectedIds([]);
      setFeedback(null);
      setCorrectTotal(0);
      setFinished(false);
    } catch {
      setError("Желі қатесі");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const toggleOption = (optId: string) => {
    if (feedback) return;
    if (currentQuestion?.question_type === "multiple_choice") {
      setSelectedIds((prev) =>
        prev.includes(optId)
          ? prev.filter((id) => id !== optId)
          : [...prev, optId]
      );
    } else {
      setSelectedIds([optId]);
    }
  };

  const checkAnswer = async () => {
    if (!sessionId || !currentQuestion || selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionIds: selectedIds,
        }),
      });
      const json = await res.json();
      if (res.ok && json.feedback) {
        setFeedback(json.feedback);
        if (json.feedback.is_correct) {
          setCorrectTotal((c) => c + 1);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedIds([]);
      setFeedback(null);
    } else {
      setFinished(true);
    }
  };

  // Экран настройки квиза
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <Zap className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Квиз параметрлерін таңдаңыз
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Кездейсоқ сұрақтар жинағы және әр жауаптан кейін лезде тексеру
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Тақырыпты таңдаңыз
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Барлық тақырыптар (Аралас)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Сұрақтар саны
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([5, 10, 15] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`rounded-xl border py-3 text-sm font-bold transition-colors ${
                    questionCount === cnt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {cnt} сұрақ
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={startQuiz}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Квизді бастау
          </button>
        </div>
      </div>
    );
  }

  // Экран итога квиза
  if (finished) {
    const pct = Math.round((correctTotal / questions.length) * 100);
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Квиз аяқталды!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Сіз {questions.length} сұрақтың {correctTotal} сұрағына дұрыс жауап
          бердіңіз ({pct}%)
        </p>

        <button
          type="button"
          onClick={() => setSessionId(null)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5]"
        >
          <RotateCcw className="h-4 w-4" />
          Жаңа квиз бастау
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>
          Сұрақ {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-success">Дұрыс: {correctTotal}</span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-foreground">
        {currentQuestion.prompt}
      </h2>

      {currentQuestion.code_snippet && (
        <pre className="mt-4 overflow-x-auto rounded-xl bg-[#182033] p-4 font-mono text-xs leading-6 text-white">
          <code>{currentQuestion.code_snippet}</code>
        </pre>
      )}

      <div className="mt-5 space-y-2.5">
        {(currentQuestion.options ?? []).map((opt) => {
          const isSelected = selectedIds.includes(opt.id);
          const isCorrect = feedback?.correct_option_ids.includes(opt.id);

          let style = "border-border bg-background hover:border-primary/40";
          if (feedback) {
            if (isCorrect) style = "border-success bg-success/10";
            else if (isSelected) style = "border-destructive bg-destructive/10";
          } else if (isSelected) {
            style = "border-primary bg-secondary/60";
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleOption(opt.id)}
              disabled={Boolean(feedback)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors ${style}`}
            >
              <span className="font-bold">{opt.label}.</span>
              <span>{opt.option_text}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            feedback.is_correct
              ? "border-success/30 bg-success/10 text-foreground"
              : "border-destructive/30 bg-destructive/10 text-foreground"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {feedback.is_correct ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Дұрыс жауап!</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span>Қате жауап</span>
              </>
            )}
          </div>
          {feedback.explanation && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {feedback.explanation}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!feedback ? (
          <button
            type="button"
            onClick={checkAnswer}
            disabled={selectedIds.length === 0 || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Жауапты тексеру
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5]"
          >
            {currentIndex + 1 < questions.length
              ? "Келесі сұрақ"
              : "Нәтижені көру"}
          </button>
        )}
      </div>
    </div>
  );
}
