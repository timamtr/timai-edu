"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Eye,
  EyeOff,
  FileQuestion,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { AdminTestRow } from "@/services/admin";
import type { Subject, Topic } from "@/types/database";

interface BankQuestionItem {
  id: string;
  topic_id: string;
  topicTitle: string;
  prompt: string;
  difficulty: string;
  question_type: string;
  is_published: boolean;
}

export function TestsManager({
  initialTests,
  subjects,
  topics,
  bankQuestions,
}: {
  initialTests: AdminTestRow[];
  subjects: Subject[];
  topics: Topic[];
  bankQuestions: BankQuestionItem[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [topicId, setTopicId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(60);
  const [isPublished, setIsPublished] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const [bankSearch, setBankSearch] = useState("");
  const [bankTopicFilter, setBankTopicFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionMap = new Map(bankQuestions.map((q) => [q.id, q]));

  const openCreateModal = () => {
    setEditingId(null);
    setSubjectId(subjects[0]?.id || "");
    setTopicId("");
    setTitle("");
    setDescription("");
    setDurationMinutes(30);
    setPassingScore(60);
    setIsPublished(true);
    setSelectedQuestionIds([]);
    setBankSearch("");
    setBankTopicFilter("all");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (test: AdminTestRow) => {
    setEditingId(test.id);
    setSubjectId(test.subject_id);
    setTopicId(test.topic_id || "");
    setTitle(test.title);
    setDescription(test.description || "");
    setDurationMinutes(test.duration_minutes);
    setPassingScore(test.passing_score);
    setIsPublished(test.is_published);
    setSelectedQuestionIds(test.questionIds);
    setBankSearch("");
    setBankTopicFilter("all");
    setError(null);
    setModalOpen(true);
  };

  const addQuestion = (id: string) => {
    if (selectedQuestionIds.includes(id)) return;
    setSelectedQuestionIds((prev) => [...prev, id]);
  };

  const removeQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedQuestionIds.length) return;
    setSelectedQuestionIds((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingId
        ? `/api/admin/tests/${editingId}`
        : "/api/admin/tests";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          topicId: topicId || null,
          title,
          description,
          durationMinutes: Number(durationMinutes),
          passingScore: Number(passingScore),
          isPublished,
          questionIds: selectedQuestionIds,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Тестті сақтау кезінде қате шықты");
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

  const handleTogglePublish = async (test: AdminTestRow) => {
    await fetch(`/api/admin/tests/${test.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !test.is_published }),
    });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Бұл тестті өшіруге сенімдісіз бе?")) return;
    await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const availableBankQuestions = bankQuestions.filter((q) => {
    if (selectedQuestionIds.includes(q.id)) return false;
    const matchesTopic =
      bankTopicFilter === "all" || q.topic_id === bankTopicFilter;
    const matchesSearch =
      !bankSearch.trim() ||
      q.prompt.toLowerCase().includes(bankSearch.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Тесттерді басқару
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Жаңа тест құрастыру, сұрақтар ретін баптау және жариялау ({initialTests.length})
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-[#233FA5]"
        >
          <Plus className="h-4 w-4" />
          Жаңа тест құру
        </button>
      </div>

      {/* Список тестов */}
      <div className="grid gap-4 sm:grid-cols-2">
        {initialTests.map((test) => (
          <div
            key={test.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {test.topicTitle || "Кешенді ҰБТ тесті"}
                </span>
                {test.is_published ? (
                  <span className="rounded-lg bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                    Жарияланған
                  </span>
                ) : (
                  <span className="rounded-lg bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
                    Жасырылған
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-base font-bold text-foreground">
                {test.title}
              </h2>
              {test.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {test.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileQuestion className="h-3.5 w-3.5 text-primary" />
                  {test.questionIds.length} сұрақ
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {test.duration_minutes} мин
                </span>
                <span>Шекті балл: {test.passing_score}%</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-3.5">
              <button
                type="button"
                onClick={() => handleTogglePublish(test)}
                title={test.is_published ? "Жасыру" : "Жариялау"}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {test.is_published ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => openEditModal(test)}
                title="Өңдеу"
                className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(test.id)}
                title="Өшіру"
                className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно конструктора теста */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-xs">
          <div className="my-8 w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editingId ? "Тестті өңдеу" : "Жаңа тест құрастыру"}
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

            <form onSubmit={handleSave} className="mt-4 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Тест атауы
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Мысалы: Python негіздері — Бақылау тесті"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Тақырып (кешенді тест үшін бос қалдырыңыз)
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Барлық тақырыптар (Кешенді тест)</option>
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
                    Уақыт шегі (минут)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Өту шегі (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span>Жариялау</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Қысқаша сипаттама
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Тест мазмұны туралы қысқаша ақпарат..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Конструктор списка вопросов */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Левая колонка: выбранные вопросы и порядок */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Таңдалған сұрақтар ({selectedQuestionIds.length})
                    </span>
                  </div>

                  {selectedQuestionIds.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Оң жақтағы банктен сұрақтарды таңдап қосыңыз
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {selectedQuestionIds.map((qId, idx) => {
                        const q = questionMap.get(qId);
                        if (!q) return null;
                        return (
                          <div
                            key={qId}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-primary">
                                {idx + 1}.{" "}
                              </span>
                              <span className="line-clamp-1 text-foreground">
                                {q.prompt}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveQuestion(idx, -1)}
                                disabled={idx === 0}
                                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveQuestion(idx, 1)}
                                disabled={
                                  idx === selectedQuestionIds.length - 1
                                }
                                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeQuestion(qId)}
                                className="rounded p-1 text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Правая колонка: банк вопросов */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-foreground">
                    Сұрақтар банкі ({availableBankQuestions.length})
                  </div>

                  <div className="mb-2.5 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        placeholder="Іздеу..."
                        className="w-full rounded-lg border border-input bg-card py-1.5 pl-8 pr-2 text-xs"
                      />
                    </div>
                    <select
                      value={bankTopicFilter}
                      onChange={(e) => setBankTopicFilter(e.target.value)}
                      className="max-w-[150px] rounded-lg border border-input bg-card px-2 py-1.5 text-xs"
                    >
                      <option value="all">Барлық тақырып</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                    {availableBankQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-semibold text-primary">
                            {q.topicTitle}
                          </div>
                          <div className="line-clamp-1 text-foreground">
                            {q.prompt}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addQuestion(q.id)}
                          className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                        >
                          + Қосу
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
                  Тестті сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
