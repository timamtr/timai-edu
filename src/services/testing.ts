import { createClient } from "@/lib/supabase/server";
import type {
  Question,
  QuestionOption,
  Test,
  TestCategory,
  Topic,
} from "@/types/database";
import { getSectionByTopicTitle } from "@/config/curriculum";

export interface TestListItem extends Test {
  testCategory: TestCategory;
  sectionTitle: string | null;
  questionsCount: number;
  topicTitle: string | null;
  bestPercentage: number | null;
  attemptsCount: number;
}

function resolveCategory(raw: {
  test_category?: string | null;
  topic_id?: string | null;
  section_title?: string | null;
}): TestCategory {
  if (
    raw.test_category === "topic" ||
    raw.test_category === "section" ||
    raw.test_category === "unt_variant"
  ) {
    return raw.test_category;
  }
  if (raw.topic_id) return "topic";
  if (raw.section_title) return "section";
  return "unt_variant";
}

export async function getPublishedTestsData(userId: string): Promise<{
  topicAndSectionTests: TestListItem[];
  untVariants: TestListItem[];
  topics: Topic[];
}> {
  const supabase = await createClient();

  const [testsRes, topicsRes, attemptsRes] = await Promise.all([
    supabase
      .from("tests")
      .select("*, topics(title), test_questions(count)")
      .eq("is_published", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("topics")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("test_attempts")
      .select("test_id, percentage")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  const attempts = attemptsRes.data ?? [];
  const attemptsByTest = new Map<string, number[]>();
  attempts.forEach((a) => {
    const arr = attemptsByTest.get(a.test_id) || [];
    arr.push(Math.round(Number(a.percentage || 0)));
    attemptsByTest.set(a.test_id, arr);
  });

  const allMapped: TestListItem[] = (testsRes.data ?? []).map((t) => {
    const topicObj = Array.isArray(t.topics)
      ? t.topics[0]
      : (t.topics as { title?: string } | null);
    const countArr = Array.isArray(t.test_questions) ? t.test_questions : [];
    const questionsCount = countArr[0]?.count ?? 0;
    const userScores = attemptsByTest.get(t.id) || [];
    const category = resolveCategory(t);
    const topicTitle = topicObj?.title ?? null;

    const computedSection =
      t.section_title ||
      (topicTitle ? getSectionByTopicTitle(topicTitle) : null);

    return {
      id: t.id,
      subject_id: t.subject_id,
      topic_id: t.topic_id,
      test_category: category,
      section_title: computedSection,
      title: t.title,
      description: t.description,
      duration_minutes: t.duration_minutes,
      passing_score: t.passing_score,
      is_published: t.is_published,
      is_demo: t.is_demo,
      created_at: t.created_at,
      testCategory: category,
      sectionTitle: computedSection,
      questionsCount,
      topicTitle,
      bestPercentage: userScores.length > 0 ? Math.max(...userScores) : null,
      attemptsCount: userScores.length,
    };
  });

  return {
    topicAndSectionTests: allMapped.filter(
      (t) => t.testCategory === "topic" || t.testCategory === "section"
    ),
    untVariants: allMapped.filter((t) => t.testCategory === "unt_variant"),
    topics: (topicsRes.data ?? []) as Topic[],
  };
}

export async function getTestDetails(testId: string, userId: string) {
  const supabase = await createClient();

  const [testRes, attemptsRes] = await Promise.all([
    supabase
      .from("tests")
      .select("*, topics(title), test_questions(count)")
      .eq("id", testId)
      .eq("is_published", true)
      .single(),
    supabase
      .from("test_attempts")
      .select("*")
      .eq("test_id", testId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (testRes.error || !testRes.data) {
    return null;
  }

  const t = testRes.data;
  const topicObj = Array.isArray(t.topics)
    ? t.topics[0]
    : (t.topics as { title?: string } | null);
  const countArr = Array.isArray(t.test_questions) ? t.test_questions : [];
  const category = resolveCategory(t);

  return {
    test: {
      ...(t as Test),
      testCategory: category,
      sectionTitle: t.section_title ?? null,
      topicTitle: topicObj?.title ?? null,
      questionsCount: countArr[0]?.count ?? 0,
    },
    attempts: attemptsRes.data ?? [],
  };
}

export async function getAttemptPlayData(attemptId: string, userId: string) {
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("test_attempts")
    .select("*, tests(id, title, duration_minutes)")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .single();

  if (!attempt) return null;

  const testObj = Array.isArray(attempt.tests)
    ? attempt.tests[0]
    : (attempt.tests as {
        id: string;
        title: string;
        duration_minutes: number;
      } | null);

  if (attempt.status !== "in_progress") {
    return {
      status: attempt.status as "completed" | "expired",
      attemptId: attempt.id,
    };
  }

  const [tqRes, answersRes, bookmarksRes] = await Promise.all([
    supabase
      .from("test_questions")
      .select(
        "sort_order, questions(id, subject_id, topic_id, question_type, difficulty, prompt, code_snippet, image_url, points, is_published, is_demo, question_options(id, question_id, label, option_text, sort_order))"
      )
      .eq("test_id", attempt.test_id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("user_answers")
      .select("question_id, selected_option_ids")
      .eq("attempt_id", attemptId),
    supabase.from("bookmarks").select("question_id").eq("user_id", userId),
  ]);

  const questions: Question[] = (tqRes.data ?? [])
    .map((row) => {
      const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
      if (!q) return null;
      const opts = (q.question_options ?? []).sort(
        (a: QuestionOption, b: QuestionOption) => a.sort_order - b.sort_order
      );
      return {
        id: q.id,
        subject_id: q.subject_id,
        topic_id: q.topic_id,
        question_type: q.question_type,
        difficulty: q.difficulty,
        prompt: q.prompt,
        code_snippet: q.code_snippet,
        image_url: q.image_url,
        points: q.points,
        is_published: q.is_published,
        is_demo: q.is_demo,
        options: opts,
      } as Question;
    })
    .filter((item): item is Question => item !== null);

  const initialAnswers: Record<string, string[]> = {};
  (answersRes.data ?? []).forEach((ans) => {
    initialAnswers[ans.question_id] = ans.selected_option_ids ?? [];
  });

  const bookmarkedIds = (bookmarksRes.data ?? []).map((b) => b.question_id);

  return {
    status: "in_progress" as const,
    attemptId: attempt.id,
    startedAt: attempt.started_at,
    testTitle: testObj?.title || "Сынақ тесті",
    durationMinutes: testObj?.duration_minutes || 30,
    questions,
    initialAnswers,
    bookmarkedIds,
  };
}

export interface AttemptReviewQuestion {
  question_id: string;
  sort_order: number;
  question_type: string;
  difficulty: string;
  prompt: string;
  code_snippet: string | null;
  image_url: string | null;
  explanation: string | null;
  points: number;
  selected_option_ids: string[];
  correct_option_ids: string[];
  is_correct: boolean;
  points_awarded: number;
  options: QuestionOption[];
}

export async function getAttemptResultData(attemptId: string, userId: string) {
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("test_attempts")
    .select("*, tests(id, title, passing_score)")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .single();

  if (!attempt || attempt.status !== "completed") {
    return null;
  }

  const testObj = Array.isArray(attempt.tests)
    ? attempt.tests[0]
    : (attempt.tests as {
        id: string;
        title: string;
        passing_score: number;
      } | null);

  const [reviewRes, optionsRes, bookmarksRes] = await Promise.all([
    supabase.rpc("get_attempt_review", { p_attempt_id: attemptId }),
    supabase
      .from("test_questions")
      .select("question_id, questions(question_options(*))")
      .eq("test_id", attempt.test_id),
    supabase.from("bookmarks").select("question_id").eq("user_id", userId),
  ]);

  const optionsMap = new Map<string, QuestionOption[]>();
  (optionsRes.data ?? []).forEach((row) => {
    const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
    if (q?.question_options) {
      const sorted = [...q.question_options].sort(
        (a: QuestionOption, b: QuestionOption) => a.sort_order - b.sort_order
      );
      optionsMap.set(row.question_id, sorted);
    }
  });

  const review: AttemptReviewQuestion[] = (reviewRes.data ?? []).map(
    (item: AttemptReviewQuestion) => ({
      ...item,
      options: optionsMap.get(item.question_id) || [],
    })
  );

  return {
    attempt,
    testId: testObj?.id || attempt.test_id,
    testTitle: testObj?.title || "Сынақ тесті",
    passingScore: testObj?.passing_score ?? 60,
    review,
    bookmarkedIds: (bookmarksRes.data ?? []).map((b) => b.question_id),
  };
}

export async function getUserBookmarksData(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookmarks")
    .select(
      "id, created_at, questions(id, question_type, difficulty, prompt, code_snippet, points, topics(title, slug), question_options(id, label, option_text, sort_order))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? [])
    .map((b) => {
      const q = Array.isArray(b.questions) ? b.questions[0] : b.questions;
      if (!q) return null;
      const topicObj = Array.isArray(q.topics)
        ? q.topics[0]
        : (q.topics as { title?: string; slug?: string } | null);
      const options = (q.question_options ?? []).sort(
        (a: { sort_order: number }, c: { sort_order: number }) =>
          a.sort_order - c.sort_order
      );
      return {
        bookmarkId: b.id,
        questionId: q.id,
        questionType: q.question_type,
        difficulty: q.difficulty,
        prompt: q.prompt,
        codeSnippet: q.code_snippet,
        points: q.points,
        topicTitle: topicObj?.title || "Информатика",
        topicSlug: topicObj?.slug || "",
        options,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
