"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, FileQuestion } from "lucide-react";
import type { TestListItem } from "@/services/testing";
import type { Topic } from "@/types/database";

export function TestsCatalog({
  tests,
  topics,
}: {
  tests: TestListItem[];
  topics: Topic[];
}) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const filtered = tests.filter((t) => {
    if (selectedTopic === "all") return true;
    if (selectedTopic === "general") return t.topic_id === null;
    return t.topic_id === selectedTopic;
  });

  return (
    <div className="space-y-6">
      {/* Фильтр по темам */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedTopic("all")}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
            selectedTopic === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Барлық тесттер ({tests.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTopic("general")}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
            selectedTopic === "general"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Кешенді ҰБТ нұсқалары
        </button>
        {topics
          .filter((topic) => tests.some((t) => t.topic_id === topic.id))
          .map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopic(topic.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                selectedTopic === topic.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {topic.title}
            </button>
          ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            Таңдалған сүзгі бойынша тесттер табылмады
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {test.topicTitle || "Кешенді тест"}
                  </span>
                  {test.bestPercentage !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Үздік: {test.bestPercentage}%
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-lg font-bold text-foreground">
                  {test.title}
                </h2>
                {test.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {test.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <FileQuestion className="h-4 w-4 text-primary" />
                    {test.questionsCount} сұрақ
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {test.duration_minutes} минут
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <Link
                  href={`/tests/${test.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
                >
                  Тестті ашу
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
