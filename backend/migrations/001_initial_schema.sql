-- Supabase Schema Migration for EduGen
-- This file creates all necessary tables to replace MongoDB collections

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSON support (already included in PostgreSQL)
-- Timezones are already enabled

-- ==================== AUTH TABLES ====================
-- Using Supabase Auth (built-in), but we can extend with profiles

-- ==================== PROFILES TABLE ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  avatar_data BYTEA, -- Store binary image data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TOPICS TABLE ====================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  roadmap JSONB, -- Store chapter structure
  status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
  completed BOOLEAN DEFAULT FALSE,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ==================== CHAPTERS TABLE ====================
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Markdown formatted blog content
  reading_time TEXT,
  difficulty TEXT,
  key_concepts TEXT[], -- Array of concepts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(topic_id, chapter_number)
);

-- ==================== QUIZZES TABLE ====================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  questions JSONB NOT NULL, -- Array of question objects
  user_id UUID,
  user_answers JSONB, -- User's answers
  score INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- ==================== EXAMS TABLE ====================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'midterm' or 'final'
  mcq_questions JSONB, -- Multiple choice questions
  short_questions JSONB, -- Short answer questions
  capstone JSONB, -- Final project description
  capstone_parsed JSONB, -- Parsed capstone data
  user_id UUID,
  user_answers JSONB,
  score INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- ==================== RESULTS TABLE ====================
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  assessment_type TEXT, -- 'quiz' or 'exam'
  assessment_id UUID,
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5, 2),
  passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== NOTES TABLE ====================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  chapter_number INTEGER,
  selected_text TEXT,
  note_text TEXT NOT NULL,
  highlight_color TEXT DEFAULT '#FFFF00', -- Yellow highlight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== FLASHCARDS TABLE ====================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- Array of flashcard objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== FEEDBACK TABLE ====================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER, -- 1-5 star rating
  feedback_type TEXT, -- 'bug', 'feature', 'general'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ==================== ANALYTICS TABLE ====================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  study_time_seconds INTEGER DEFAULT 0,
  session_data JSONB, -- Store session details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ACHIEVEMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'topic_complete', 'perfect_score', etc.
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_type)
);

-- ==================== INDEXES ====================
-- Performance indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_topic_id ON chapters(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_exams_topic_id ON exams(topic_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_topic_id ON results(topic_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic_id ON notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_topic_id ON analytics(topic_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policies for topics
CREATE POLICY "Users can view their own topics" 
  ON topics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create topics" 
  ON topics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
  ON topics FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" 
  ON topics FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for chapters (readable by anyone with topic access)
CREATE POLICY "Users can view chapters of their topics" 
  ON chapters FOR SELECT 
  USING (
    topic_id IN (
      SELECT id FROM topics WHERE user_id = auth.uid()
    )
  );

-- Policies for quizzes
CREATE POLICY "Users can view quizzes of their topics" 
  ON quizzes FOR SELECT 
  USING (
    topic_id IN (
      SELECT id FROM topics WHERE user_id = auth.uid()
    )
  );

-- Policies for exams
CREATE POLICY "Users can view exams of their topics" 
  ON exams FOR SELECT 
  USING (
    topic_id IN (
      SELECT id FROM topics WHERE user_id = auth.uid()
    )
  );

-- Policies for results
CREATE POLICY "Users can view their own results" 
  ON results FOR SELECT 
  USING (auth.uid() = user_id);

-- Policies for notes
CREATE POLICY "Users can view their own notes" 
  ON notes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notes" 
  ON notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON notes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for flashcards
CREATE POLICY "Users can view their own flashcards" 
  ON flashcards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create flashcards" 
  ON flashcards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policies for feedback (public insert, user can view their own)
CREATE POLICY "Anyone can submit feedback" 
  ON feedback FOR INSERT 
  WITH CHECK (true);

-- Policies for analytics
CREATE POLICY "Users can view their own analytics" 
  ON analytics FOR SELECT 
  USING (auth.uid() = user_id);

-- Policies for achievements
CREATE POLICY "Users can view their own achievements" 
  ON achievements FOR SELECT 
  USING (auth.uid() = user_id);

-- ==================== UPDATE TRIGGER FOR updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
