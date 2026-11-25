import { Suspense } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getStudentAnalyticsData } from "@/services/analytics";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";

async function AnalyticsContent() {
  const profile = await requireAuth();
  const data = await getStudentAnalyticsData(profile.id);

  const theoryProgress =
    data.totalLessonsCount > 0
      ? Math.round((data.completedLessonsCount / data.totalLessonsCount) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Оқу аналитикасы және прогресс
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Барлық көрсеткіштер сіздің нақты тест және квиз нәтижелеріңіз негізінде
          есептеледі.
        </p>
      </div>

      {/* 4 ключевые метрики */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Жалпы прогресс</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {theoryProgress}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.completedLessonsCount} / {data.totalLessonsCount} сабақ
            аяқталды
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Дұрыс жауап үлесі</span>
            <Target className="h-4 w-4 text-success" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {data.overallAccuracy}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.totalCorrectQuestions} / {data.totalSolvedQuestions} дұрыс
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Шешілген сұрақтар</span>
            <HelpCircle className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {data.totalSolvedQuestions}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Тесттер мен квиздер жиынтығы
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Аяқталған тесттер</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {data.completedTestsCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Сынақ тест талпыныстары
          </p>
        </div>
      </div>

      {/* Графики */}
      <AnalyticsCharts
        dynamics={data.dynamics}
        topicBreakdown={data.topicBreakdown}
      />

      {/* Слабые темы и полный разбивка по темам */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Слабые темы */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-base font-bold text-foreground">
              Қайталауды қажет ететін тақырыптар
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Дұрыс жауап көрсеткіші 70%-дан төмен бөлімдер
          </p>

          {data.weakTopics.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center text-xs text-muted-foreground">
              {data.totalSolvedQuestions === 0
                ? "Әзірге деректер жеткіліксіз. Тест тапсырып көріңіз."
                : "Керемет! Барлық өтілген тақырыптар бойынша көрсеткіш 70%-дан жоғары."}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {data.weakTopics.map((wt) => (
                <div
                  key={wt.topicId}
                  className="rounded-xl border border-warning/30 bg-warning/5 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {wt.title}
                    </span>
                    <span className="rounded-lg bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
                      {wt.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {wt.correctCount}/{wt.answeredCount} сұрақ дұрыс
                    </span>
                    <Link
                      href={`/subjects/${wt.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Тақырыпты ашу
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Результаты по всем темам */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
          <h2 className="text-base font-bold text-foreground">
            Барлық тақырыптар бойынша нәтижелер
          </h2>
          <div className="mt-4 space-y-3">
            {data.topicBreakdown.map((t) => (
              <div
                key={t.topicId}
                className="flex flex-col justify-between gap-2 rounded-xl border border-border p-3.5 sm:flex-row sm:items-center"
              >
                <div>
                  <Link
                    href={`/subjects/${t.slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {t.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {t.answeredCount > 0
                      ? `${t.correctCount} / ${t.answeredCount} сұрақ дұрыс`
                      : "Әлі сұрақтар шешілмеген"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {t.accuracy !== null ? (
                    <>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            t.accuracy >= 70
                              ? "bg-success"
                              : t.accuracy >= 50
                              ? "bg-warning"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-foreground">
                        {t.accuracy}%
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Полная история тестирования */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-base font-bold text-foreground">
          Тестілеу тарихы
        </h2>

        {data.history.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Тестілеу тарихы бос
            </p>
            <Link
              href="/tests"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-[#233FA5]"
            >
              Алғашқы тестті бастау
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3">Тест атауы</th>
                  <th className="px-4 py-3">Балл</th>
                  <th className="px-4 py-3">Дұрыс / Қате</th>
                  <th className="px-4 py-3">Уақыт</th>
                  <th className="px-4 py-3">Нәтиже</th>
                  <th className="px-4 py-3 text-right">Талдау</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((item) => {
                  const mins = Math.floor(item.timeSpentSeconds / 60);
                  const secs = item.timeSpentSeconds % 60;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/60 last:border-none hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {item.testTitle}
                      </td>
                      <td className="px-4 py-3.5">
                        {item.score} / {item.maxScore}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="font-semibold text-success">
                          {item.correctCount}
                        </span>{" "}
                        /{" "}
                        <span className="font-semibold text-destructive">
                          {item.wrongCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {mins} м {secs} с
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                            item.percentage >= 60
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/tests/attempts/${item.id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Қарау →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
