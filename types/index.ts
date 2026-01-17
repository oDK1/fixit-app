export interface User {
  id: string;
  email: string;
  created_at: string;
  current_level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
}

export interface OnboardingResponse {
  id: string;
  user_id: string;
  question_number: number;
  question_text: string;
  answer: string;
  created_at: string;
}

export interface CharacterSheet {
  id: string;
  user_id: string;
  anti_vision: string;
  vision: string;
  year_goal: string;
  month_project: string;
  constraints: string;
  updated_at: string;
}

export interface DailyLever {
  id: string;
  user_id: string;
  lever_text: string;
  xp_value: number;
  order: number;
  active: boolean;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  direction: 'vision' | 'hate';
  comment: string;
  levers_completed: string[];
  xp_gained: number;
  created_at: string;
}

export interface WeeklyReflection {
  id: string;
  user_id: string;
  week_start: string;
  most_alive: string;
  most_dead: string;
  pattern_noticed: string;
  anti_vision_check: boolean;
  levers_adjusted: boolean;
  project_progress: number;
  created_at: string;
}

export interface BossFight {
  id: string;
  user_id: string;
  month_start: string;
  project_text: string;
  completion_criteria: string;
  status: 'active' | 'defeated' | 'failed';
  progress: number;
  loot_acquired: string[];
  learnings: string;
  xp_gained: number;
  completed_at?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  unlocked_at: string;
}

export interface OnboardingQuestion {
  number: number;
  text: string;
  section: 'pain' | 'anti-vision' | 'vision' | 'synthesis';
  placeholder?: string;
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Conformist',
  2: 'Self-Aware',
  3: 'Architect',
  4: 'Builder',
  5: 'Strategist',
  6: 'Visionary',
  7: 'Master',
  8: 'Legend',
};

export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3500,
  5: 7500,
  6: 15000,
  7: 30000,
  8: 60000,
};
