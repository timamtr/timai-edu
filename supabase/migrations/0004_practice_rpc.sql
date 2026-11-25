CREATE OR REPLACE FUNCTION public.check_practice_question(
  p_question_id UUID,
  p_selected_option_ids UUID[]
)
RETURNS JSONB AS $$ DECLARE v_user_id UUID := auth.uid(); v_correct_ids UUID[]; v_explanation TEXT; v_is_correct BOOLEAN := FALSE; BEGIN IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;    SELECT COALESCE(k.correct_option_ids, '{}'), q.explanation INTO v_correct_ids, v_explanation FROM public.questions q LEFT JOIN public.question_answer_keys k ON k.question_id = q.id WHERE q.id = p_question_id AND q.is_published = TRUE;    IF NOT FOUND THEN RAISE EXCEPTION 'Question not found'; END IF;    IF COALESCE(array_length(v_correct_ids, 1), 0) > 0 AND public.uuid_arrays_equal(COALESCE(p_selected_option_ids, '{}'), v_correct_ids) THEN v_is_correct := TRUE; END IF;    RETURN jsonb_build_object( 'is_correct', v_is_correct, 'correct_option_ids', v_correct_ids, 'explanation', v_explanation ); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
