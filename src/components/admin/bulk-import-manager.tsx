"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import type { Subject, Topic } from "@/types/database";

interface ValidatedImportItem {
  rowNumber: number;
  subject_id: string;
  topic_id: string;
  topicTitle: string;
  question_type: "single_choice" | "multiple_choice";
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  code_snippet: string;
  explanation: string;
  points: number;
  is_published: boolean;
  options: Array<{
    label: string;
    option_text: string;
    is_correct: boolean;
  }>;
}

interface RowValidationError {
  rowNumber: number;
  message: string;
}

export function BulkImportManager({
  subjects,
  topics,
}: {
  subjects: Subject[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [validItems, setValidItems] = useState<ValidatedImportItem[]>([]);
  const [errors, setErrors] = useState<RowValidationError[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultSubjectId = subjects[0]?.id || "";
  const topicBySlug = new Map(topics.map((t) => [t.slug.toLowerCase(), t]));

  const downloadTemplate = () => {
    const sampleRows = [
      {
        topic_slug: topics[0]?.slug || "number-systems",
        question_type: "single_choice",
        difficulty: "easy",
        prompt: "1010 екілік саны ондық жүйеде нешеге тең",
        code_snippet: "",
        option_a: "10",
        option_b: "12",
        option_c: "8",
        option_d: "14",
        option_e: "",
        correct_answers: "A",
        explanation: "1*8 + 0*4 + 1*2 + 0*1 = 10",
        points: 1,
      },
      {
        topic_slug: topics[0]?.slug || "python",
        question_type: "multiple_choice",
        difficulty: "medium",
        prompt: "Python тіліндегі өзгермейтін (immutable) деректер типтерін таңдаңыз",
        code_snippet: "",
        option_a: "tuple",
        option_b: "str",
        option_c: "list",
        option_d: "dict",
        option_e: "int",
        correct_answers: "A,B,E",
        explanation: "tuple, str және int өзгермейтін типтерге жатады.",
        points: 2,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const topicsSheet = XLSX.utils.json_to_sheet(
      topics.map((t) => ({ topic_slug: t.slug, title: t.title }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
    XLSX.utils.book_append_sheet(workbook, topicsSheet, "Topics_Reference");
    XLSX.writeFile(workbook, "TimAI_Edu_Import_Template.xlsx");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportSuccess(null);
    setServerError(null);
    setValidItems([]);
    setErrors([]);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
      defval: "",
    });

    if (rows.length === 0) {
      setServerError("Файл бос немесе құрылымы қате.");
      return;
    }

    const parsedValid: ValidatedImportItem[] = [];
    const parsedErrors: RowValidationError[] = [];

    rows.forEach((raw, index) => {
      const rowNum = index + 2; // 1-я строка — заголовки
      const slug = String(raw.topic_slug || "")
        .trim()
        .toLowerCase();
      const topic = topicBySlug.get(slug);

      if (!topic) {
        parsedErrors.push({
          rowNumber: rowNum,
          message: `topic_slug табылмады: "${slug}"`,
        });
        return;
      }

      const prompt = String(raw.prompt || "").trim();
      if (prompt.length < 3) {
        parsedErrors.push({
          rowNumber: rowNum,
          message: "prompt (сұрақ мәтіні) бос немесе тым қысқа",
        });
        return;
      }

      const qTypeRaw = String(raw.question_type || "single_choice").trim();
      if (qTypeRaw !== "single_choice" && qTypeRaw !== "multiple_choice") {
        parsedErrors.push({
          rowNumber: rowNum,
          message: `question_type қате: "${qTypeRaw}" (single_choice немесе multiple_choice болуы тиіс)`,
        });
        return;
      }

      const diffRaw = String(raw.difficulty || "medium").trim();
      const difficulty: "easy" | "medium" | "hard" =
        diffRaw === "easy" || diffRaw === "hard" ? diffRaw : "medium";

      const rawOptions = [
        { label: "A", text: String(raw.option_a || "").trim() },
        { label: "B", text: String(raw.option_b || "").trim() },
        { label: "C", text: String(raw.option_c || "").trim() },
        { label: "D", text: String(raw.option_d || "").trim() },
        { label: "E", text: String(raw.option_e || "").trim() },
      ].filter((o) => o.text.length > 0);

      if (rawOptions.length < 2) {
        parsedErrors.push({
          rowNumber: rowNum,
          message: "Кемінде 2 жауап нұсқасы (option_a, option_b) толтырылуы тиіс",
        });
        return;
      }

      const correctLetters = String(raw.correct_answers || "")
        .toUpperCase()
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (correctLetters.length === 0) {
        parsedErrors.push({
          rowNumber: rowNum,
          message: "correct_answers бағанында дұрыс жауап әрпі көрсетілмеген",
        });
        return;
      }

      if (qTypeRaw === "single_choice" && correctLetters.length > 1) {
        parsedErrors.push({
          rowNumber: rowNum,
          message: "single_choice сұрағында тек 1 дұрыс жауап болуы тиіс",
        });
        return;
      }

      const options = rawOptions.map((o) => ({
        label: o.label,
        option_text: o.text,
        is_correct: correctLetters.includes(o.label),
      }));

      if (!options.some((o) => o.is_correct)) {
        parsedErrors.push({
          rowNumber: rowNum,
          message: `correct_answers (${correctLetters.join(",")}) толтырылған нұсқаларға сәйкес келмейді`,
        });
        return;
      }

      const pointsNum = Number(raw.points) || 1;

      parsedValid.push({
        rowNumber: rowNum,
        subject_id: defaultSubjectId,
        topic_id: topic.id,
        topicTitle: topic.title,
        question_type: qTypeRaw,
        difficulty,
        prompt,
        code_snippet: String(raw.code_snippet || "").trim(),
        explanation: String(raw.explanation || "").trim(),
        points: Math.min(10, Math.max(1, pointsNum)),
        is_published: true,
        options,
      });
    });

    setValidItems(parsedValid);
    setErrors(parsedErrors);
  };

  const handleImport = async () => {
    if (validItems.length === 0) return;
    setImporting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validItems.map(({ rowNumber: _r, topicTitle: _t, ...rest }) => rest),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Импорт кезінде қате шықты");
      } else {
        setImportSuccess(
          `Сәтті импортталды: ${json.importedCount} сұрақ дерекқорға қосылды!`
        );
        setValidItems([]);
        router.refresh();
      }
    } catch {
      setServerError("Желі қатесі");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Excel / CSV арқылы жаппай импорт
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Сұрақтар базасын кестелік файл арқылы жылдам жүктеу
          </p>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted"
        >
          <Download className="h-4 w-4 text-primary" />
          Excel үлгісін жүктеу (.xlsx)
        </button>
      </div>

      {/* Зона загрузки файла */}
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
        <FileSpreadsheet className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-base font-bold text-foreground">
          .xlsx немесе .csv файлын таңдаңыз
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Алдымен жоғарыдағы батырма арқылы үлгіні жүктеп алып, ішіндегі{" "}
          <code>Topics_Reference</code> парағынан тақырып кодтарын (topic_slug)
          қараңыз.
        </p>

        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5]">
          <Upload className="h-4 w-4" />
          <span>{fileName ? `Таңдалды: ${fileName}` : "Файлды жүктеу"}</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {importSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-foreground">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Ошибки валидации */}
      {errors.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-card p-5">
          <h3 className="text-sm font-bold text-destructive">
            Валидация қателері ({errors.length} жол):
          </h3>
          <ul className="mt-3 space-y-1.5 text-xs text-foreground">
            {errors.map((err, i) => (
              <li key={i}>
                <span className="font-bold text-destructive">
                  Жол #{err.rowNumber}:
                </span>{" "}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Предварительный просмотр валидных вопросов */}
      {validItems.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Алдын ала қарау: {validItems.length} жарамды сұрақ
              </h3>
              <p className="text-xs text-muted-foreground">
                Барлық жарамды сұрақтар біртұтас транзакцияда импортталады
              </p>
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white hover:bg-success/90 disabled:opacity-60"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              {validItems.length} сұрақты импорттау
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5">Жол</th>
                  <th className="px-3 py-2.5">Тақырып</th>
                  <th className="px-3 py-2.5">Түрі</th>
                  <th className="px-3 py-2.5">Сұрақ</th>
                  <th className="px-3 py-2.5">Дұрыс жауап</th>
                </tr>
              </thead>
              <tbody>
                {validItems.map((item) => (
                  <tr key={item.rowNumber} className="border-b border-border/60">
                    <td className="px-3 py-2.5 font-mono">#{item.rowNumber}</td>
                    <td className="px-3 py-2.5 font-medium">
                      {item.topicTitle}
                    </td>
                    <td className="px-3 py-2.5">{item.question_type}</td>
                    <td className="max-w-md truncate px-3 py-2.5">
                      {item.prompt}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-success">
                      {item.options
                        .filter((o) => o.is_correct)
                        .map((o) => o.label)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
