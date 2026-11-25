import { createClient } from "@/lib/supabase/server";
import type {
  Lesson,
  Profile,
  QuestionOption,
  Subject,
  Topic,
} from "@/types/database";

export async function getAdminDashboardStats() {
  const supabase = await createClient();

  const [
    usersRes,
    testsRes,
    questionsRes,
    lessonsRes,
    attemptsRes,
    recentAttemptsRes,
    recentUsersRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("tests").select("id", { count: "exact", head: true }),
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("test_attempts").select("id", { count: "exact", head: true }),
    supabase
      .from("test_attempts")
      .select("id, score, max_score, percentage, status, created_at, profiles(full_name, email), tests(title)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, grade, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentAttempts = (recentAttemptsRes.data ?? []).map((a) => {
    const prof = Array.isArray(a.profiles)
      ? a.profiles[0]
      : (a.profiles as { full_name?: string; email?: string } | null);
    const tst = Array.isArray(a.tests)
      ? a.tests[0]
      : (a.tests as { title?: string } | null);

    return {
      id: a.id,
      userName: prof?.full_name || prof?.email || "Оқушы",
      testTitle: tst?.title || "Сынақ тесті",
      score: a.score,
      maxScore: a.max_score,
      percentage: Math.round(Number(a.percentage || 0)),
      status: a.status,
      createdAt: a.created_at,
    };
  });

  return {
    usersCount: usersRes.count ?? 0,
    testsCount: testsRes.count ?? 0,
    questionsCount: questionsRes.count ?? 0,
    publishedLessonsCount: lessonsRes.count ?? 0,
    attemptsCount: attemptsRes.count ?? 0,
    recentAttempts,
    recentUsers: (recentUsersRes.data ?? []) as Profile[],
  };
}

export interface AdminQuestionRow {
  id: string;
  subject_id: string;
  topic_id: string;
  topicTitle: string;
  question_type: string;
  difficulty: string;
  prompt: string;
  code_snippet: string | null;
  image_url: string | null;
  explanation: string | null;
  points: number;
  is_published: boolean;
  is_demo: boolean;
  created_at: string;
  options: Array<{
    id: string;
    label: string;
    option_text: string;
    sort_order: number;
    is_correct: boolean;
  }>;
}

export async function getAdminQuestionsData() {
  const supabase = await createClient();

  const [subjectsRes, topicsRes, questionsRes] = await Promise.all([
    supabase.from("subjects").select("*").order("sort_order", { ascending: true }),
    supabase.from("topics").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("questions")
      .select(
        "*, topics(title), question_options(id, label, option_text, sort_order), question_answer_keys(correct_option_ids)"
      )
      .order("created_at", { ascending: false }),
  ]);

  const questions: AdminQuestionRow[] = (questionsRes.data ?? []).map((q) => {
    const topicObj = Array.isArray(q.topics)
      ? q.topics[0]
      : (q.topics as { title?: string } | null);

    const keyObj = Array.isArray(q.question_answer_keys)
      ? q.question_answer_keys[0]
      : (q.question_answer_keys as { correct_option_ids?: string[] } | null);

    const correctSet = new Set<string>(keyObj?.correct_option_ids ?? []);

    const sortedOptions = [...(q.question_options ?? [])]
      .sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      )
      .map((opt: QuestionOption) => ({
        id: opt.id,
        label: opt.label,
        option_text: opt.option_text,
        sort_order: opt.sort_order,
        is_correct: correctSet.has(opt.id),
      }));

    return {
      id: q.id,
      subject_id: q.subject_id,
      topic_id: q.topic_id,
      topicTitle: topicObj?.title || "—",
      question_type: q.question_type,
      difficulty: q.difficulty,
      prompt: q.prompt,
      code_snippet: q.code_snippet,
      image_url: q.image_url,
      explanation: q.explanation,
      points: q.points,
      is_published: q.is_published,
      is_demo: q.is_demo,
      created_at: q.created_at,
      options: sortedOptions,
    };
  });

  return {
    subjects: (subjectsRes.data ?? []) as Subject[],
    topics: (topicsRes.data ?? []) as Topic[],
    questions,
  };
}

export interface AdminTestRow {
  id: string;
  subject_id: string;
  topic_id: string | null;
  topicTitle: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  is_demo: boolean;
  questionIds: string[];
}

export async function getAdminTestsData() {
  const supabase = await createClient();

  const [subjectsRes, topicsRes, testsRes, questionsRes] = await Promise.all([
    supabase.from("subjects").select("*").order("sort_order", { ascending: true }),
    supabase.from("topics").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("tests")
      .select("*, topics(title), test_questions(question_id, sort_order)")
      .order("created_at", { ascending: false }),
    supabase
      .from("questions")
      .select("id, topic_id, prompt, difficulty, question_type, is_published, topics(title)")
      .order("created_at", { ascending: false }),
  ]);

  const tests: AdminTestRow[] = (testsRes.data ?? []).map((t) => {
    const topicObj = Array.isArray(t.topics)
      ? t.topics[0]
      : (t.topics as { title?: string } | null);

    const tqSorted = [...(t.test_questions ?? [])].sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    );

    return {
      id: t.id,
      subject_id: t.subject_id,
      topic_id: t.topic_id,
      topicTitle: topicObj?.title ?? null,
      title: t.title,
      description: t.description,
      duration_minutes: t.duration_minutes,
      passing_score: t.passing_score,
      is_published: t.is_published,
      is_demo: t.is_demo,
      questionIds: tqSorted.map((item: { question_id: string }) => item.question_id),
    };
  });

  const bankQuestions = (questionsRes.data ?? []).map((q) => {
    const topicObj = Array.isArray(q.topics)
      ? q.topics[0]
      : (q.topics as { title?: string } | null);
    return {
      id: q.id,
      topic_id: q.topic_id,
      topicTitle: topicObj?.title || "—",
      prompt: q.prompt,
      difficulty: q.difficulty,
      question_type: q.question_type,
      is_published: q.is_published,
    };
  });

  return {
    subjects: (subjectsRes.data ?? []) as Subject[],
    topics: (topicsRes.data ?? []) as Topic[],
    tests,
    bankQuestions,
  };
}

export async function getAdminContentData() {
  const supabase = await createClient();

  const [subjectsRes, topicsRes, lessonsRes] = await Promise.all([
    supabase.from("subjects").select("*").order("sort_order", { ascending: true }),
    supabase.from("topics").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("lessons")
      .select("*, topics(title)")
      .order("sort_order", { ascending: true }),
  ]);

  const lessons = (lessonsRes.data ?? []).map((l) => {
    const topicObj = Array.isArray(l.topics)
      ? l.topics[0]
      : (l.topics as { title?: string } | null);
    return {
      ...(l as Lesson),
      topicTitle: topicObj?.title || "—",
    };
  });

  return {
    subjects: (subjectsRes.data ?? []) as Subject[],
    topics: (topicsRes.data ?? []) as Topic[],
    lessons,
  };
}

export async function getAdminUsersData(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as Profile[];
}
