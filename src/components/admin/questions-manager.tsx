"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { AdminQuestionRow } from "@/services/admin";
import type { Subject, Topic } from "@/types/database";

interface OptionDraft {
  label: string;
  option_text: string;
  is_correct: boolean;
}

const DEFAULT_OPTIONS: OptionDraft[] = [
  { label: "A", option_text: "", is_correct: true },
  { label: "B", option_text: "", is_correct: false },
  { label: "C", option_text: "", is_correct: false },
  { label: "D", option_text: "", is_correct: false },
];

const LABELS = ["A", "B", "C", "D", "E", "F"];

export function QuestionsManager({
  initialQuestions,
  subjects,
  topics,
}: {
  initialQuestions: AdminQuestionRow[];
  subjects: Subject[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const [questionType, setQuestionType] = useState<
    "single_choice" | "multiple_choice"
  >("single_choice");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [prompt, setPrompt] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [isPublished, setIsPublished] = useState(true);
  const [options, setOptions] = useState<OptionDraft[]>(DEFAULT_OPTIONS);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setSubjectId(subjects[0]?.id || "");
    setTopicId(topics[0]?.id || "");
    setQuestionType("single_choice");
    setDifficulty("medium");
    setPrompt("");
    setCodeSnippet("");
    setImageUrl("");
    setExplanation("");
    setPoints(1);
    setIsPublished(true);
    setOptions(DEFAULT_OPTIONS.map((o) => ({ ...o })));
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (q: AdminQuestionRow) => {
    setEditingId(q.id);
    setSubjectId(q.subject_id);
    setTopicId(q.topic_id);
    setQuestionType(
      q.question_type === "multiple_choice"
        ? "multiple_choice"
        : "single_choice"
    );
    setDifficulty(
      (q.difficulty as "easy" | "medium" | "hard") || "medium"
    );
    setPrompt(q.prompt);
    setCodeSnippet(q.code_snippet || "");
    setImageUrl(q.image_url || "");
    setExplanation(q.explanation || "");
    setPoints(q.points);
    setIsPublished(q.is_published);
    setOptions(
      q.options.length > 0
        ? q.options.map((o) => ({
            label: o.label,
            option_text: o.option_text,
            is_correct: o.is_correct,
          }))
        : DEFAULT_OPTIONS.map((o) => ({ ...o }))
    );
    setError(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Суретті жүктеу қатесі");
      } else {
        setImageUrl(json.url);
      }
    } catch {
      setError("Суретті жүктеу кезінде желі қатесі шықты");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleCorrect = (idx: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => {
        if (questionType === "single_choice") {
          return { ...opt, is_correct: i === idx };
        }
        return i === idx ? { ...opt, is_correct: !opt.is_correct } : opt;
      })
    );
  };

  const handleAddOption = () => {
    if (options.length >= LABELS.length) return;
    setOptions((prev) => [
      ...prev,
      { label: LABELS[prev.length], option_text: "", is_correct: false },
    ]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((opt, i) => ({ ...opt, label: LABELS[i] }))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      subjectId,
      topicId,
      questionType,
      difficulty,
      prompt,
      codeSnippet,
      imageUrl,
      explanation,
      points: Number(points),
      isPublished,
      options,
    };

    try {
      const url = editingId
        ? `/api/admin/questions/${editingId}`
        : "/api/admin/questions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Сақтау кезінде қате шықты");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      router.refresh();
    } catch {
      setError("Желі қатесі");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (q: AdminQuestionRow) => {
    await fetch(`/api/admin/questions/${q.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !q.is_published }),
    });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Бұл сұрақты өшіруге сенімдісіз бе?")) return;
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const filtered = initialQuestions.filter((q) => {
    const matchesTopic = topicFilter === "all" || q.topic_id === topicFilter;
    const matchesSearch =
      !search.trim() ||
      q.prompt.toLowerCase().includes(search.toLowerCase()) ||
      q.topicTitle.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Сұрақтар банкі
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Барлық сұрақтар саны: {initialQuestions.length}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-[#233FA5]"
        >
          <Plus className="h-4 w-4" />
          Жаңа сұрақ қосу
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Сұрақ мәтіні бойынша іздеу..."
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="all">Барлық тақырыптар</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Список вопросов */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Сұрақтар табылмады.
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {q.topicTitle}
                    </span>
                    <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {q.question_type === "multiple_choice"
                        ? "Бірнеше жауап"
                        : "Бір жауап"}
                    </span>
                    <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {q.difficulty} • {q.points} балл
                    </span>
                    {q.is_published ? (
                      <span className="rounded-lg bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Жарияланған
                      </span>
                    ) : (
                      <span className="rounded-lg bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                        Шимай (Черновик)
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {q.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(q)}
                    title={q.is_published ? "Жасыру" : "Жариялау"}
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {q.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    title="Өңдеу"
                    className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    title="Өшіру"
                    className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {q.options.map((o) => (
                  <span
                    key={o.id}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs ${
                      o.is_correct
                        ? "border-success/40 bg-success/10 font-semibold text-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {o.is_correct && (
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    )}
                    {o.label}: {o.option_text}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно создания/редактирования вопроса */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editingId ? "Сұрақты өңдеу" : "Жаңа сұрақ құру"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Пән
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Тақырып
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Сұрақ түрі
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => {
                      const nextType = e.target.value as
                        | "single_choice"
                        | "multiple_choice";
                      setQuestionType(nextType);
                      if (nextType === "single_choice") {
                        const firstCorrect = options.findIndex(
                          (o) => o.is_correct
                        );
                        setOptions((prev) =>
                          prev.map((o, i) => ({
                            ...o,
                            is_correct:
                              i === (firstCorrect >= 0 ? firstCorrect : 0),
                          }))
                        );
                      }
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="single_choice">Бір дұрыс жауап</option>
                    <option value="multiple_choice">Бірнеше дұрыс жауап</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Күрделілік
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "easy" | "medium" | "hard"
                      )
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="easy">Жеңіл (Easy)</option>
                    <option value="medium">Орташа (Medium)</option>
                    <option value="hard">Күрделі (Hard)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Балл
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Сұрақ мәтіні
                </label>
                <textarea
                  rows={2}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Сұрақ шартын енгізіңіз..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Код фрагменті (міндетті емес)
                </label>
                <textarea
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Python немесе SQL коды..."
                  className="w-full rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Сурет жүктеу (PNG/JPG/WEBP, 2 МБ дейін)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium hover:bg-muted">
                    <ImagePlus className="h-4 w-4 text-primary" />
                    <span>{uploading ? "Жүктелуде..." : "Сурет таңдау"}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <span className="truncate text-xs text-success">
                      Сурет жүктелді ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Варианты ответов */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Жауап нұсқалары (дұрыс жауапты белгілеңіз)
                  </label>
                  {options.length < LABELS.length && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      + Нұсқа қосу
                    </button>
                  )}
                </div>

                {options.map((opt, idx) => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <input
                      type={
                        questionType === "single_choice" ? "radio" : "checkbox"
                      }
                      name="correct_option"
                      checked={opt.is_correct}
                      onChange={() => handleToggleCorrect(idx)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="w-6 text-xs font-bold text-foreground">
                      {opt.label}.
                    </span>
                    <input
                      type="text"
                      required
                      value={opt.option_text}
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((o, i) =>
                            i === idx
                              ? { ...o, option_text: e.target.value }
                              : o
                          )
                        )
                      }
                      placeholder={`${opt.label} нұсқасының мәтіні`}
                      className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Түсіндірме (талдау)
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Дұрыс жауаптың қысқаша шешімі..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span>Бірден жариялау (оқушыларға көрінеді)</span>
              </label>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Бас тарту
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
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
