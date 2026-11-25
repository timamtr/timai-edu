import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Clock,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getTopicDetail } from "@/services/learning";

async function TopicDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireAuth();
  const data = await getTopicDetail(slug, profile.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Барлық тақырыптарға оралу
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {data.topic.title}
        </h1>
        {data.topic.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {data.topic.description}
          </p>
        )}
      </div>

      {/* Теоретические уроки по теме */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Теориялық сабақтар
        </h2>

        {data.lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Бұл бөлімге сабақтар жақында қосылады
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Қазір төмендегі тесттер арқылы біліміңізді тексере аласыз.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.lessons.map((lesson, idx) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                      lesson.isCompleted
                        ? "bg-success/15 text-success"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    {lesson.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lesson.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.estimated_minutes} мин
                      </span>
                      {lesson.isCompleted && (
                        <span className="font-medium text-success">
                          Аяқталған
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Связанные тесты */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Бекітуге арналған тесттер
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.tests.map((test) => (
            <Link
              key={test.id}
              href={`/tests/${test.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40"
            >
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {test.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Уақыты: {test.duration_minutes} минут
                </p>
              </div>
              <CheckSquare className="h-5 w-5 shrink-0 text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-card" />}>
      <TopicDetailContent params={params} />
    </Suspense>
  );
}
