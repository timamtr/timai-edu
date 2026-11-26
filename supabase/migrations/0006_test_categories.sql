ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS test_category TEXT NOT NULL DEFAULT 'topic'
    CHECK (test_category IN ('topic', 'section', 'unt_variant')),
  ADD COLUMN IF NOT EXISTS section_title TEXT;

UPDATE public.tests
SET test_category = 'unt_variant'
WHERE topic_id IS NULL AND section_title IS NULL;

CREATE INDEX IF NOT EXISTS idx_tests_category ON public.tests(test_category);
