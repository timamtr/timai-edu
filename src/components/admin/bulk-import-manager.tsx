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

interface ParsedRow {
  rowNumber: number;
  topicTitle: string;
  valid: boolean;
  error?: string;
  payload?: {
    subject_id: string;
    topic_id: string;
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
  };
}

export function BulkImportManager({
  subjects,
  topics,
}: {
  subjects: Subject[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const defaultSubjectId = subjects[0]?.id || "";
  const topicBySlug = new Map(topics.map((t) => [t.slug.toLowerCase(), t]));

  const downloadTemplate = () => {
    const sampleRows = [
      {
        topic_slug: topics[0]?.slug || "computer-devices",
        question_type: "single_choice",
        difficulty: "easy",
        points: 1,
        prompt: "Екілік санау жүйесінің негізі нешеге тең",
        code_snippet: "",
        option_a: "2",
        option_b: "8",
        option_c: "10",
        option_d: "16",
        option_e: "",
        option_f: "",
        correct_answers: "A",
        explanation: "Екілік санау жүйесінде тек 0 және 1 цифрлары қолданылады.",
      },
      {
        topic_slug: topics[0]?.slug || "computer-devices",
        question_type: "multiple_choice",
        difficulty: "medium",
        points: 2,
        prompt: "Компьютердің ішкі жадына жататын құрылғылар",
        code_snippet: "",
        option_a: "Жедел жад (RAM)",
        option_b: "Қатқыл диск (HDD)",
        option_c: "Тұрақты жад (ROM)",
        option_d: "Флеш-жад",
        option_e: "Кэш-жад (Cache)",
        option_f: "",
        correct_answers: "A, C, E",
        explanation: "Ішкі жадқа RAM, ROM және Кэш-жад жатады.",
      },
    ];

    const topicsRef = topics.map((t) => ({
      topic_slug: t.slug,
      topic_title: t.title,
    }));

    const wb = XLSX.utils.book_new();
    const wsQuestions = XLSX.utils.json_to_sheet(sampleRows);
    const wsTopics = XLSX.utils.json_to_sheet(topicsRef);
    XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");
    XLSX.utils.book_append_sheet(wb, wsTopics, "Topics_Reference");
    XLSX.writeFile(wb, "timai_edu_questions_template.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportSuccess(null);
    setImportError(null);

    const buffer = await file.arrayBuffer();
    let wb: XLSX.WorkBook;

    if (file.name.toLowerCase().endsWith(".csv")) {
      let text = new TextDecoder("utf-8").decode(buffer);
      if (text.includes("\uFFFD")) {
        text = new TextDecoder("windows-1251").decode(buffer);
      }
      wb = XLSX.read(text, { type: "string" });
    } else {
      wb = XLSX.read(buffer, { type: "array" });
    }

    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      firstSheet,
      { defval: "" }
    );

    const parsed: ParsedRow[] = rawJson.map((raw, idx) => {
      const rowNumber = idx + 2;
      const slug = String(raw.topic_slug || "")
        .trim()
        .toLowerCase();
      const topic = topicBySlug.get(slug);

      if (!topic) {
        return {
          rowNumber,
          topicTitle: slug || "Белгісіз",
          valid: false,
          error: `Тақырып табылмады (topic_slug: "${slug}")`,
        };
      }

      const qTypeRaw = String(raw.question_type || "single_choice").trim();
      if (qTypeRaw !== "single_choice" && qTypeRaw !== "multiple_choice") {
        return {
          rowNumber,
          topicTitle: topic.title,
          valid: false,
          error: `Қате question_type: "${qTypeRaw}"`,
        };
      }

      const diffRaw = String(raw.difficulty || "medium").trim();
      const difficulty =
        diffRaw === "easy" || diffRaw === "medium" || diffRaw === "hard"
          ? diffRaw
          : "medium";

      const prompt = String(raw.prompt || "").trim();
      if (prompt.length < 3) {
        return {
          rowNumber,
          topicTitle: topic.title,
          valid: false,
          error: "Сұрақ мәтіні тым қысқа",
        };
      }

      const correctSet = new Set(
        String(raw.correct_answers || "")
          .toUpperCase()
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      );

      const optionEntries: Array<{ label: string; text: string }> = [
        { label: "A", text: String(raw.option_a || "").trim() },
        { label: "B", text: String(raw.option_b || "").trim() },
        { label: "C", text: String(raw.option_c || "").trim() },
        { label: "D", text: String(raw.option_d || "").trim() },
        { label: "E", text: String(raw.option_e || "").trim() },
        { label: "F", text: String(raw.option_f || "").trim() },
      ].filter((item) => item.text.length > 0);

      if (optionEntries.length < 2) {
        return {
          rowNumber,
          topicTitle: topic.title,
          valid: false,
          error: "Кемінде 2 жауап нұсқасы болуы тиіс",
        };
      }

      const options = optionEntries.map((item) => ({
        label: item.label,
        option_text: item.text,
        is_correct: correctSet.has(item.label),
      }));

      const correctCount = options.filter((o) => o.is_correct).length;
      if (correctCount === 0) {
        return {
          rowNumber,
          topicTitle: topic.title,
          valid: false,
          error: "Дұрыс жауап көрсетілмеген (correct_answers)",
        };
      }

      if (qTypeRaw === "single_choice" && correctCount !== 1) {
        return {
          rowNumber,
          topicTitle: topic.title,
          valid: false,
          error: "single_choice түрінде тек 1 дұрыс жауап болуы тиіс",
        };
      }

      const points = Math.max(1, Math.min(10, Number(raw.points) || 1));

      return {
        rowNumber,
        topicTitle: topic.title,
        valid: true,
        payload: {
          subject_id: defaultSubjectId,
          topic_id: topic.id,
          question_type: qTypeRaw,
          difficulty,
          prompt,
          code_snippet: String(raw.code_snippet || "").trim(),
          explanation: String(raw.explanation || "").trim(),
          points,
          is_published: true,
          options,
        },
      };
    });

    setRows(parsed);
  };

  const validRows = rows.filter((r) => r.valid && r.payload);
  const invalidRows = rows.filter((r) => !r.valid);

  const handleConfirmImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validRows.map((r) => r.payload),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error || "Импорт кезінде қате шықты");
        setImporting(false);
        return;
      }

      setImportSuccess(
        `Сәтті импортталды: ${json.importedCount} сұрақ дерекқорға қосылды!`
      );
      setRows([]);
      router.refresh();
    } catch {
      setImportError("Желі қатесі");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Сұрақтарды жаппай импорттау (Excel / CSV)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            .xlsx немесе .csv файлы арқылы сұрақтар банкін жылдам толтырыңыз
          </p>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
        >
          <Download className="h-4 w-4 text-primary" />
          Excel үлгісін жүктеу (.xlsx)
        </button>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
        <FileSpreadsheet className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-base font-bold text-foreground">
          Толтырылған Excel немесе CSV файлын таңдаңыз
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Файлда <code className="font-mono">topic_slug</code>,{" "}
          <code className="font-mono">question_type</code>,{" "}
          <code className="font-mono">prompt</code>,{" "}
          <code className="font-mono">option_a..option_f</code> және{" "}
          <code className="font-mono">correct_answers</code> бағандары болуы
          тиіс.
        </p>

        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-[#233FA5]">
          <Upload className="h-4 w-4" />
          <span>{fileName ? `Таңдалды: ${fileName}` : "Файлды таңдау"}</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {importSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {importSuccess}
        </div>
      )}

      {importError && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {importError}
        </div>
      )}

      {invalidRows.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h3 className="text-sm font-bold text-destructive">
            Қате табылған жолдар ({invalidRows.length}) — бұл жолдар
            импортталмайды:
          </h3>
          <ul className="mt-2.5 space-y-1 text-xs text-destructive">
            {invalidRows.map((r) => (
              <li key={r.rowNumber}>
                • <strong>{r.rowNumber}-жол:</strong> {r.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validRows.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Алдын ала қарау: {validRows.length} жарамды сұрақ
              </h3>
              <p className="text-xs text-muted-foreground">
                Барлық жарамды сұрақтар біртұтас транзакцияда импортталады
              </p>
            </div>

            <button
              type="button"
              disabled={importing}
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-95 disabled:opacity-60"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              {validRows.length} сұрақты импорттау
            </button>
          </div>

          <div className="max-h-96 overflow-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground">
                  <th className="px-3 py-2.5">Жол</th>
                  <th className="px-3 py-2.5">Тақырып</th>
                  <th className="px-3 py-2.5">Түрі</th>
                  <th className="px-3 py-2.5">Сұрақ</th>
                  <th className="px-3 py-2.5">Дұрыс жауап</th>
                </tr>
              </thead>
              <tbody>
                {validRows.map((r) => (
                  <tr
                    key={r.rowNumber}
                    className="border-b border-border/60 last:border-none"
                  >
                    <td className="px-3 py-2.5 font-mono text-muted-foreground">
                      #{r.rowNumber}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{r.topicTitle}</td>
                    <td className="px-3 py-2.5">
                      {r.payload?.question_type}
                    </td>
                    <td className="max-w-md truncate px-3 py-2.5">
                      {r.payload?.prompt}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-success">
                      {r.payload?.options
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
