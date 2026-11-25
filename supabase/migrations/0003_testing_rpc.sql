-- Вспомогательная функция сравнения массивов UUID без учёта порядка элементов
CREATE OR REPLACE FUNCTION public.uuid_arrays_equal(a UUID[], b UUID[])
RETURNS BOOLEAN AS $$
  SELECT
    COALESCE(array_length(a, 1), 0) = COALESCE(array_length(b, 1), 0)
    AND a @> b
    AND b @> a;
$$ LANGUAGE sql IMMUTABLE;

-- 1. Завершение и серверная проверка попытки теста
CREATE OR REPLACE FUNCTION public.submit_test_attempt(
  p_attempt_id UUID,
  p_time_spent_seconds INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt RECORD;
  v_rec RECORD;
  v_selected UUID[];
  v_is_correct BOOLEAN;
  v_points INT;
  v_total_score INT := 0;
  v_max_score INT := 0;
  v_correct_count INT := 0;
  v_wrong_count INT := 0;
  v_percentage NUMERIC(5,2) := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_attempt
  FROM public.test_attempts
  WHERE id = p_attempt_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found or access denied';
  END IF;

  IF v_attempt.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Attempt already completed';
  END IF;

  FOR v_rec IN
    SELECT
      q.id AS question_id,
      q.points,
      COALESCE(k.correct_option_ids, '{}') AS correct_option_ids,
      ua.selected_option_ids
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    LEFT JOIN public.question_answer_keys k ON k.question_id = q.id
    LEFT JOIN public.user_answers ua
      ON ua.attempt_id = p_attempt_id AND ua.question_id = q.id
    WHERE tq.test_id = v_attempt.test_id
    ORDER BY tq.sort_order ASC
  LOOP
    v_selected := COALESCE(v_rec.selected_option_ids, '{}');
    v_max_score := v_max_score + v_rec.points;

    IF COALESCE(array_length(v_rec.correct_option_ids, 1), 0) > 0
       AND public.uuid_arrays_equal(v_selected, v_rec.correct_option_ids) THEN
      v_is_correct := TRUE;
      v_points := v_rec.points;
      v_correct_count := v_correct_count + 1;
      v_total_score := v_total_score + v_points;
    ELSE
      v_is_correct := FALSE;
      v_points := 0;
      v_wrong_count := v_wrong_count + 1;
    END IF;

    INSERT INTO public.user_answers (
      attempt_id, question_id, selected_option_ids, is_correct, points_awarded
    )
    VALUES (
      p_attempt_id, v_rec.question_id, v_selected, v_is_correct, v_points
    )
    ON CONFLICT (attempt_id, question_id)
    DO UPDATE SET
      is_correct = EXCLUDED.is_correct,
      points_awarded = EXCLUDED.points_awarded,
      updated_at = NOW();
  END LOOP;

  IF v_max_score > 0 THEN
    v_percentage := ROUND((v_total_score::NUMERIC / v_max_score::NUMERIC) * 100, 2);
  END IF;

  UPDATE public.test_attempts
  SET
    status = 'completed',
    completed_at = NOW(),
    time_spent_seconds = GREATEST(0, COALESCE(p_time_spent_seconds, 0)),
    score = v_total_score,
    max_score = v_max_score,
    percentage = v_percentage,
    correct_count = v_correct_count,
    wrong_count = v_wrong_count,
    updated_at = NOW()
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'attempt_id', p_attempt_id,
    'score', v_total_score,
    'max_score', v_max_score,
    'percentage', v_percentage,
    'correct_count', v_correct_count,
    'wrong_count', v_wrong_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Получение разбора вопросов ТОЛЬКО после завершения попытки
CREATE OR REPLACE FUNCTION public.get_attempt_review(p_attempt_id UUID)
RETURNS TABLE (
  question_id UUID,
  sort_order INT,
  question_type TEXT,
  difficulty TEXT,
  prompt TEXT,
  code_snippet TEXT,
  image_url TEXT,
  explanation TEXT,
  points INT,
  selected_option_ids UUID[],
  correct_option_ids UUID[],
  is_correct BOOLEAN,
  points_awarded INT
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_status TEXT;
  v_test_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT ta.status, ta.test_id INTO v_status, v_test_id
  FROM public.test_attempts ta
  WHERE ta.id = p_attempt_id
    AND (ta.user_id = v_user_id OR public.is_admin());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found or access denied';
  END IF;

  IF v_status <> 'completed' THEN
    RAISE EXCEPTION 'Cannot view answers before test completion';
  END IF;

  RETURN QUERY
  SELECT
    q.id AS question_id,
    tq.sort_order,
    q.question_type,
    q.difficulty,
    q.prompt,
    q.code_snippet,
    q.image_url,
    q.explanation,
    q.points,
    COALESCE(ua.selected_option_ids, '{}') AS selected_option_ids,
    COALESCE(k.correct_option_ids, '{}') AS correct_option_ids,
    COALESCE(ua.is_correct, FALSE) AS is_correct,
    COALESCE(ua.points_awarded, 0) AS points_awarded
  FROM public.test_questions tq
  JOIN public.questions q ON q.id = tq.question_id
  LEFT JOIN public.question_answer_keys k ON k.question_id = q.id
  LEFT JOIN public.user_answers ua
    ON ua.attempt_id = p_attempt_id AND ua.question_id = q.id
  WHERE tq.test_id = v_test_id
  ORDER BY tq.sort_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Проверка ответа в режиме быстрого квиза (мгновенная обратная связь по 1 вопросу)
CREATE OR REPLACE FUNCTION public.submit_quiz_answer(
  p_session_id UUID,
  p_question_id UUID,
  p_selected_option_ids UUID[]
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_correct_ids UUID[];
  v_explanation TEXT;
  v_is_correct BOOLEAN := FALSE;
  v_answered_count INT;
  v_correct_total INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_session
  FROM public.quiz_sessions
  WHERE id = p_session_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz session not found';
  END IF;

  SELECT COALESCE(k.correct_option_ids, '{}'), q.explanation
  INTO v_correct_ids, v_explanation
  FROM public.questions q
  LEFT JOIN public.question_answer_keys k ON k.question_id = q.id
  WHERE q.id = p_question_id;

  IF COALESCE(array_length(v_correct_ids, 1), 0) > 0
     AND public.uuid_arrays_equal(COALESCE(p_selected_option_ids, '{}'), v_correct_ids) THEN
    v_is_correct := TRUE;
  END IF;

  INSERT INTO public.quiz_answers (
    session_id, question_id, selected_option_ids, is_correct
  )
  VALUES (
    p_session_id, p_question_id, COALESCE(p_selected_option_ids, '{}'), v_is_correct
  )
  ON CONFLICT (session_id, question_id) DO NOTHING;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_correct)
  INTO v_answered_count, v_correct_total
  FROM public.quiz_answers
  WHERE session_id = p_session_id;

  UPDATE public.quiz_sessions
  SET
    correct_count = v_correct_total,
    status = CASE WHEN v_answered_count >= v_session.question_count THEN 'completed' ELSE 'in_progress' END,
    completed_at = CASE WHEN v_answered_count >= v_session.question_count THEN NOW() ELSE NULL END
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'correct_option_ids', v_correct_ids,
    'explanation', v_explanation
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
