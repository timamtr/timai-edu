-- Включаем RLS на всех таблицах
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Вспомогательная функция проверки роли (выполняется с правами владельца, избегает рекурсии RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile without changing role"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 2. SUBJECTS, TOPICS, LESSONS (публичное чтение опубликованного, управление только admin)
CREATE POLICY "Read published subjects"
  ON public.subjects FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage subjects"
  ON public.subjects FOR ALL
  USING (public.is_admin());

CREATE POLICY "Read published topics"
  ON public.topics FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage topics"
  ON public.topics FOR ALL
  USING (public.is_admin());

CREATE POLICY "Read published lessons"
  ON public.lessons FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage lessons"
  ON public.lessons FOR ALL
  USING (public.is_admin());

-- 3. QUESTIONS & OPTIONS
CREATE POLICY "Authenticated read published questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage questions"
  ON public.questions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Authenticated read options of published questions"
  ON public.question_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_id AND (q.is_published = TRUE OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage question options"
  ON public.question_options FOR ALL
  USING (public.is_admin());

-- 4. QUESTION_ANSWER_KEYS (СТРОГО ТОЛЬКО ADMIN)
CREATE POLICY "Only admins access answer keys"
  ON public.question_answer_keys FOR ALL
  USING (public.is_admin());

-- 5. TESTS & TEST_QUESTIONS
CREATE POLICY "Authenticated read published tests"
  ON public.tests FOR SELECT
  TO authenticated
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage tests"
  ON public.tests FOR ALL
  USING (public.is_admin());

CREATE POLICY "Authenticated read test questions"
  ON public.test_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t
      WHERE t.id = test_id AND (t.is_published = TRUE OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage test questions"
  ON public.test_questions FOR ALL
  USING (public.is_admin());

-- 6. TEST_ATTEMPTS & USER_ANSWERS
CREATE POLICY "Users manage own attempts"
  ON public.test_attempts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can start own attempt"
  ON public.test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'in_progress');

CREATE POLICY "Admins manage all attempts"
  ON public.test_attempts FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users read own answers"
  ON public.user_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts a
      WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users save answers only for own in_progress attempt"
  ON public.user_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid() AND a.status = 'in_progress'
    )
  );

CREATE POLICY "Users update answers only for own in_progress attempt"
  ON public.user_answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts a
      WHERE a.id = attempt_id AND a.user_id = auth.uid() AND a.status = 'in_progress'
    )
  );

-- 7. BOOKMARKS & LESSON_PROGRESS
CREATE POLICY "Users manage own bookmarks"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own lesson progress"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. QUIZ_SESSIONS & QUIZ_ANSWERS
CREATE POLICY "Users manage own quiz sessions"
  ON public.quiz_sessions FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own quiz answers"
  ON public.quiz_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_sessions s
      WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_admin())
    )
  );
