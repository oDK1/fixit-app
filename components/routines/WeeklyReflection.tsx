'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { calculateLevel } from '@/lib/xp';
import { DailyLog, DailyLever, CharacterSheet } from '@/types';

interface WeeklyReflectionProps {
  userId: string;
  onComplete: () => void;
}

export default function WeeklyReflection({
  userId,
  onComplete,
}: WeeklyReflectionProps) {
  const [step, setStep] = useState(1);
  const [weekLogs, setWeekLogs] = useState<DailyLog[]>([]);
  const [levers, setLevers] = useState<DailyLever[]>([]);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes

  // Form state
  const [mostAlive, setMostAlive] = useState('');
  const [mostDead, setMostDead] = useState('');
  const [pattern, setPattern] = useState('');
  const [antiVisionCheck, setAntiVisionCheck] = useState(false);
  const [leversToKeep, setLeversToKeep] = useState<string[]>([]);
  const [projectProgress, setProjectProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWeekData();
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadWeekData = async () => {
    // Get last 7 days of logs
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: logsData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    setWeekLogs(logsData || []);

    // Get active levers
    const { data: leversData } = await supabase
      .from('daily_levers')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('order');

    setLevers(leversData || []);
    setLeversToKeep((leversData || []).map(l => l.id));

    // Get character sheet
    const { data: sheetData } = await supabase
      .from('character_sheet')
      .select('*')
      .eq('user_id', userId)
      .single();

    setSheet(sheetData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      // Get week start date
      const today = new Date();
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Save weekly reflection
      await supabase.from('weekly_reflections').insert({
        user_id: userId,
        week_start: weekStart.toISOString().split('T')[0],
        most_alive: mostAlive,
        most_dead: mostDead,
        pattern_noticed: pattern,
        anti_vision_check: antiVisionCheck,
        levers_adjusted: leversToKeep.length !== levers.length,
        project_progress: projectProgress,
      });

      // Deactivate removed levers
      const leversToRemove = levers
        .filter(l => !leversToKeep.includes(l.id))
        .map(l => l.id);

      if (leversToRemove.length > 0) {
        await supabase
          .from('daily_levers')
          .update({ active: false })
          .in('id', leversToRemove);
      }

      // Update user XP (+200 for weekly reflection)
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', userId)
        .single();

      const newXp = (userData?.total_xp || 0) + 200;
      const newLevel = calculateLevel(newXp);

      await supabase
        .from('users')
        .update({
          total_xp: newXp,
          current_level: newLevel,
        })
        .eq('id', userId);

      onComplete();
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Week Review</h2>

            {/* Show daily comments */}
            <div className="mb-6 p-4 bg-gray-900 rounded-lg max-h-40 overflow-y-auto">
              <h3 className="text-sm text-gray-400 mb-2">Your daily reflections:</h3>
              {weekLogs.map((log) => (
                <div key={log.id} className="mb-2 text-sm">
                  <span className={log.direction === 'vision' ? 'text-green-500' : 'text-red-500'}>
                    {log.direction === 'vision' ? '→' : '←'}
                  </span>
                  <span className="text-gray-400 ml-2">{log.date}:</span>
                  <span className="text-white ml-2">{log.comment}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-lg mb-2">
                  When did I feel most alive this week? When did I feel most dead?
                </label>
                <textarea
                  value={mostAlive}
                  onChange={(e) => setMostAlive(e.target.value)}
                  placeholder="Most alive when... Most dead when..."
                  className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-lg mb-2">
                  What pattern do you notice in your answers?
                </label>
                <textarea
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="I notice that..."
                  className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Anti-Vision Reminder</h2>

            <div className="border-2 border-red-600 rounded-lg p-6 bg-red-900/10 mb-6">
              <p className="text-xl text-white italic mb-4">
                "{sheet?.anti_vision}"
              </p>
              <label className="flex items-center gap-3 text-lg">
                <input
                  type="checkbox"
                  checked={antiVisionCheck}
                  onChange={(e) => setAntiVisionCheck(e.target.checked)}
                  className="w-6 h-6"
                />
                <span>Does this still make you feel something when you read it?</span>
              </label>
            </div>

            <p className="text-gray-400">
              This is what's at stake if you give up. Let it fuel your commitment.
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Lever Adjustment</h2>

            <p className="text-gray-400 mb-4">
              Are your daily levers moving the needle on your monthly project?
            </p>

            <div className="space-y-3">
              {levers.map((lever) => (
                <label
                  key={lever.id}
                  className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={leversToKeep.includes(lever.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLeversToKeep([...leversToKeep, lever.id]);
                      } else {
                        setLeversToKeep(leversToKeep.filter(id => id !== lever.id));
                      }
                    }}
                    className="w-5 h-5"
                  />
                  <span className={leversToKeep.includes(lever.id) ? 'text-white' : 'text-gray-500 line-through'}>
                    {lever.lever_text}
                  </span>
                </label>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Uncheck levers that aren't helping. You can add new ones later.
            </p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Project Progress</h2>

            <p className="text-gray-400 mb-4">
              Monthly Project: <span className="text-white">{sheet?.month_project}</span>
            </p>

            <div className="mb-6">
              <label className="block text-lg mb-4">
                What % complete? What's blocking progress?
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={projectProgress}
                onChange={(e) => setProjectProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />

              <div className="flex justify-between mt-2">
                <span className="text-gray-400">0%</span>
                <span className="text-2xl font-bold text-purple-500">{projectProgress}%</span>
                <span className="text-gray-400">100%</span>
              </div>
            </div>

            <div className="w-full bg-gray-800 h-8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${projectProgress}%` }}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return mostAlive.trim() && pattern.trim();
      case 2:
        return true;
      case 3:
        return leversToKeep.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Weekly Reflection</h1>
          <div className="text-yellow-500 font-mono">{formatTime(timeLeft)}</div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s === step
                  ? 'bg-purple-600'
                  : s < step
                  ? 'bg-green-600'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Step {step} of 4
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-3 bg-gray-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        >
          Previous
        </button>

        <button
          onClick={() => {
            if (step === 4) {
              handleComplete();
            } else {
              setStep(step + 1);
            }
          }}
          disabled={!canProceed() || isSaving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition font-semibold"
        >
          {isSaving ? 'Saving...' : step === 4 ? 'Complete (+200 XP)' : 'Next'}
        </button>
      </div>
    </div>
  );
}
