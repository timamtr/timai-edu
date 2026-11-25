import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckSquare, Clock } from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getLessonDetail } from "@/services/learning";
import { MarkdownRenderer } from "@/components/lessons/markdown-renderer";
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button";

async function LessonDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireAuth();
  const data = await getLessonDetail(slug, profile.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={data.topic ? `/subjects/${data.topic.slug}` : "/subjects"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {data.topic ? data.topic.title : "Тақырыптарға оралу"}
        </Link>
      </div>

      <article className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {data.topic && (
            <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
              {data.topic.title}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Оқу уақыты: {data.lesson.estimated_minutes} минут
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {data.lesson.title}
        </h1>
        {data.lesson.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {data.lesson.description}
          </p>
        )}

        <hr className="my-6 border-border" />

        <MarkdownRenderer content={data.lesson.content_md} />

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Материалды оқып шыққан соң сабақты аяқталды деп белгілеңіз.
          </p>
          <CompleteLessonButton
            lessonId={data.lesson.id}
            lessonSlug={data.lesson.slug}
            initialCompleted={data.isCompleted}
          />
        </div>
      </article>

      {/* Связанные тесты */}
      {data.relatedTests.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-base font-bold text-foreground">
            Біліміңді тест арқылы тексер
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.relatedTests.map((test) => (
              <Link
                key={test.id}
                href={`/tests/${test.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {test.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {test.duration_minutes} минут
                  </div>
                </div>
                <CheckSquare className="h-4 w-4 text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-card" />}>
      <LessonDetailContent params={params} />
    </Suspense>
  );
}
