import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getSubjectsAndTopics } from "@/services/learning";

async function SubjectsContent() {
  const profile = await requireAuth();
  const { subjects, topics } = await getSubjectsAndTopics(profile.id);
  const mainSubject = subjects[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          ҰБТ бағдарламасы
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {mainSubject?.title || "Информатика"} — Тақырыптар каталогы
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mainSubject?.description ||
            "Барлық бөлімдер бойынша теориялық сабақтар мен тәжірибелік сұрақтар"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, index) => {
          const isCompleted =
            topic.lessonsCount > 0 &&
            topic.completedLessonsCount === topic.lessonsCount;

          return (
            <Link
              key={topic.id}
              href={`/subjects/${topic.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Меңгерілді
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  )}
                </div>

                <h2 className="mt-4 text-base font-bold text-foreground group-hover:text-primary">
                  {topic.title}
                </h2>
                {topic.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center gap-4 border-t border-border pt-3.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {topic.completedLessonsCount}/{topic.lessonsCount} сабақ
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  {topic.questionsCount} сұрақ
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      }
    >
      <SubjectsContent />
    </Suspense>
  );
}
