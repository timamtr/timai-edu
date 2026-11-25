import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Target,
  TrendingUp,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getStudentDashboardData } from "@/services/learning";
import { ProgressChart } from "@/components/dashboard/progress-chart";

async function DashboardContent() {
  const profile = await requireAuth();
  const stats = await getStudentDashboardData(profile.id);

  const overallProgress =
    stats.totalLessonsCount > 0
      ? Math.round((stats.completedLessonsCount / stats.totalLessonsCount) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Сәлем, {profile.full_name || "Оқушы"}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Бүгінгі оқу жоспарың мен ҰБТ-ға дайындық көрсеткіштерің
          </p>
        </div>

        <Link
          href="/tests"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-[#233FA5]"
        >
          Тест тапсыру
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 4 карточки реальной статистики */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Тапсырылған тесттер</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {stats.completedTestsCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Аяқталған талпыныстар саны
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Орташа дұрыс жауап</span>
            <Target className="h-4 w-4 text-success" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {stats.averagePercentage}%
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Барлық тесттер бойынша орташа мән
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Меңгерілген тақырыптар</span>
            <Layers className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {stats.topicsStudiedCount}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {stats.totalTopicsCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Информатика бөлімдері
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Оқу прогресі</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 text-2xl font-bold text-foreground">
            {overallProgress}%
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* График + Продолжение обучения */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Нәтижелер динамикасы
              </h2>
              <p className="text-xs text-muted-foreground">
                Соңғы тест талпыныстары бойынша пайыздық көрсеткіш
              </p>
            </div>
          </div>
          <ProgressChart data={stats.progressChart} />
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div>
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              Оқуды жалғастыру
            </span>

            {stats.continueLesson ? (
              <div className="mt-4">
                <div className="text-xs font-medium text-muted-foreground">
                  {stats.continueLesson.topic_title}
                </div>
                <h3 className="mt-1 text-lg font-bold text-foreground">
                  {stats.continueLesson.title}
                </h3>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>~{stats.continueLesson.estimated_minutes} минут</span>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-bold text-foreground">
                  Барлық сабақтар аяқталды!
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Біліміңді тексеру үшін кешенді тест тапсыр.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            {stats.continueLesson ? (
              <Link
                href={`/lessons/${stats.continueLesson.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
              >
                <BookOpen className="h-4 w-4" />
                Сабақты ашу
              </Link>
            ) : (
              <Link
                href="/tests"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
              >
                Тесттерге өту
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Последние результаты + Рекомендованные темы */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Соңғы нәтижелер
            </h2>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Толығырақ
            </Link>
          </div>

          {stats.recentAttempts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Сіз әлі бірде-бір тест тапсырған жоқсыз.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentAttempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/tests/attempts/${attempt.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {attempt.test_title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {attempt.score} / {attempt.max_score} балл
                    </div>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      attempt.percentage >= 60
                        ? "bg-success/15 text-success"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {attempt.percentage}%
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Ұсынылатын тақырыптар
            </h2>
            <Link
              href="/subjects"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Барлық тақырыптар
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recommendedTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/subjects/${topic.slug}`}
                className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="pr-3">
                  <div className="text-sm font-semibold text-foreground">
                    {topic.title}
                  </div>
                  {topic.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {topic.description}
                    </div>
                  )}
                </div>
                <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {topic.lessons_count} сабақ
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
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
      <DashboardContent />
    </Suspense>
  );
}
