DO $$
DECLARE
  v_subject_id UUID;
  t_info UUID;
  t_sys UUID;
  t_logic UUID;
  t_algo UUID;
  t_prog UUID;
  t_python UUID;
  t_db UUID;
  t_net UUID;
  t_coding UUID;
  t_numsys UUID;
  t_excel UUID;
  t_web UUID;

  q_id UUID;
  opt_a UUID;
  opt_b UUID;
  opt_c UUID;
  opt_d UUID;
  opt_e UUID;

  test1_id UUID;
  test2_id UUID;
BEGIN
  -- 1. ПРЕДМЕТ: ИНФОРМАТИКА
  INSERT INTO public.subjects (slug, title, description, icon, is_published, sort_order)
  VALUES (
    'informatics',
    'Информатика',
    'ҰБТ-ға дайындыққа арналған толық курс: теория, алгоритмдер, Python, деректер қоры және желілер.',
    'Cpu',
    TRUE,
    1
  )
  RETURNING id INTO v_subject_id;

  -- 2. 12 ТЕМАТИЧЕСКИХ КАТЕГОРИЙ
  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'information-processes', 'Ақпарат және ақпараттық процестер', 'Ақпаратты өлшеу, Хартли формуласы, ақпаратты беру жылдамдығы.', 1, TRUE)
  RETURNING id INTO t_info;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'computer-systems', 'Компьютерлік жүйелер', 'Фон Нейман архитектурасы, процессор, жад түрлері және операциялық жүйелер.', 2, TRUE)
  RETURNING id INTO t_sys;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'logic-basics', 'Логика негіздері', 'Логикалық амалдар, ақиқат кестелері, де Морган заңдары және логикалық элементтер.', 3, TRUE)
  RETURNING id INTO t_logic;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'algorithms', 'Алгоритмдеу', 'Алгоритм қасиеттері, блок-схемалар, іздеу және сұрыптау алгоритмдері.', 4, TRUE)
  RETURNING id INTO t_algo;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'programming-basics', 'Бағдарламалау', 'Айнымалылар, деректер типтері, тармақталу және циклдік құрылымдар.', 5, TRUE)
  RETURNING id INTO t_prog;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'python', 'Python', 'Python тілінің синтаксисі, жолдар, тізімдер, функциялар және есептер шығару.', 6, TRUE)
  RETURNING id INTO t_python;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'databases', 'Деректер қоры', 'Реляциялық деректер қоры, бастапқы кілт және SQL сұраныстары.', 7, TRUE)
  RETURNING id INTO t_db;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'computer-networks', 'Компьютерлік желілер', 'IP-адрестеу, желілік хаттамалар, OSI моделі және ақпараттық қауіпсіздік.', 8, TRUE)
  RETURNING id INTO t_net;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'information-coding', 'Ақпаратты кодтау', 'ASCII, Unicode, растрлық графика және дыбысты кодтау формулалары.', 9, TRUE)
  RETURNING id INTO t_coding;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'number-systems', 'Санау жүйелері', 'Екілік, сегіздік, ондық және он алтылық санау жүйелері арасында түрлендіру.', 10, TRUE)
  RETURNING id INTO t_numsys;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'spreadsheets', 'Электрондық кестелер', 'Салыстырмалы және абсолютті сілтемелер, кіріктірілген функциялар және диаграммалар.', 11, TRUE)
  RETURNING id INTO t_excel;

  INSERT INTO public.topics (subject_id, slug, title, description, sort_order, is_published)
  VALUES (v_subject_id, 'web-technologies', 'Веб-технологиялар', 'HTML5 құрылымы, негізгі тегтер, CSS селекторлары және веб-беттерді құру.', 12, TRUE)
  RETURNING id INTO t_web;

  -- 3. ТЕОРЕТИЧЕСКИЕ УРОКИ (4 УРОКА)
  INSERT INTO public.lessons (topic_id, slug, title, description, estimated_minutes, sort_order, is_published, content_md)
  VALUES
  (
    t_numsys,
    'number-systems-conversion',
    'Санау жүйелері және сандарды түрлендіру ережелері',
    'Позициялық санау жүйелері, ондық жүйеден 2, 8, 16-лық жүйелерге ауыстыру әдістері.',
    15,
    1,
    TRUE,
    E'## Санау жүйесі дегеніміз не?\n\n**Санау жүйесі** — сандарды арнайы таңбалар (цифрлар) көмегімен жазу тәсілі.\n\n### Негізгі позициялық санау жүйелері:\n- **Екілік (негізі 2):** `0, 1`\n- **Сегіздік (негізі 8):** `0, 1, 2, 3, 4, 5, 6, 7`\n- **Ондық (негізі 10):** `0–9`\n- **Он алтылық (негізі 16):** `0–9` және `A(10), B(11), C(12), D(13), E(14), F(15)`\n\n### Мысал: 45 ондық санын екілік жүйеге ауыстыру\nСанды 2-ге бөліп, қалдықтарды соңынан басына қарай жазамыз:\n- 45 / 2 = 22 (қалдық **1**)\n- 22 / 2 = 11 (қалдық **0**)\n- 11 / 2 = 5 (қалдық **1**)\n- 5 / 2 = 2 (қалдық **1**)\n- 2 / 2 = 1 (қалдық **0**)\n- 1 / 2 = 0 (қалдық **1**)\n\nНәтиже: **$45_{10} = 101101_2$**.'
  ),
  (
    t_logic,
    'boolean-algebra-laws',
    'Логикалық амалдар және де Морган заңдары',
    'Конъюнкция, дизъюнкция, инверсия және логикалық өрнектерді ықшамдау.',
    12,
    1,
    TRUE,
    E'## Негізгі логикалық амалдар\n\n1. **Инверсия (ЕМЕС / NOT):** $\\neg A$ — мәнді қарама-қарсы мәнге өзгертеді.\n2. **Конъюнкция (ЖӘНЕ / AND):** $A \\land B$ — екі пікір де ақиқат (`1`) болғанда ғана `1` қайтарады.\n3. **Дизъюнкция (НЕМЕСЕ / OR):** $A \\lor B$ — кем дегенде біреуі `1` болса, `1` қайтарады.\n\n### Де Морган заңдары:\n- $\\neg(A \\lor B) = \\neg A \\land \\neg B$\n- $\\neg(A \\land B) = \\neg A \\lor \\neg B$'
  ),
  (
    t_python,
    'python-strings-and-lists',
    'Python тілінде жолдар мен тізімдерді өңдеу',
    'Индекстеу, кесінділер (slices) және тізімдердің негізгі әдістері.',
    18,
    1,
    TRUE,
    E'## Жолдардан кесінді алу (Slicing)\n\nPython-да индекстеу `0`-ден басталады:\n\n```python\ns = "INFORMATIKA"\nprint(s[2:6])  # FORM\n```\n\nМұнда `2`-индекстен бастап `6`-индекске дейінгі (`6` кірмейді) таңбалар алынады.\n\n## Тізім (List) әдістері\n- `arr.append(x)` — соңына элемент қосу\n- `arr.sort()` — тізімді өсу ретімен сұрыптау\n- `len(arr)` — элементтер санын табу'
  ),
  (
    t_db,
    'sql-select-basics',
    'SQL негіздері: SELECT, WHERE және ORDER BY',
    'Реляциялық кестелерден деректерді таңдау және сұрыптау операторлары.',
    14,
    1,
    TRUE,
    E'## SQL сұранысының құрылымы\n\nКестеден қажетті жолдарды таңдау үшін `SELECT` операторы қолданылады:\n\n```sql\nSELECT name, score\nFROM students\nWHERE score >= 85\nORDER BY score DESC;\n```\n\n- `WHERE` — шарт бойынша сүзу;\n- `ORDER BY ... ASC` — өсу ретімен сұрыптау;\n- `ORDER BY ... DESC` — кему ретімен сұрыптау.'
  );

  -- 4. ТЕСТЫ (2 ДЕМО ТЕСТА)
  INSERT INTO public.tests (subject_id, topic_id, title, description, duration_minutes, passing_score, is_published, is_demo)
  VALUES (
    v_subject_id,
    NULL,
    'ҰБТ-ға кіріспе сынақ тесті №1',
    'Санау жүйелері, логика, ақпарат көлемі және компьютерлік жүйелер бойынша 15 сұрақ.',
    25,
    60,
    TRUE,
    TRUE
  )
  RETURNING id INTO test1_id;

  INSERT INTO public.tests (subject_id, topic_id, title, description, duration_minutes, passing_score, is_published, is_demo)
  VALUES (
    v_subject_id,
    NULL,
    'Python, SQL және Желілер — Кешенді тест №2',
    'Бағдарламалау, деректер қоры, электрондық кестелер және веб-технологиялар бойынша 15 сұрақ.',
    25,
    60,
    TRUE,
    TRUE
  )
  RETURNING id INTO test2_id;

  -- 5. 30 ПРОВЕРЕННЫХ ВОПРОСОВ + ВАРИАНТЫ + ИЗОЛИРОВАННЫЕ КЛЮЧИ

  -- Q1 (numsys, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_numsys, 'single_choice', 'easy',
    '45 ондық санының екілік санау жүйесіндегі жазылуын анықтаңыз',
    '45 = 32 + 8 + 4 + 1 = 2^5 + 2^3 + 2^2 + 2^0 = 101101₂.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '101101', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '110101', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '101011', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '100111', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 1);

  -- Q2 (numsys, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_numsys, 'single_choice', 'easy',
    'Он алтылық санау жүйесіндегі 1A саны ондық санау жүйесінде нешеге тең',
    '1A₁₆ = 1 × 16¹ + 10 × 16⁰ = 16 + 10 = 26.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '24', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '26', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '16', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '32', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 2);

  -- Q3 (numsys, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_numsys, 'single_choice', 'medium',
    'Сегіздік санау жүйесіндегі 72₈ санын екілік санау жүйесіне ауыстырыңыз',
    'Әр сегіздік цифр 3 екілік разрядпен жазылады: 7 = 111₂, 2 = 010₂. Біріктірсек: 111010₂.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '111001', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '110010', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '111010', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '101110', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 3);

  -- Q4 (info, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_info, 'single_choice', 'easy',
    '64 символдық әліпбимен жазылған 100 таңбадан тұратын хабарламаның ақпараттық көлемі қанша бит',
    'N = 64 = 2⁶, демек бір символ i = 6 бит. Барлық көлем: I = 100 × 6 = 600 бит.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '600 бит', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '640 бит', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '800 бит', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '100 бит', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 4);

  -- Q5 (info, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_info, 'single_choice', 'medium',
    'Өткізу қабілеті 512 Кбайт/с болатын арна арқылы көлемі 15 Мбайт файлды жіберуге қанша секунд кетеді',
    '15 Мбайт = 15 × 1024 Кбайт = 15360 Кбайт. Уақыт t = 15360 / 512 = 30 секунд.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '15 секунд', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '24 секунд', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '30 секунд', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '60 секунд', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 5);

  -- Q6 (coding, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_coding, 'single_choice', 'easy',
    '16-биттік Unicode кодтауында «Астана» сөзі жадтан қанша байт орын алады',
    '16 бит = 2 байт. «Астана» сөзінде 6 әріп бар: 6 × 2 байт = 12 байт.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '6 байт', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '12 байт', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '16 байт', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '96 байт', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 6);

  -- Q7 (coding, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_coding, 'single_choice', 'medium',
    'RGB моделінде түс тереңдігі 24 бит болса, ең көбі неше түрлі түсті кодтауға болады',
    'Түстер саны N = 2^i = 2^24 = 16 777 216.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '65 536', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '1 048 576', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '16 777 216', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '256', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 7);

  -- Q8 (logic, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_logic, 'single_choice', 'medium',
    'Де Морган заңы бойынша ¬(A ∨ B) логикалық өрнегіне мәндес өрнекті табыңыз',
    'Дизъюнкцияның терістеуі жеке айнымалылардың терістеулерінің конъюнкциясына тең: ¬(A ∨ B) = ¬A ∧ ¬B.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '¬A ∨ ¬B', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '¬A ∧ ¬B', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'A ∧ B', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'A ∨ ¬B', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 8);

  -- Q9 (logic, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_logic, 'single_choice', 'medium',
    'X = 1, Y = 0, Z = 1 болғанда (X ∧ ¬Y) ∨ ¬Z өрнегінің мәні неге тең',
    '¬Y = 1, X ∧ ¬Y = 1 ∧ 1 = 1. ¬Z = 0. Соңында 1 ∨ 0 = 1.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '0 (Жалған)', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '1 (Ақиқат)', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Анықталмаған', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '2', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 9);

  -- Q10 (logic, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_logic, 'single_choice', 'easy',
    '4 логикалық айнымалыдан тұратын өрнектің ақиқат кестесінде неше жол болады',
    'n айнымалы үшін жолдар саны 2^n формуласымен есептеледі: 2⁴ = 16.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '8', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '12', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '16', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '32', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 10);

  -- Q11 (sys, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_sys, 'single_choice', 'easy',
    'Компьютер өшірілген кезде ішіндегі деректер жойылатын энергияға тәуелді жад түрі',
    'RAM (жедел есте сақтау құрылғысы) тек қуат көзі қосулы тұрғанда деректерді сақтайды.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'ROM (Тұрақты жад)', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'SSD (Қатты денелі диск)', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'RAM (Жедел жад)', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'HDD (Қатқыл диск)', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 11);

  -- Q12 (sys, multiple_choice)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_sys, 'multiple_choice', 'medium',
    'Орталық процессордың (CPU) құрамына кіретін негізгі функционалдық блоктарды белгілеңіз',
    'Процессордың негізгі екі блогы — Арифметикалық-логикалық құрылғы (АЛҚ) және Басқару құрылғысы (БҚ).', 2, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'Арифметикалық-логикалық құрылғы (АЛҚ)', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'Басқару құрылғысы (БҚ)', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Қатқыл магниттік диск (HDD)', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Желілік адаптер', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'E', 'Оптикалық дискжетек', 5) RETURNING id INTO opt_e;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a, opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 12);

  -- Q13 (algo, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_algo, 'single_choice', 'medium',
    'Сұрыпталған массивте екілік іздеу (Binary Search) алгоритмінің уақыттық күрделілігі қандай',
    'Екілік іздеу әр қадамда іздеу аймағын 2 есе қысқартады, сондықтан күрделілігі O(log₂ n).', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'O(n²)', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'O(n)', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'O(log₂ n)', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'O(1)', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 13);

  -- Q14 (algo, multiple_choice)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_algo, 'multiple_choice', 'easy',
    'Алгоритмнің негізгі қасиеттерін таңдаңыз',
    'Алгоритмнің классикалық қасиеттері: дискреттілік, анықтылық, нәтижелілік және жалпылық.', 2, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'Дискреттілік (үзіктілік)', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'Нәтижелілік', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Шексіздік', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Анықтылық (детерминирленгендік)', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'E', 'Кездейсоқтық', 5) RETURNING id INTO opt_e;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a, opt_b, opt_d]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 14);

  -- Q15 (prog, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_prog, 'single_choice', 'easy',
    'Алдын ала шарты бар цикл операторы қайсысы',
    'while циклі алдымен шартты тексереді, шарт ақиқат болса ғана цикл денесін орындайды.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'while', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'if', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'def', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'return', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test1_id, q_id, 15);

  -- Q16 (python, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, code_snippet, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_python, 'single_choice', 'easy',
    'Берілген Python кодының орындалу нәтижесі қандай болады',
    E'a = 17\nb = 5\nprint(a // b, a % b)',
    '// — бүтін бөлу (17 // 5 = 3), % — бөлуден қалған қалдық (17 % 5 = 2).', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '3.4 2', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '3 2', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '2 3', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '3 5', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 1);

  -- Q17 (python, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, code_snippet, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_python, 'single_choice', 'easy',
    'Берілген код экранға қандай мәтінді шығарады',
    E'info = "INFORMATIKA"\nprint(info[2:6])',
    'Индекстер: 0=I, 1=N, 2=F, 3=O, 4=R, 5=M. [2:6] кесіндісі 2-ден 5-ке дейінгі таңбаларды алады: FORM.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'NFOR', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'FORMA', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'FORM', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'INFO', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 2);

  -- Q18 (python, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, code_snippet, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_python, 'single_choice', 'medium',
    'Цикл аяқталғаннан кейін mat айнымалысының мәні неге тең болады',
    E'mat = 0\nfor i in range(2, 10, 3):\n    mat += i\nprint(mat)',
    'range(2, 10, 3) тізбегі 2, 5, 8 мәндерін береді. Қосындысы: 2 + 5 + 8 = 15.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '15', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '25', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '14', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '18', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 3);

  -- Q19 (python, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, code_snippet, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_python, 'single_choice', 'medium',
    'Төмендегі Python бағдарламасының нәтижесін анықтаңыз',
    E'a = [4, 1, 7]\na.append(3)\na.sort()\nprint(a[1])',
    'append(3) соңына 3 қосады -> [4, 1, 7, 3]. sort() өсу ретімен сұрыптайды -> [1, 3, 4, 7]. a[1] элементі = 3.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '1', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '3', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '4', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '7', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 4);

  -- Q20 (python, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, code_snippet, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_python, 'single_choice', 'easy',
    'Берілген шартты оператор орындалғанда не шығады',
    E'b = 12\nif b % 3 == 0 and b % 4 == 0:\n    print("AB")\nelse:\n    print("CD")',
    '12 саны 3-ке де, 4-ке де қалдықсыз бөлінеді, сондықтан екі шарт та ақиқат және "AB" шығады.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'AB', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'CD', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '12', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Қате шығады', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 5);

  -- Q21 (db, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_db, 'single_choice', 'easy',
    'SQL сұранысындағы ORDER BY score DESC тіркесі нені орындайды',
    'DESC (Descending) кілт сөзі нәтижелерді кему ретімен сұрыптайды.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'Өсу ретімен сұрыптайды', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'Кему ретімен сұрыптайды', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Қайталанатын жолдарды өшіреді', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Кестені жояды', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 6);

  -- Q22 (db, multiple_choice)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_db, 'multiple_choice', 'medium',
    'Реляциялық деректер қорындағы бастапқы кілтке (PRIMARY KEY) қойылатын талаптарды белгілеңіз',
    'Бастапқы кілт әр жазбаны бірегей анықтайды (UNIQUE) және бос мән (NULL) қабылдамайды.', 2, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'Мәндері бірегей (қайталанбайтын) болуы тиіс', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'NULL (бос) мәнін қабылдамайды', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Бір кестеде бірнеше бастапқы кілт бағаны болуы міндетті', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Тек мәтіндік типте ғана сақталады', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'E', 'Кез келген уақытта қайталанатын мән жазуға болады', 5) RETURNING id INTO opt_e;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a, opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 7);

  -- Q23 (db, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_db, 'single_choice', 'easy',
    'Реляциялық деректер қоры кестесінің бір жолы (кортеж) нені білдіреді',
    'Кесте жолы — бір нақты нысан туралы сипаттамалар жиынтығы (жазба), ал баған — өріс (атрибут).', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'Өріс (атрибут)', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'Жазба (бір нысан туралы деректер)', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Деректер типі', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Сұраныс', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 8);

  -- Q24 (net, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_net, 'single_choice', 'easy',
    'IPv4 хаттамасындағы IP-адрестің ұзындығы қанша бит',
    'IPv4 адресі 4 октеттен (әрқайсысы 8 бит) тұрады: 4 × 8 = 32 бит.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '16 бит', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '32 бит', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '64 бит', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '128 бит', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 9);

  -- Q25 (net, multiple_choice)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_net, 'multiple_choice', 'easy',
    'Веб-беттерді серверден браузерге тасымалдау үшін қолданылатын хаттамаларды таңдаңыз',
    'HTTP және оның шифрланған нұсқасы HTTPS веб-беттерді тасымалдау хаттамалары болып табылады.', 2, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'HTTP', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'HTTPS', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'SMTP', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'POP3', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'E', 'ARP', 5) RETURNING id INTO opt_e;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a, opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 10);

  -- Q26 (excel, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_excel, 'single_choice', 'easy',
    'Электрондық кестеде формуланы көшірген кезде өзгермейтін абсолютті сілтеме қалай жазылады',
    'Абсолютті сілтемеде баған мен жол атауының алдына $ таңбасы қойылады: $A$1.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'A1', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '$A$1', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '#A#1', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '@A@1', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_b]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 11);

  -- Q27 (excel, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_excel, 'single_choice', 'easy',
    'A1=5, A2=10, A3=15, A4=20 ұяшықтары үшін =SUM(A1:A4) формуласының нәтижесі неге тең',
    'SUM(A1:A4) диапазондағы барлық сандарды қосады: 5 + 10 + 15 + 20 = 50.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '12.5', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '25', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '50', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '4', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 12);

  -- Q28 (web, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_web, 'single_choice', 'easy',
    'HTML құжатында ең жоғарғы (бірінші) деңгейдегі тақырыпты белгілейтін тег',
    '<h1> тегі беттегі ең басты және ірі тақырыпты анықтайды.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '<h6>', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '<head>', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '<h1>', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '<title>', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 13);

  -- Q29 (web, multiple_choice)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_web, 'multiple_choice', 'medium',
    'HTML тілінде кесте құру үшін қолданылатын тегтерді белгілеңіз',
    '<table> — кесте контейнері, <tr> — кесте жолы, <td> — кесте ұяшығы.', 2, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', '<table>', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', '<tr>', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', '<td>', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', '<ul>', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'E', '<img>', 5) RETURNING id INTO opt_e;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a, opt_b, opt_c]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 14);

  -- Q30 (net, single)
  INSERT INTO public.questions (subject_id, topic_id, question_type, difficulty, prompt, explanation, points, is_published, is_demo)
  VALUES (v_subject_id, t_net, 'single_choice', 'easy',
    'Жалған веб-сайттар мен хаттар арқылы пайдаланушының құпиясөздері мен банк деректерін ұрлау әдісі қалай аталады',
    'Фишинг (Phishing) — сенімді ұйым атынан жасырынып, пайдаланушының құпия ақпаратын алдап алу тәсілі.', 1, TRUE, TRUE)
  RETURNING id INTO q_id;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'A', 'Фишинг', 1) RETURNING id INTO opt_a;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'B', 'Дефрагментация', 2) RETURNING id INTO opt_b;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'C', 'Компиляция', 3) RETURNING id INTO opt_c;
  INSERT INTO public.question_options (question_id, label, option_text, sort_order) VALUES (q_id, 'D', 'Архивтеу', 4) RETURNING id INTO opt_d;
  INSERT INTO public.question_answer_keys (question_id, correct_option_ids) VALUES (q_id, ARRAY[opt_a]);
  INSERT INTO public.test_questions (test_id, question_id, sort_order) VALUES (test2_id, q_id, 15);
END $$;
