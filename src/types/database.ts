export type UserRole = "student" | "teacher" | "admin";

export type TestCategory = "topic" | "section" | "unt_variant";

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "code_output"
  | "code_task";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  grade: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  description: string | null;
  content_md: string;
  estimated_minutes: number;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  label: string;
  option_text: string;
  sort_order: number;
}

export interface Question {
  id: string;
  subject_id: string;
  topic_id: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  prompt: string;
  code_snippet: string | null;
  image_url: string | null;
  explanation?: string | null;
  points: number;
  is_published: boolean;
  is_demo: boolean;
  options?: QuestionOption[];
}

export interface Test {
  id: string;
  subject_id: string;
  topic_id: string | null;
  test_category?: TestCategory;
  section_title?: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  is_demo: boolean;
  created_at: string;
}
