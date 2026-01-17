'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  User,
  CharacterSheet,
  DailyLever,
  BossFight,
  DailyLog,
} from '@/types';
import { LEVEL_TITLES } from '@/types';
import { celebrateQuestComplete } from '@/lib/confetti';
import { calculateLevel, getXpProgress } from '@/lib/xp';

interface GameHUDProps {
  userId: string;
}

export default function GameHUD({ userId }: GameHUDProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [levers, setLevers] = useState<DailyLever[]>([]);
  const [activeBoss, setActiveBoss] = useState<BossFight | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    // Load user
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    setUser(userData);

    // Load character sheet
    const { data: sheetData } = await supabase
      .from('character_sheet')
      .select('*')
      .eq('user_id', userId)
      .single();
    setSheet(sheetData);

    // Load active levers
    const { data: leversData } = await supabase
      .from('daily_levers')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('order');
    setLevers(leversData || []);

    // Load active boss
    const { data: bossData } = await supabase
      .from('boss_fights')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setActiveBoss(bossData);

    // Load today's log
    const today = new Date().toISOString().split('T')[0];
    const { data: logData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    setTodayLog(logData);
  };

  const toggleLever = async (leverId: string) => {
    const completed = todayLog?.levers_completed || [];
    const isCompleted = completed.includes(leverId);

    const newCompleted = isCompleted
      ? completed.filter((id) => id !== leverId)
      : [...completed, leverId];

    const lever = levers.find((l) => l.id === leverId);
    const xpChange = isCompleted ? -(lever?.xp_value || 0) : lever?.xp_value || 0;

    const today = new Date().toISOString().split('T')[0];

    if (todayLog) {
      await supabase
        .from('daily_logs')
        .update({
          levers_completed: newCompleted,
          xp_gained: (todayLog.xp_gained || 0) + xpChange,
        })
        .eq('id', todayLog.id);
    } else {
      await supabase.from('daily_logs').insert({
        user_id: userId,
        date: today,
        levers_completed: newCompleted,
        xp_gained: xpChange,
      });
    }

    // Update user XP and level
    const newTotalXp = (user?.total_xp || 0) + xpChange;
    const newLevel = calculateLevel(newTotalXp);

    await supabase
      .from('users')
      .update({
        total_xp: newTotalXp,
        current_level: newLevel,
      })
      .eq('id', userId);

    // Celebrate quest completion
    if (!isCompleted) {
      celebrateQuestComplete();
    }

    loadData();
  };

  if (!user || !sheet) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const levelTitle = LEVEL_TITLES[user.current_level] || 'Explorer';
  const xpProgress = getXpProgress(user.total_xp, user.current_level);
  const bossHpRemaining = activeBoss ? 100 - activeBoss.progress : 0;

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Background engraving texture */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <img
          src="/images/falling-engraving.jpeg"
          alt=""
          className="w-full h-full object-cover blur-md"
        />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header - Level & XP */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-purple-600 rounded-lg p-4 mb-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20"
        >
          <div className="text-sm text-gray-400 mb-1">LEVEL {user.current_level}</div>
          <div className="text-2xl font-bold mb-2">{levelTitle.toUpperCase()}</div>
          <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-400 mt-1">{user.total_xp} XP</div>
        </motion.div>

        {/* Stakes - Anti-Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-red-600 rounded-lg p-4 mb-4 bg-red-900/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💀</span>
            <span className="text-red-600 font-semibold">ANTI-VISION</span>
          </div>
          <p className="text-white italic">"{sheet.anti_vision}"</p>
        </motion.div>

        {/* Mission - 1 Year Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-yellow-600 rounded-lg p-4 mb-4 bg-yellow-900/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-yellow-600 font-semibold">MISSION</span>
          </div>
          <p className="text-white">{sheet.year_goal}</p>
        </motion.div>

        {/* Boss Fight - Monthly Project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-orange-600 rounded-lg p-4 mb-4 bg-orange-900/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚔️</span>
            <span className="text-orange-600 font-semibold">BOSS FIGHT</span>
          </div>
          <p className="text-white mb-3">{sheet.month_project}</p>

          {activeBoss && (
            <>
              {/* Boss HP Bar */}
              <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-500"
                  style={{ width: `${bossHpRemaining}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {bossHpRemaining}% HP LEFT
                </div>
              </div>

              <div className="text-sm text-gray-400 mt-2">
                Days remaining: {Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
            </>
          )}
        </motion.div>

        {/* Daily Quests - Levers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-blue-600 rounded-lg p-4 mb-4 bg-blue-900/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <span className="text-blue-600 font-semibold">TODAY'S QUESTS</span>
          </div>

          <div className="space-y-3">
            {levers.map((lever) => {
              const isCompleted = todayLog?.levers_completed?.includes(lever.id);
              return (
                <motion.button
                  key={lever.id}
                  onClick={() => toggleLever(lever.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-green-900/20 border-green-600'
                      : 'bg-gray-900 border-gray-700 hover:border-blue-600'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-600'
                        }`}
                      >
                        {isCompleted && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className={isCompleted ? 'line-through text-gray-500' : ''}>
                        {lever.lever_text}
                      </span>
                    </div>
                    <span className="text-yellow-500 text-sm">+{lever.xp_value} XP</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Streak */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
            <span className="text-gray-400">Streak</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold">{user.current_streak} days</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
