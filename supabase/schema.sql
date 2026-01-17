-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0
);

-- Onboarding responses
CREATE TABLE public.onboarding_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character sheet (6 components)
CREATE TABLE public.character_sheet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  anti_vision TEXT,
  vision TEXT,
  year_goal TEXT,
  month_project TEXT,
  constraints TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily levers
CREATE TABLE public.daily_levers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lever_text TEXT NOT NULL,
  xp_value INT DEFAULT 50,
  "order" INT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs
CREATE TABLE public.daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  direction TEXT CHECK (direction IN ('vision', 'hate')),
  comment TEXT,
  levers_completed UUID[],
  xp_gained INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weekly reflections
CREATE TABLE public.weekly_reflections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  most_alive TEXT,
  most_dead TEXT,
  pattern_noticed TEXT,
  anti_vision_check BOOLEAN DEFAULT FALSE,
  levers_adjusted BOOLEAN DEFAULT FALSE,
  project_progress INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Monthly boss fights
CREATE TABLE public.boss_fights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  project_text TEXT NOT NULL,
  completion_criteria TEXT,
  status TEXT CHECK (status IN ('active', 'defeated', 'failed')) DEFAULT 'active',
  progress INT DEFAULT 0,
  loot_acquired TEXT[],
  learnings TEXT,
  xp_gained INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_sheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_levers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Onboarding responses policies
CREATE POLICY "Users can view own responses" ON public.onboarding_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.onboarding_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses" ON public.onboarding_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Character sheet policies
CREATE POLICY "Users can view own sheet" ON public.character_sheet
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sheet" ON public.character_sheet
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sheet" ON public.character_sheet
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily levers policies
CREATE POLICY "Users can view own levers" ON public.daily_levers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own levers" ON public.daily_levers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own levers" ON public.daily_levers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own levers" ON public.daily_levers
  FOR DELETE USING (auth.uid() = user_id);

-- Daily logs policies
CREATE POLICY "Users can view own logs" ON public.daily_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Weekly reflections policies
CREATE POLICY "Users can view own reflections" ON public.weekly_reflections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON public.weekly_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON public.weekly_reflections
  FOR UPDATE USING (auth.uid() = user_id);

-- Boss fights policies
CREATE POLICY "Users can view own bosses" ON public.boss_fights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bosses" ON public.boss_fights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bosses" ON public.boss_fights
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
