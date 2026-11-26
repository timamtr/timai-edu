"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileQuestion,
  Layers,
} from "lucide-react";
import type { TestListItem } from "@/services/testing";
import type { Topic } from "@/types/database";
import { CURRICULUM_SECTIONS } from "@/config/curriculum";

export function TestsCatalog({
  tests,
  topics,
}: {
  tests: TestListItem[];
  topics: Topic[];
}) {
  const [categoryTab, setCategoryTab] = useState<"all" | "topic" | "section">(
    "all"
  );
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const topicTestsCount = tests.filter(
    (t) => t.testCategory === "topic"
  ).length;
  const sectionTestsCount = tests.filter(
    (t) => t.testCategory === "section"
  ).length;

  const filtered = tests.filter((t) => {
    if (categoryTab !== "all" && t.testCategory !== categoryTab) return false;
    if (selectedSection !== "all" && t.sectionTitle !== selectedSection)
      return false;
    if (selectedTopic !== "all" && t.topic_id !== selectedTopic) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Негізгі санат қойындылары: Барлығы / Тақырыптық / Бөлім бойынша бекіту */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setCategoryTab("all");
            setSelectedTopic("all");
          }}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            categoryTab === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Барлық тесттер ({tests.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setCategoryTab("topic");
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            categoryTab === "topic"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Тақырыптық тесттер ({topicTestsCount})
        </button>
        <button
          type="button"
          onClick={() => {
            setCategoryTab("section");
            setSelectedTopic("all");
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            categoryTab === "section"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Бөлім бойынша бекіту тесттері ({sectionTestsCount})
        </button>
      </div>

      {/* Бөлім және тақырып бойынша қосымша сүзгі */}
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            setSelectedTopic("all");
          }}
          className="rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-medium text-foreground outline-none focus:border-primary"
        >
          <option value="all">Барлық 6 бөлім бойынша</option>
          {CURRICULUM_SECTIONS.map((sec) => (
            <option key={sec.code} value={sec.title}>
              {sec.title}
            </option>
          ))}
        </select>

        {categoryTab !== "section" && (
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-medium text-foreground outline-none focus:border-primary"
          >
            <option value="all">Барлық 13 тақырып бойынша</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            Бұл санатта тесттер әзірге қосылмаған
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Әкімші панелі арқылы тақырыптық тесттер мен әр бөлімге арналған
            бекіту тесттерін қосқаннан кейін осында көрсетіледі.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((test) => {
            const isSectionTest = test.testCategory === "section";
            return (
              <div
                key={test.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isSectionTest
                          ? "bg-warning/15 text-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {isSectionTest
                        ? `Бөлімді бекіту: ${test.sectionTitle || ""}`
                        : test.topicTitle || "Тақырыптық тест"}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
