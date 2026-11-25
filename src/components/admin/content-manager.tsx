"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Layers, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Lesson, Subject, Topic } from "@/types/database";
import {
  adminDeleteLessonAction,
  adminDeleteTopicAction,
  adminSaveLessonAction,
  adminSaveTopicAction,
} from "@/features/admin/actions";

interface LessonWithTopic extends Lesson {
  topicTitle: string;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яәіңғүұқөһ\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export function ContentManager({
  subjects,
  topics,
  lessons,
}: {
  subjects: Subject[];
  topics: Topic[];
  lessons: LessonWithTopic[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"topics" | "lessons">("topics");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Состояние модального окна для темы
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | undefined>();
  const [topicTitle, setTopicTitle] = useState("");
  const [topicSlug, setTopicSlug] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicSort, setTopicSort] = useState(1);
  const [topicPublished, setTopicPublished] = useState(true);

  // Состояние модального окна для урока
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | undefined>();
  const [lessonTopicId, setLessonTopicId] = useState(topics[0]?.id || "");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonSlug, setLessonSlug] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonMinutes, setLessonMinutes] = useState(15);
  const [lessonSort, setLessonSort] = useState(1);
  const [lessonPublished, setLessonPublished] = useState(true);

  const defaultSubjectId = subjects[0]?.id || "";

  const openNewTopic = () => {
    setEditingTopicId(undefined);
    setTopicTitle("");
    setTopicSlug("");
    setTopicDesc("");
    setTopicSort(topics.length + 1);
    setTopicPublished(true);
    setError(null);
    setTopicModalOpen(true);
  };

  const openEditTopic = (t: Topic) => {
    setEditingTopicId(t.id);
    setTopicTitle(t.title);
    setTopicSlug(t.slug);
    setTopicDesc(t.description || "");
    setTopicSort(t.sort_order);
    setTopicPublished(t.is_published);
    setError(null);
    setTopicModalOpen(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await adminSaveTopicAction({
        id: editingTopicId,
        subjectId: defaultSubjectId,
        title: topicTitle,
        slug: topicSlug || toSlug(topicTitle),
        description: topicDesc,
        sortOrder: Number(topicSort),
        isPublished: topicPublished,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setTopicModalOpen(false);
      router.refresh();
    });
  };

  const handleDeleteTopic = (id: string) => {
    if (!confirm("Тақырыпты өшіруге сенімдісіз бе?")) return;
    startTransition(async () => {
      await adminDeleteTopicAction(id);
      router.refresh();
    });
  };

  const openNewLesson = () => {
    setEditingLessonId(undefined);
    setLessonTopicId(topics[0]?.id || "");
    setLessonTitle("");
    setLessonSlug("");
    setLessonDesc("");
    setLessonContent("## Сабақ тақырыбы\n\nНегізгі теориялық материал...");
    setLessonMinutes(15);
    setLessonSort(lessons.length + 1);
    setLessonPublished(true);
    setError(null);
    setLessonModalOpen(true);
  };

  const openEditLesson = (l: LessonWithTopic) => {
    setEditingLessonId(l.id);
    setLessonTopicId(l.topic_id);
    setLessonTitle(l.title);
    setLessonSlug(l.slug);
    setLessonDesc(l.description || "");
    setLessonContent(l.content_md);
    setLessonMinutes(l.estimated_minutes);
    setLessonSort(l.sort_order);
    setLessonPublished(l.is_published);
    setError(null);
    setLessonModalOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await adminSaveLessonAction({
        id: editingLessonId,
        topicId: lessonTopicId,
        title: lessonTitle,
        slug: lessonSlug || toSlug(lessonTitle),
        description: lessonDesc,
        contentMd: lessonContent,
        estimatedMinutes: Number(lessonMinutes),
        sortOrder: Number(lessonSort),
        isPublished: lessonPublished,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setLessonModalOpen(false);
      router.refresh();
    });
  };

  const handleDeleteLesson = (id: string) => {
    if (!confirm("Сабақты өшіруге сенімдісіз бе?")) return;
    startTransition(async () => {
      await adminDeleteLessonAction(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Тақырыптар мен теориялық сабақтар
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Информатика пәнінің бөлімдері мен конспектілерін басқару
          </p>
        </div>

        <button
          type="button"
          onClick={tab === "topics" ? openNewTopic : openNewLesson}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-[#233FA5]"
        >
          <Plus className="h-4 w-4" />
          {tab === "topics" ? "Жаңа тақырып" : "Жаңа сабақ"}
        </button>
      </div>

      {/* Переключатель вкладок */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("topics")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "topics"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          Тақырыптар ({topics.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("lessons")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "lessons"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Сабақтар ({lessons.length})
        </button>
      </div>

      {tab === "topics" ? (
        <div className="space-y-3">
          {topics.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    #{t.sort_order} • {t.slug}
                  </span>
                  {t.is_published ? (
                    <span className="rounded bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                      Жарияланған
                    </span>
                  ) : (
                    <span className="rounded bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                      Жасырылған
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  {t.title}
                </h3>
                {t.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditTopic(t)}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTopic(t.id)}
                  className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {l.topicTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {l.estimated_minutes} мин
                  </span>
                  {l.is_published ? (
                    <span className="rounded bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                      Жарияланған
                    </span>
                  ) : (
                    <span className="rounded bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                      Шимай
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  {l.title}
                </h3>
                {l.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditLesson(l)}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(l.id)}
                  className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно Темы */}
      {topicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">
                {editingTopicId ? "Тақырыпты өңдеу" : "Жаңа тақырып"}
              </h2>
              <button
                type="button"
                onClick={() => setTopicModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveTopic} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium">Атауы</label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => {
                    setTopicTitle(e.target.value);
                    if (!editingTopicId) setTopicSlug(toSlug(e.target.value));
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    URL Slug (латынша)
                  </label>
                  <input
                    type="text"
                    required
                    value={topicSlug}
                    onChange={(e) => setTopicSlug(e.target.value)}
                    placeholder="graph-algorithms"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Реттік нөмірі
                  </label>
                  <input
                    type="number"
                    value={topicSort}
                    onChange={(e) => setTopicSort(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Сипаттама
                </label>
                <textarea
                  rows={2}
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={topicPublished}
                  onChange={(e) => setTopicPublished(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span>Жариялау</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm"
                >
                  Бас тарту
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно Урока */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">
                {editingLessonId ? "Сабақты өңдеу" : "Жаңа теориялық сабақ"}
              </h2>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveLesson} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Тақырып бөлімі
                  </label>
                  <select
                    value={lessonTopicId}
                    onChange={(e) => setLessonTopicId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Сабақ атауы
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => {
                      setLessonTitle(e.target.value);
                      if (!editingLessonId)
                        setLessonSlug(toSlug(e.target.value));
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonSlug}
                    onChange={(e) => setLessonSlug(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Оқу уақыты (мин)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lessonMinutes}
                    onChange={(e) => setLessonMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    Реттік нөмірі
                  </label>
                  <input
                    type="number"
                    value={lessonSort}
                    onChange={(e) => setLessonSort(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Қысқаша сипаттама
                </label>
                <input
                  type="text"
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Теориялық материал (Markdown, кестелер, код блоктары)
                </label>
                <textarea
                  rows={8}
                  required
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 font-mono text-xs leading-relaxed"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lessonPublished}
                  onChange={(e) => setLessonPublished(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span>Жариялау</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm"
                >
                  Бас тарту
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
