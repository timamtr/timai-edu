"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { QuestionOption } from "@/types/database";
import { checkPracticeAnswerAction } from "@/features/tests/actions";
import { BookmarkButton } from "./bookmark-button";

interface PracticeQuestionItem {
  id: string;
  topic_id: string;
  topicSlug: string;
  topicTitle: string;
  question_type: string;
  difficulty: string;
  prompt: string;
  code_snippet: string | null;
  points: number;
  options: QuestionOption[];
}

const CATEGORIES = [
  { key: "all", label: "Барлығы" },
  { key: "python", label: "Python" },
  { key: "algorithms", label: "Алгоритмдер" },
  { key: "number-systems", label: "Санау жүйелері" },
  { key: "logic-basics", label: "Логикалық есептер" },
  { key: "databases", label: "SQL" },
  { key: "code-analysis", label: "Кодты талдау" },
];

export function PracticeBoard({
  questions,
  bookmarkedIds,
}: {
  questions: PracticeQuestionItem[];
  bookmarkedIds: string[];
}) {
  const [category, setCategory] = useState("all");
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({});
  const [feedbackMap, setFeedbackMap] = useState<
    Record<
      string,
      {
        is_correct: boolean;
        correct_option_ids: string[];
        explanation: string | null;
      }
    >
  >({});
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const bookmarkedSet = new Set(bookmarkedIds);

  const filtered = questions.filter((q) => {
    if (category === "all") return true;
    if (category === "code-analysis") return Boolean(q.code_snippet);
    return q.topicSlug === category;
  });

  const handleToggleOption = (q: PracticeQuestionItem, optId: string) => {
    if (feedbackMap[q.id]) return;
    const current = selectedMap[q.id] || [];
    const next =
      q.question_type === "multiple_choice"
        ? current.includes(optId)
          ? current.filter((id) => id !== optId)
          : [...current, optId]
        : [optId];
    setSelectedMap((prev) => ({ ...prev, [q.id]: next }));
  };

  const handleCheck = async (questionId: string) => {
    const selected = selectedMap[questionId] || [];
    if (selected.length === 0) return;
    setCheckingId(questionId);
    const res = await checkPracticeAnswerAction({
      questionId,
      selectedOptionIds: selected,
    });
    if (res.feedback) {
      setFeedbackMap((prev) => ({ ...prev, [questionId]: res.feedback! }));
    }
    setCheckingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
              category === cat.key
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Бұл санатта тапсырмалар әлі қосылмаған.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q, idx) => {
            const selected = selectedMap[q.id] || [];
            const fb = feedbackMap[q.id];

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                      {q.topicTitle}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Есеп #{idx + 1}
                    </span>
                  </div>
                  <BookmarkButton
                    questionId={q.id}
                    initialBookmarked={bookmarkedSet.has(q.id)}
                  />
                </div>

                <p className="mt-3 text-base font-semibold text-foreground">
                  {q.prompt}
                </p>

                {q.code_snippet && (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-[#182033] p-4 font-mono text-xs leading-6 text-white">
                    <code>{q.code_snippet}</code>
                  </pre>
                )}

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    const isCorrect = fb?.correct_option_ids.includes(opt.id);

                    let style =
                      "border-border bg-background hover:border-primary/40";
                    if (fb) {
                      if (isCorrect) style = "border-success bg-success/10";
                      else if (isSelected)
                        style = "border-destructive bg-destructive/10";
                    } else if (isSelected) {
                      style = "border-primary bg-secondary/60";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleOption(q, opt.id)}
                        disabled={Boolean(fb)}
                        className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm transition-colors ${style}`}
                      >
                        <span className="font-bold">{opt.label}.</span>
                        <span>{opt.option_text}</span>
                      </button>
                    );
                  })}
                </div>

                {fb ? (
                  <div
                    className={`mt-4 rounded-xl border p-3.5 text-sm ${
                      fb.is_correct
                        ? "border-success/30 bg-success/10"
                        : "border-destructive/30 bg-destructive/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {fb.is_correct ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Дұрыс шешім!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span>Қате шешім</span>
                        </>
                      )}
                    </div>
                    {fb.explanation && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fb.explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleCheck(q.id)}
                      disabled={selected.length === 0 || checkingId === q.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-[#233FA5] disabled:opacity-50"
                    >
                      {checkingId === q.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      Жауапты тексеру
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
