'use client';

import { useEffect, useState } from 'react';
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

type EditableField = 'anti_vision' | 'vision' | 'year_goal' | 'month_project' | 'constraints' | null;

export default function GameHUD({ userId }: GameHUDProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [levers, setLevers] = useState<DailyLever[]>([]);
  const [activeBoss, setActiveBoss] = useState<BossFight | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  // Inline editing state
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quest editing state
  const [isEditingQuests, setIsEditingQuests] = useState(false);
  const [editLevers, setEditLevers] = useState<Array<{ id?: string; lever_text: string; xp_value: number; order: number }>>([]);
  const [isSavingQuests, setIsSavingQuests] = useState(false);

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
    setEditLevers((leversData || []).map(l => ({ id: l.id, lever_text: l.lever_text, xp_value: l.xp_value, order: l.order })));

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

  // Inline editing functions
  const startEditing = (field: EditableField, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!sheet || !editingField) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('character_sheet')
        .update({
          [editingField]: editValue,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      setSheet({
        ...sheet,
        [editingField]: editValue,
      });
      setEditingField(null);
      setEditValue('');
    } catch (err) {
      console.error('Error saving field:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle escape key to cancel editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingField) cancelEditing();
        if (isEditingQuests) {
          setIsEditingQuests(false);
          setEditLevers(levers.map(l => ({ id: l.id, lever_text: l.lever_text, xp_value: l.xp_value, order: l.order })));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingField, isEditingQuests, levers]);

  // Quest editing functions
  const startEditingQuests = () => {
    setEditLevers(levers.map(l => ({ id: l.id, lever_text: l.lever_text, xp_value: l.xp_value, order: l.order })));
    setIsEditingQuests(true);
  };

  const cancelEditingQuests = () => {
    setIsEditingQuests(false);
    setEditLevers(levers.map(l => ({ id: l.id, lever_text: l.lever_text, xp_value: l.xp_value, order: l.order })));
  };

  const saveQuests = async () => {
    setIsSavingQuests(true);
    try {
      // 1. Deactivate removed levers
      const removedLeverIds = levers
        .filter(l => !editLevers.find(el => el.id === l.id))
        .map(l => l.id);

      if (removedLeverIds.length > 0) {
        await supabase
          .from('daily_levers')
          .update({ active: false })
          .in('id', removedLeverIds);
      }

      // 2. Update existing levers
      for (const lever of editLevers.filter(l => l.id)) {
        await supabase
          .from('daily_levers')
          .update({
            lever_text: lever.lever_text,
            xp_value: lever.xp_value,
            order: lever.order,
          })
          .eq('id', lever.id);
      }

      // 3. Insert new levers
      const newLevers = editLevers.filter(l => !l.id);
      if (newLevers.length > 0) {
        await supabase.from('daily_levers').insert(
          newLevers.map(l => ({
            user_id: userId,
            lever_text: l.lever_text,
            xp_value: l.xp_value,
            order: l.order,
            active: true,
          }))
        );
      }

      await loadData();
      setIsEditingQuests(false);
    } catch (err) {
      console.error('Error saving quests:', err);
      alert('Failed to save quests. Please try again.');
    } finally {
      setIsSavingQuests(false);
    }
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

  // Editable component wrapper
  const EditableSection = ({
    field,
    color,
    emoji,
    label,
    value,
    isItalic = false,
  }: {
    field: EditableField;
    color: string;
    emoji: string;
    label: string;
    value: string;
    isItalic?: boolean;
  }) => {
    const isEditing = editingField === field;
    const colorClasses: Record<string, { border: string; bg: string; text: string; focus: string }> = {
      red: { border: 'border-red-600', bg: 'bg-red-900/10', text: 'text-red-600', focus: 'focus:border-red-400' },
      green: { border: 'border-green-600', bg: 'bg-green-900/10', text: 'text-green-600', focus: 'focus:border-green-400' },
      yellow: { border: 'border-yellow-600', bg: 'bg-yellow-900/10', text: 'text-yellow-600', focus: 'focus:border-yellow-400' },
      orange: { border: 'border-orange-600', bg: 'bg-orange-900/10', text: 'text-orange-600', focus: 'focus:border-orange-400' },
      purple: { border: 'border-purple-600', bg: 'bg-purple-900/10', text: 'text-purple-600', focus: 'focus:border-purple-400' },
    };
    const colors = colorClasses[color] || colorClasses.purple;

    return (
      <div
        className={`border ${colors.border} rounded-lg p-4 mb-4 ${colors.bg} group`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <span className={`${colors.text} font-semibold`}>{label}</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => startEditing(field, value)}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white text-sm transition"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`w-full bg-black/50 border ${colors.border} rounded-lg p-3 text-white resize-none focus:outline-none ${colors.focus}`}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveField}
                disabled={isSaving}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition text-white disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p
            onClick={() => startEditing(field, value)}
            className={`text-white cursor-pointer hover:bg-white/5 rounded p-1 -m-1 transition ${isItalic ? 'italic' : ''}`}
          >
            {isItalic ? `"${value}"` : value}
          </p>
        )}
      </div>
    );
  };

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
        <div
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
        </div>

        {/* Stakes - Anti-Vision */}
        <EditableSection
          field="anti_vision"
          color="red"
          emoji="💀"
          label="ANTI-VISION"
          value={sheet.anti_vision}
          isItalic={true}
        />

        {/* Vision - Win Condition */}
        <EditableSection
          field="vision"
          color="green"
          emoji="✨"
          label="VISION"
          value={sheet.vision}
        />

        {/* Mission - 1 Year Goal */}
        <EditableSection
          field="year_goal"
          color="yellow"
          emoji="🎯"
          label="MISSION (1 Year Goal)"
          value={sheet.year_goal}
        />

        {/* Boss Fight - Monthly Project */}
        <div
          className="border border-orange-600 rounded-lg p-4 mb-4 bg-orange-900/10 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <span className="text-orange-600 font-semibold">BOSS (1 Month Project)</span>
            </div>
            {editingField !== 'month_project' && (
              <button
                onClick={() => startEditing('month_project', sheet.month_project)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white text-sm transition"
              >
                Edit
              </button>
            )}
          </div>

          {editingField === 'month_project' ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-black/50 border border-orange-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-orange-400"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveField}
                  disabled={isSaving}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition text-white disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p
                onClick={() => startEditing('month_project', sheet.month_project)}
                className="text-white mb-3 cursor-pointer hover:bg-white/5 rounded p-1 -m-1 transition"
              >
                {sheet.month_project}
              </p>

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
            </div>
          )}
        </div>

        {/* Daily Quests - Levers */}
        <div
          className="border border-blue-600 rounded-lg p-4 mb-4 bg-blue-900/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-blue-600 font-semibold">TODAY'S QUESTS</span>
            </div>
            {!isEditingQuests && (
              <button
                onClick={startEditingQuests}
                className="text-gray-500 hover:text-white text-sm transition"
              >
                Edit Quests
              </button>
            )}
          </div>

          {isEditingQuests ? (
            <div className="space-y-3">
              {editLevers.map((lever, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={lever.lever_text}
                    onChange={(e) => {
                      const newLevers = [...editLevers];
                      newLevers[index].lever_text = e.target.value;
                      setEditLevers(newLevers);
                    }}
                    placeholder="Quest description"
                    className="flex-1 bg-black/50 border border-blue-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="number"
                    value={lever.xp_value}
                    onChange={(e) => {
                      const newLevers = [...editLevers];
                      newLevers[index].xp_value = Number(e.target.value);
                      setEditLevers(newLevers);
                    }}
                    placeholder="XP"
                    className="w-20 bg-black/50 border border-blue-600 rounded-lg p-2 text-white text-center focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => {
                      setEditLevers(editLevers.filter((_, i) => i !== index));
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditLevers([
                    ...editLevers,
                    {
                      lever_text: '',
                      xp_value: 25,
                      order: editLevers.length,
                    },
                  ]);
                }}
                className="w-full py-2 bg-blue-600/50 hover:bg-blue-600 rounded-lg text-white font-semibold border border-blue-600 border-dashed"
              >
                + Add Quest
              </button>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={cancelEditingQuests}
                  disabled={isSavingQuests}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuests}
                  disabled={isSavingQuests}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition text-white disabled:opacity-50"
                >
                  {isSavingQuests ? 'Saving...' : 'Save Quests'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {levers.map((lever) => {
                const isCompleted = todayLog?.levers_completed?.includes(lever.id);
                return (
                  <button
                    key={lever.id}
                    onClick={() => toggleLever(lever.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-green-900/20 border-green-600'
                        : 'bg-gray-900 border-gray-700 hover:border-blue-600'
                    }`}
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
                  </button>
                );
              })}
            </div>
          )}

          {/* Streak */}
          {!isEditingQuests && (
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <span className="text-gray-400">Streak</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold">{user.current_streak} days</span>
              </div>
            </div>
          )}
        </div>

        {/* Rules - Constraints */}
        <EditableSection
          field="constraints"
          color="purple"
          emoji="📜"
          label="RULES"
          value={sheet.constraints}
        />
      </div>
    </div>
  );
}
