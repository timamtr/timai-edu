-- 1. Атомарное создание или обновление вопроса + вариантов + ключей ответов
CREATE OR REPLACE FUNCTION public.admin_upsert_question(
  p_question_id UUID,
  p_subject_id UUID,
  p_topic_id UUID,
  p_question_type TEXT,
  p_difficulty TEXT,
  p_prompt TEXT,
  p_code_snippet TEXT,
  p_image_url TEXT,
  p_explanation TEXT,
  p_points INT,
  p_is_published BOOLEAN,
  p_options JSONB
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_qid UUID;
  v_opt JSONB;
  v_opt_id UUID;
  v_correct_ids UUID[] := '{}';
  v_idx INT := 1;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  IF p_question_id IS NULL THEN
    INSERT INTO public.questions (
      subject_id, topic_id, question_type, difficulty, prompt,
      code_snippet, image_url, explanation, points, is_published, created_by
    )
    VALUES (
      p_subject_id, p_topic_id, p_question_type, p_difficulty, p_prompt,
      NULLIF(p_code_snippet, ''), NULLIF(p_image_url, ''), NULLIF(p_explanation, ''),
      GREATEST(1, COALESCE(p_points, 1)), COALESCE(p_is_published, FALSE), v_user_id
    )
    RETURNING id INTO v_qid;
  ELSE
    UPDATE public.questions
    SET
      subject_id = p_subject_id,
      topic_id = p_topic_id,
      question_type = p_question_type,
      difficulty = p_difficulty,
      prompt = p_prompt,
      code_snippet = NULLIF(p_code_snippet, ''),
      image_url = NULLIF(p_image_url, ''),
      explanation = NULLIF(p_explanation, ''),
      points = GREATEST(1, COALESCE(p_points, 1)),
      is_published = COALESCE(p_is_published, FALSE),
      updated_at = NOW()
    WHERE id = p_question_id
    RETURNING id INTO v_qid;

    IF v_qid IS NULL THEN
      RAISE EXCEPTION 'Question not found';
    END IF;

    DELETE FROM public.question_options WHERE question_id = v_qid;
  END IF;

  FOR v_opt IN SELECT * FROM jsonb_array_elements(p_options)
  LOOP
    INSERT INTO public.question_options (
      question_id, label, option_text, sort_order
    )
    VALUES (
      v_qid,
      v_opt->>'label',
      v_opt->>'option_text',
      v_idx
    )
    RETURNING id INTO v_opt_id;

    IF COALESCE((v_opt->>'is_correct')::BOOLEAN, FALSE) THEN
      v_correct_ids := array_append(v_correct_ids, v_opt_id);
    END IF;

    v_idx := v_idx + 1;
  END LOOP;

  IF COALESCE(array_length(v_correct_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'At least one correct option is required';
  END IF;

  INSERT INTO public.question_answer_keys (question_id, correct_option_ids)
  VALUES (v_qid, v_correct_ids)
  ON CONFLICT (question_id)
  DO UPDATE SET
    correct_option_ids = EXCLUDED.correct_option_ids,
    updated_at = NOW();

  RETURN v_qid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Транзакционный массовый импорт вопросов из Excel/CSV
CREATE OR REPLACE FUNCTION public.admin_bulk_import_questions(p_items JSONB)
RETURNS INT AS $$
DECLARE
  v_item JSONB;
  v_count INT := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    PERFORM public.admin_upsert_question(
      NULL,
      (v_item->>'subject_id')::UUID,
      (v_item->>'topic_id')::UUID,
      COALESCE(v_item->>'question_type', 'single_choice'),
      COALESCE(v_item->>'difficulty', 'medium'),
      v_item->>'prompt',
      v_item->>'code_snippet',
      NULL,
      v_item->>'explanation',
      COALESCE((v_item->>'points')::INT, 1),
      COALESCE((v_item->>'is_published')::BOOLEAN, TRUE),
      v_item->'options'
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Бакет в Supabase Storage для изображений к вопросам (до 2 МБ)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  TRUE,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read question images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-images');

CREATE POLICY "Admins upload question images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'question-images' AND public.is_admin());

CREATE POLICY "Admins delete question images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'question-images' AND public.is_admin());
