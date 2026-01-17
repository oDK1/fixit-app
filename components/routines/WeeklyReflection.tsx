'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { calculateLevel } from '@/lib/xp';
import { DailyLog, CharacterSheet } from '@/types';

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
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (reduced from 8)

  // Form state
  const [mostAlive, setMostAlive] = useState('');
  const [projectProgress, setProjectProgress] = useState(0);
  const [blockingProgress, setBlockingProgress] = useState('');
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

    // Get character sheet
    const { data: sheetData } = await supabase
      .from('character_sheet')
      .select('*')
      .eq('user_id', userId)
      .single();

    setSheet(sheetData);

    // Get active boss fight progress
    const { data: bossData } = await supabase
      .from('boss_fights')
      .select('progress')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (bossData) {
      setProjectProgress(bossData.progress || 0);
    }
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
        project_progress: projectProgress,
        blocking_progress: blockingProgress,
      });

      // Update the active boss fight progress
      await supabase
        .from('boss_fights')
        .update({ progress: projectProgress })
        .eq('user_id', userId)
        .eq('status', 'active');

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
              {weekLogs.length > 0 ? (
                weekLogs.map((log) => (
                  <div key={log.id} className="mb-2 text-sm">
                    <span className={log.direction === 'vision' ? 'text-green-500' : 'text-red-500'}>
                      {log.direction === 'vision' ? '→' : '←'}
                    </span>
                    <span className="text-gray-400 ml-2">{log.date}:</span>
                    <span className="text-white ml-2">{log.comment}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No daily logs this week</p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-lg mb-2">
                When did I feel most alive this week? When did I feel most dead?
              </label>
              <textarea
                value={mostAlive}
                onChange={(e) => setMostAlive(e.target.value)}
                placeholder="Most alive when... Most dead when..."
                className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                autoFocus
              />
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
            <h2 className="text-2xl font-bold mb-6">Project Progress</h2>

            <p className="text-gray-400 mb-4">
              Monthly Project: <span className="text-white">{sheet?.month_project}</span>
            </p>

            <div className="mb-6">
              <label className="block text-lg mb-4">
                What % complete?
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={projectProgress}
                onChange={(e) => setProjectProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />

              <div className="flex justify-between mt-2">
                <span className="text-gray-400">0%</span>
                <span className="text-2xl font-bold text-orange-500">{projectProgress}%</span>
                <span className="text-gray-400">100%</span>
              </div>
            </div>

            <div className="w-full bg-gray-800 h-6 rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-orange-600"
                initial={{ width: 0 }}
                animate={{ width: `${projectProgress}%` }}
              />
            </div>

            <div className="flex-1">
              <label className="block text-lg mb-2">
                What's blocking your progress?
              </label>
              <textarea
                value={blockingProgress}
                onChange={(e) => setBlockingProgress(e.target.value)}
                placeholder="The main thing holding me back is..."
                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
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
        return mostAlive.trim().length > 0;
      case 2:
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
          {[1, 2].map((s) => (
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
          Step {step} of 2
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
            if (step === 2) {
              handleComplete();
            } else {
              setStep(step + 1);
            }
          }}
          disabled={!canProceed() || isSaving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition font-semibold"
        >
          {isSaving ? 'Saving...' : step === 2 ? 'Complete (+200 XP)' : 'Next'}
        </button>
      </div>
    </div>
  );
}
