import { createClient } from "@/lib/supabase/server";

export interface TopicAnalyticsItem {
  topicId: string;
  slug: string;
  title: string;
  answeredCount: number;
  correctCount: number;
  accuracy: number | null;
}

export interface AnalyticsHistoryItem {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface StudentAnalyticsData {
  totalSolvedQuestions: number;
  totalCorrectQuestions: number;
  overallAccuracy: number;
  completedTestsCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  topicBreakdown: TopicAnalyticsItem[];
  weakTopics: TopicAnalyticsItem[];
  dynamics: Array<{
    attemptLabel: string;
    testTitle: string;
    percentage: number;
  }>;
  history: AnalyticsHistoryItem[];
}

function extractTopicId(questionsField: unknown): string | null {
  if (!questionsField) return null;
  if (Array.isArray(questionsField)) {
    return (questionsField[0] as { topic_id?: string } | undefined)?.topic_id ?? null;
  }
  return (questionsField as { topic_id?: string }).topic_id ?? null;
}

export async function getStudentAnalyticsData(
  userId: string
): Promise<StudentAnalyticsData> {
  const supabase = await createClient();

  const [
    topicsRes,
    lessonsRes,
    lessonProgressRes,
    attemptsRes,
    userAnswersRes,
    quizAnswersRes,
  ] = await Promise.all([
    supabase
      .from("topics")
      .select("id, slug, title, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("lessons")
      .select("id")
      .eq("is_published", true),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("is_completed", true),
    supabase
      .from("test_attempts")
      .select(
        "id, test_id, score, max_score, percentage, correct_count, wrong_count, time_spent_seconds, completed_at, tests(title)"
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
    supabase
      .from("user_answers")
      .select(
        "is_correct, questions(topic_id), test_attempts!inner(user_id, status)"
      )
      .eq("test_attempts.user_id", userId)
      .eq("test_attempts.status", "completed"),
    supabase
      .from("quiz_answers")
      .select("is_correct, questions(topic_id), quiz_sessions!inner(user_id)")
      .eq("quiz_sessions.user_id", userId),
  ]);

  const topics = topicsRes.data ?? [];
  const totalLessonsCount = (lessonsRes.data ?? []).length;
  const completedLessonsCount = (lessonProgressRes.data ?? []).length;
  const attempts = attemptsRes.data ?? [];
  const testAnswers = userAnswersRes.data ?? [];
  const quizAnswers = quizAnswersRes.data ?? [];

  // Агрегация ответов по темам (тесты + быстрые квизы)
  const topicStatsMap = new Map<string, { answered: number; correct: number }>();

  let totalSolvedQuestions = 0;
  let totalCorrectQuestions = 0;

  for (const ans of testAnswers) {
    if (ans.is_correct === null) continue;
    totalSolvedQuestions += 1;
    if (ans.is_correct) totalCorrectQuestions += 1;

    const tId = extractTopicId(ans.questions);
    if (tId) {
      const curr = topicStatsMap.get(tId) || { answered: 0, correct: 0 };
      curr.answered += 1;
      if (ans.is_correct) curr.correct += 1;
      topicStatsMap.set(tId, curr);
    }
  }

  for (const qAns of quizAnswers) {
    totalSolvedQuestions += 1;
    if (qAns.is_correct) totalCorrectQuestions += 1;

    const tId = extractTopicId(qAns.questions);
    if (tId) {
      const curr = topicStatsMap.get(tId) || { answered: 0, correct: 0 };
      curr.answered += 1;
      if (qAns.is_correct) curr.correct += 1;
      topicStatsMap.set(tId, curr);
    }
  }

  const overallAccuracy =
    totalSolvedQuestions > 0
      ? Math.round((totalCorrectQuestions / totalSolvedQuestions) * 100)
      : 0;

  const topicBreakdown: TopicAnalyticsItem[] = topics.map((t) => {
    const stat = topicStatsMap.get(t.id);
    const answeredCount = stat?.answered ?? 0;
    const correctCount = stat?.correct ?? 0;
    const accuracy =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

    return {
      topicId: t.id,
      slug: t.slug,
      title: t.title,
      answeredCount,
      correctCount,
      accuracy,
    };
  });

  // Слабые темы: точность < 70% среди тем, где уже решались вопросы
  const weakTopics = topicBreakdown
    .filter((t) => t.accuracy !== null && t.accuracy < 70)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

  const history: AnalyticsHistoryItem[] = attempts.map((a) => {
    const testObj = Array.isArray(a.tests)
      ? a.tests[0]
      : (a.tests as { title?: string } | null);

    return {
      id: a.id,
      testId: a.test_id,
      testTitle: testObj?.title || "Сынақ тесті",
      score: a.score,
      maxScore: a.max_score,
      percentage: Math.round(Number(a.percentage || 0)),
      correctCount: a.correct_count,
      wrongCount: a.wrong_count,
      timeSpentSeconds: a.time_spent_seconds,
      completedAt: a.completed_at || "",
    };
  });

  const dynamics = [...history]
    .slice(0, 12)
    .reverse()
    .map((item, idx) => ({
      attemptLabel: `#${idx + 1}`,
      testTitle: item.testTitle,
      percentage: item.percentage,
    }));

  return {
    totalSolvedQuestions,
    totalCorrectQuestions,
    overallAccuracy,
    completedTestsCount: attempts.length,
    completedLessonsCount,
    totalLessonsCount,
    topicBreakdown,
    weakTopics,
    dynamics,
    history,
  };
}
