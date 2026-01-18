import { createClient } from '@/lib/supabase/client';
import { calculateLevel } from './xp';
import {
  User,
  CharacterSheet,
  DailyLever,
  DailyLog,
  BossFight,
  WeeklyReflection,
} from '@/types';

// ============================================================================
// User Operations
// ============================================================================

export async function getUserData(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateUserXP(
  userId: string,
  xpDelta: number
): Promise<{ newXp: number; newLevel: number }> {
  const supabase = createClient();
  const { data: userData } = await supabase
    .from('users')
    .select('total_xp')
    .eq('id', userId)
    .single();

  const newXp = (userData?.total_xp || 0) + xpDelta;
  const newLevel = calculateLevel(newXp);

  await supabase
    .from('users')
    .update({
      total_xp: newXp,
      current_level: newLevel,
    })
    .eq('id', userId);

  return { newXp, newLevel };
}

export async function updateUserStreak(
  userId: string,
  streakDelta: number
): Promise<number> {
  const supabase = createClient();
  const { data: userData } = await supabase
    .from('users')
    .select('current_streak')
    .eq('id', userId)
    .single();

  const newStreak = (userData?.current_streak || 0) + streakDelta;

  await supabase
    .from('users')
    .update({ current_streak: newStreak })
    .eq('id', userId);

  return newStreak;
}

// ============================================================================
// Character Sheet Operations
// ============================================================================

export async function getCharacterSheet(
  userId: string
): Promise<CharacterSheet | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('character_sheet')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function updateCharacterSheet(
  userId: string,
  updates: Partial<CharacterSheet>
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('character_sheet')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

// ============================================================================
// Daily Levers (Quests) Operations
// ============================================================================

export async function getActiveLevers(userId: string): Promise<DailyLever[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('daily_levers')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('order');
  return data || [];
}

export async function updateLever(
  leverId: string,
  updates: Partial<DailyLever>
): Promise<void> {
  const supabase = createClient();
  await supabase.from('daily_levers').update(updates).eq('id', leverId);
}

export async function deactivateLevers(leverIds: string[]): Promise<void> {
  if (leverIds.length === 0) return;
  const supabase = createClient();
  await supabase
    .from('daily_levers')
    .update({ active: false })
    .in('id', leverIds);
}

export async function createLevers(
  userId: string,
  levers: Array<{ lever_text: string; xp_value: number; order: number }>
): Promise<void> {
  const supabase = createClient();
  await supabase.from('daily_levers').insert(
    levers.map((l) => ({
      user_id: userId,
      lever_text: l.lever_text,
      xp_value: l.xp_value,
      order: l.order,
      active: true,
    }))
  );
}

// ============================================================================
// Daily Log Operations
// ============================================================================

export async function getDailyLog(
  userId: string,
  date?: string
): Promise<DailyLog | null> {
  const supabase = createClient();
  const targetDate = date || new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', targetDate)
    .single();
  return data;
}

export async function saveDailyLog(
  userId: string,
  logData: {
    direction?: 'vision' | 'hate';
    comment?: string;
    levers_completed?: string[];
    xp_gained?: number;
  }
): Promise<DailyLog> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const existingLog = await getDailyLog(userId, today);

  if (existingLog) {
    const { data } = await supabase
      .from('daily_logs')
      .update(logData)
      .eq('id', existingLog.id)
      .select()
      .single();
    return data;
  } else {
    const { data } = await supabase
      .from('daily_logs')
      .insert({
        user_id: userId,
        date: today,
        levers_completed: [],
        xp_gained: 0,
        ...logData,
      })
      .select()
      .single();
    return data;
  }
}

export async function toggleLeverCompletion(
  userId: string,
  leverId: string,
  levers: DailyLever[]
): Promise<{ xpChange: number; isCompleted: boolean }> {
  const todayLog = await getDailyLog(userId);
  const completed = todayLog?.levers_completed || [];
  const isCurrentlyCompleted = completed.includes(leverId);

  const newCompleted = isCurrentlyCompleted
    ? completed.filter((id) => id !== leverId)
    : [...completed, leverId];

  const lever = levers.find((l) => l.id === leverId);
  const xpChange = isCurrentlyCompleted
    ? -(lever?.xp_value || 0)
    : lever?.xp_value || 0;

  await saveDailyLog(userId, {
    levers_completed: newCompleted,
    xp_gained: (todayLog?.xp_gained || 0) + xpChange,
  });

  await updateUserXP(userId, xpChange);

  return { xpChange, isCompleted: !isCurrentlyCompleted };
}

// ============================================================================
// Weekly Operations
// ============================================================================

export async function getWeeklyLogs(
  userId: string,
  daysBack: number = 7
): Promise<DailyLog[]> {
  const supabase = createClient();
  const today = new Date();
  const startDate = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  return data || [];
}

export async function saveWeeklyReflection(
  userId: string,
  reflectionData: {
    most_alive?: string;
    most_dead?: string;
    pattern_noticed?: string;
    anti_vision_check?: boolean;
    levers_adjusted?: boolean;
    project_progress?: number;
    blocking_progress?: string;
  }
): Promise<void> {
  const supabase = createClient();
  const today = new Date();
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  await supabase.from('weekly_reflections').insert({
    user_id: userId,
    week_start: weekStart.toISOString().split('T')[0],
    ...reflectionData,
  });

  // Award XP for weekly reflection
  await updateUserXP(userId, 200);
}

export async function getWeeklyReflections(
  userId: string,
  sinceDate?: string
): Promise<WeeklyReflection[]> {
  const supabase = createClient();
  let query = supabase
    .from('weekly_reflections')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: true });

  if (sinceDate) {
    query = query.gte('created_at', sinceDate);
  }

  const { data } = await query;
  return data || [];
}

// ============================================================================
// Boss Fight Operations
// ============================================================================

export async function getActiveBossFight(
  userId: string
): Promise<BossFight | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('boss_fights')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function updateBossFightProgress(
  userId: string,
  progress: number
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('boss_fights')
    .update({ progress })
    .eq('user_id', userId)
    .eq('status', 'active');
}

export async function completeBossFight(
  bossFightId: string,
  completed: boolean,
  learnings: string
): Promise<{ xpGain: number }> {
  const supabase = createClient();
  const xpGain = completed ? 1000 : 250;

  await supabase
    .from('boss_fights')
    .update({
      status: completed ? 'defeated' : 'failed',
      progress: completed ? 100 : undefined,
      learnings,
      xp_gained: xpGain,
      completed_at: new Date().toISOString(),
    })
    .eq('id', bossFightId);

  return { xpGain };
}

export async function createBossFight(
  userId: string,
  projectText: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from('boss_fights').insert({
    user_id: userId,
    month_start: new Date().toISOString().split('T')[0],
    project_text: projectText,
    status: 'active',
    progress: 0,
  });
}

// ============================================================================
// Combined Operations (for common patterns)
// ============================================================================

export async function loadDashboardData(userId: string): Promise<{
  user: User | null;
  sheet: CharacterSheet | null;
  levers: DailyLever[];
  activeBoss: BossFight | null;
  todayLog: DailyLog | null;
}> {
  const [user, sheet, levers, activeBoss, todayLog] = await Promise.all([
    getUserData(userId),
    getCharacterSheet(userId),
    getActiveLevers(userId),
    getActiveBossFight(userId),
    getDailyLog(userId),
  ]);

  return { user, sheet, levers, activeBoss, todayLog };
}
