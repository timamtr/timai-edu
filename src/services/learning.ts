import { createClient } from "@/lib/supabase/server";
import type { Lesson, Subject, Test, Topic } from "@/types/database";

export interface DashboardStats {
  completedTestsCount: number;
  averagePercentage: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  topicsStudiedCount: number;
  totalTopicsCount: number;
  recentAttempts: Array<{
    id: string;
    test_title: string;
    score: number;
    max_score: number;
    percentage: number;
    completed_at: string;
  }>;
  progressChart: Array<{
    label: string;
    percentage: number;
  }>;
  continueLesson: {
    slug: string;
    title: string;
    topic_title: string;
    estimated_minutes: number;
  } | null;
  recommendedTopics: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    lessons_count: number;
  }>;
}

export async function getStudentDashboardData(
  userId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    attemptsRes,
    lessonProgressRes,
    lessonsRes,
    topicsRes,
  ] = await Promise.all([
    supabase
      .from("test_attempts")
      .select("id, score, max_score, percentage, completed_at, tests(title)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("lesson_id, is_completed")
      .eq("user_id", userId)
      .eq("is_completed", true),
    supabase
      .from("lessons")
      .select("id, slug, title, topic_id, estimated_minutes, sort_order, topics(title)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("topics")
      .select("id, slug, title, description, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const attempts = attemptsRes.data ?? [];
  const completedLessons = lessonProgressRes.data ?? [];
  const allLessons = lessonsRes.data ?? [];
  const allTopics = topicsRes.data ?? [];

  const completedLessonIds = new Set(completedLessons.map((l) => l.lesson_id));

  const completedTestsCount = attempts.length;
  const averagePercentage =
    completedTestsCount > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + Number(a.percentage || 0), 0) /
            completedTestsCount
        )
      : 0;

  // Изученные темы: темы, где завершён хотя бы 1 урок
  const studiedTopicIds = new Set(
    allLessons
      .filter((l) => completedLessonIds.has(l.id))
      .map((l) => l.topic_id)
  );

  // Следующий незавершённый урок
  const nextLesson = allLessons.find((l) => !completedLessonIds.has(l.id));
  const continueLesson = nextLesson
    ? {
        slug: nextLesson.slug,
        title: nextLesson.title,
        topic_title:
          (Array.isArray(nextLesson.topics)
            ? nextLesson.topics[0]?.title
            : (nextLesson.topics as { title?: string } | null)?.title) ||
          "Информатика",
        estimated_minutes: nextLesson.estimated_minutes,
      }
    : null;

  // Рекомендованные темы (те, где ещё не все уроки пройдены или нет прогресса)
  const lessonsByTopic = new Map<string, number>();
  allLessons.forEach((l) => {
    lessonsByTopic.set(l.topic_id, (lessonsByTopic.get(l.topic_id) || 0) + 1);
  });

  const recommendedTopics = allTopics
    .filter((t) => !studiedTopicIds.has(t.id))
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      lessons_count: lessonsByTopic.get(t.id) || 0,
    }));

  const recentAttempts = attempts.slice(0, 5).map((a) => {
    const testObj = Array.isArray(a.tests)
      ? a.tests[0]
      : (a.tests as { title?: string } | null);
    return {
      id: a.id,
      test_title: testObj?.title || "Сынақ тесті",
      score: a.score,
      max_score: a.max_score,
      percentage: Math.round(Number(a.percentage || 0)),
      completed_at: a.completed_at || "",
    };
  });

  const progressChart = [...attempts]
    .slice(0, 8)
    .reverse()
    .map((a, idx) => ({
      label: `#${idx + 1}`,
      percentage: Math.round(Number(a.percentage || 0)),
    }));

  return {
    completedTestsCount,
    averagePercentage,
    completedLessonsCount: completedLessonIds.size,
    totalLessonsCount: allLessons.length,
    topicsStudiedCount: studiedTopicIds.size,
    totalTopicsCount: allTopics.length,
    recentAttempts,
    progressChart,
    continueLesson,
    recommendedTopics,
  };
}

export interface TopicWithProgress extends Topic {
  lessonsCount: number;
  completedLessonsCount: number;
  questionsCount: number;
}

export async function getSubjectsAndTopics(userId: string): Promise<{
  subjects: Subject[];
  topics: TopicWithProgress[];
}> {
  const supabase = await createClient();

  const [subjectsRes, topicsRes, lessonsRes, progressRes, questionsRes] =
    await Promise.all([
      supabase
        .from("subjects")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("topics")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("lessons")
        .select("id, topic_id")
        .eq("is_published", true),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("is_completed", true),
      supabase
        .from("questions")
        .select("id, topic_id")
        .eq("is_published", true),
    ]);

  const completedIds = new Set(
    (progressRes.data ?? []).map((p) => p.lesson_id)
  );
  const lessons = lessonsRes.data ?? [];
  const questions = questionsRes.data ?? [];

  const topics: TopicWithProgress[] = (topicsRes.data ?? []).map((topic) => {
    const topicLessons = lessons.filter((l) => l.topic_id === topic.id);
    const completedCount = topicLessons.filter((l) =>
      completedIds.has(l.id)
    ).length;
    const topicQuestions = questions.filter((q) => q.topic_id === topic.id);

    return {
      ...(topic as Topic),
      lessonsCount: topicLessons.length,
      completedLessonsCount: completedCount,
      questionsCount: topicQuestions.length,
    };
  });

  return {
    subjects: (subjectsRes.data ?? []) as Subject[],
    topics,
  };
}

export async function getTopicDetail(slug: string, userId: string) {
  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!topic) return null;

  const [lessonsRes, progressRes, testsRes] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("topic_id", topic.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("is_completed", true),
    supabase
      .from("tests")
      .select("*")
      .eq("is_published", true)
      .or(`topic_id.eq.${topic.id},topic_id.is.null`)
      .order("created_at", { ascending: true }),
  ]);

  const completedIds = new Set(
    (progressRes.data ?? []).map((p) => p.lesson_id)
  );

  const lessons = (lessonsRes.data ?? []).map((l) => ({
    ...(l as Lesson),
    isCompleted: completedIds.has(l.id),
  }));

  return {
    topic: topic as Topic,
    lessons,
    tests: (testsRes.data ?? []) as Test[],
  };
}

export async function getLessonDetail(slug: string, userId: string) {
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, topics(id, slug, title)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!lesson) return null;

  const topicObj = Array.isArray(lesson.topics)
    ? lesson.topics[0]
    : (lesson.topics as { id: string; slug: string; title: string } | null);

  const [progressRes, testsRes] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("is_completed")
      .eq("user_id", userId)
      .eq("lesson_id", lesson.id)
      .maybeSingle(),
    supabase
      .from("tests")
      .select("*")
      .eq("is_published", true)
      .limit(3),
  ]);

  return {
    lesson: lesson as Lesson,
    topic: topicObj,
    isCompleted: Boolean(progressRes.data?.is_completed),
    relatedTests: (testsRes.data ?? []) as Test[],
  };
}
