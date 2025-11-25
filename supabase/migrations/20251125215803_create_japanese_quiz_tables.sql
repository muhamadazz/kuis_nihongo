/*
  # Japanese Quiz Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name (Kotoba, Bunpo, Kanji)
      - `slug` (text, unique) - URL-friendly identifier
      - `created_at` (timestamp)
    
    - `chapters`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `title` (text) - Chapter title (e.g., "Perkenalan", "Belanjaan dan Makanan")
      - `chapter_number` (integer) - Chapter ordering
      - `created_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `chapter_id` (uuid, foreign key to chapters, nullable)
      - `question_text` (text) - The question
      - `option_a` (text) - First answer option
      - `option_b` (text) - Second answer option
      - `option_c` (text) - Third answer option
      - `option_d` (text) - Fourth answer option
      - `correct_answer` (text) - Correct answer (a, b, c, or d)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (quiz is public)
    - Add policies for authenticated users to insert questions (admin form)

  3. Initial Data
    - Pre-populate categories: Kotoba, Bunpo, Kanji
    - Pre-populate sample chapters for Bunpo
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  chapter_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert chapters"
  ON chapters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO categories (name, slug) VALUES
  ('Kotoba', 'kotoba'),
  ('Bunpo', 'bunpo'),
  ('Kanji', 'kanji')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  bunpo_id uuid;
BEGIN
  SELECT id INTO bunpo_id FROM categories WHERE slug = 'bunpo';
  
  IF bunpo_id IS NOT NULL THEN
    INSERT INTO chapters (category_id, title, chapter_number) VALUES
      (bunpo_id, 'Perkenalan', 1),
      (bunpo_id, 'Belanjaan dan Makanan', 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;