import { Suspense } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getUserBookmarksData } from "@/services/testing";
import { BookmarkButton } from "@/components/tests/bookmark-button";

async function BookmarksContent() {
  const profile = await requireAuth();
  const bookmarks = await getUserBookmarksData(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Таңдаулы сұрақтар
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Қайталау үшін сақтап қойған сұрақтарыңыз бен есептеріңіз.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            Таңдаулылар тізімі әзірге бос
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Тест немесе практика кезінде сұрақтың оң жағындағы «Сақтау» батырмасын
            басыңыз.
          </p>
          <Link
            href="/tests"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[#233FA5]"
          >
            Тесттерге өту
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((item) => (
            <div
              key={item.bookmarkId}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/subjects/${item.topicSlug}`}
                  className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground hover:underline"
                >
                  {item.topicTitle}
                </Link>
                <BookmarkButton
                  questionId={item.questionId}
                  initialBookmarked={true}
                />
              </div>

              <p className="mt-3 text-base font-semibold text-foreground">
                {item.prompt}
              </p>

              {item.codeSnippet && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-[#182033] p-4 font-mono text-xs leading-6 text-white">
                  <code>{item.codeSnippet}</code>
                </pre>
              )}

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
                  >
                    <span className="font-bold">{opt.label}.</span>{" "}
                    {opt.option_text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-card" />}>
      <BookmarksContent />
    </Suspense>
  );
}
