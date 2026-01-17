'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface MainOnboardingProps {
  userId: string;
  onComplete: () => void;
}

export default function MainOnboarding({
  userId,
  onComplete,
}: MainOnboardingProps) {
  const [antiVision, setAntiVision] = useState('');
  const [vision, setVision] = useState('');
  const [yearGoal, setYearGoal] = useState('');
  const [monthProject, setMonthProject] = useState('');
  const [dailyLevers, setDailyLevers] = useState('');
  const [constraints, setConstraints] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      console.log('Saving character sheet for user:', userId);

      // Save character sheet
      const { data: sheetData, error: sheetError } = await supabase
        .from('character_sheet')
        .insert({
          user_id: userId,
          anti_vision: antiVision,
          vision,
          year_goal: yearGoal,
          month_project: monthProject,
          constraints,
        })
        .select()
        .single();

      if (sheetError) {
        console.error('Error saving character sheet:', sheetError);
        alert('Failed to save character sheet: ' + sheetError.message);
        return;
      }

      console.log('Character sheet saved:', sheetData);

      // Parse and save daily levers
      const levers = dailyLevers
        .split('\n')
        .filter((l) => l.trim())
        .map((lever, index) => ({
          user_id: userId,
          lever_text: lever.replace(/^\d+\.\s*/, '').trim(),
          xp_value: 50,
          order: index,
          active: true,
        }));

      if (levers.length > 0) {
        const { error: leversError } = await supabase
          .from('daily_levers')
          .insert(levers);

        if (leversError) {
          console.error('Error saving levers:', leversError);
        } else {
          console.log('Daily levers saved:', levers.length);
        }
      }

      // Create first boss fight
      const { error: bossError } = await supabase
        .from('boss_fights')
        .insert({
          user_id: userId,
          month_start: new Date().toISOString().split('T')[0],
          project_text: monthProject,
          status: 'active',
          progress: 0,
        });

      if (bossError) {
        console.error('Error creating boss fight:', bossError);
      } else {
        console.log('Boss fight created');
      }

      console.log('Onboarding completed successfully');
      onComplete();
    } catch (error) {
      console.error('Unexpected error saving character sheet:', error);
      alert('An unexpected error occurred. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const completedFields = [
    antiVision.trim(),
    vision.trim(),
    yearGoal.trim(),
    monthProject.trim(),
    dailyLevers.trim(),
    constraints.trim(),
  ].filter(Boolean).length;

  const isComplete = completedFields === 6;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Character Sheet</h1>
        <p className="text-gray-400 text-lg">
          Define the 6 components that will guide your transformation
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${(completedFields / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm text-gray-400">{completedFields}/6</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {/* Anti-Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-red-600 rounded-lg p-6 bg-red-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💀</span>
            <h2 className="text-xl font-bold text-red-500">Anti-Vision (Stakes)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            What is the life you refuse to let yourself become? One powerful sentence that makes you feel something.
          </p>
          <textarea
            value={antiVision}
            onChange={(e) => setAntiVision(e.target.value)}
            placeholder="I refuse to die having never..."
            className="w-full h-24 bg-gray-900/90 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
          />
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-green-600 rounded-lg p-6 bg-green-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✨</span>
            <h2 className="text-xl font-bold text-green-500">Vision (Win Condition)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            What are you building toward? One sentence that captures your ideal future.
          </p>
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="I am building toward..."
            className="w-full h-24 bg-gray-900/90 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
          />
        </motion.div>

        {/* 1 Year Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-yellow-600 rounded-lg p-6 bg-yellow-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-bold text-yellow-500">Mission (1-Year Goal)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            What must be true in one year to know you've broken the old pattern? One concrete milestone.
          </p>
          <textarea
            value={yearGoal}
            onChange={(e) => setYearGoal(e.target.value)}
            placeholder="In one year, this must be true..."
            className="w-full h-24 bg-gray-900/90 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 resize-none"
          />
        </motion.div>

        {/* 1 Month Project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-2 border-orange-600 rounded-lg p-6 bg-orange-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚔️</span>
            <h2 className="text-xl font-bold text-orange-500">Boss (1-Month Project)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            What must be true in one month for the one-year goal to remain possible? Your current focus.
          </p>
          <textarea
            value={monthProject}
            onChange={(e) => setMonthProject(e.target.value)}
            placeholder="In one month, this must be true..."
            className="w-full h-24 bg-gray-900/90 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
          />
        </motion.div>

        {/* Daily Levers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-2 border-blue-600 rounded-lg p-6 bg-blue-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚡</span>
            <h2 className="text-xl font-bold text-blue-500">Quests (Daily Levers)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            2-3 actions you'll do daily that the person you're becoming would simply do. One per line.
          </p>
          <textarea
            value={dailyLevers}
            onChange={(e) => setDailyLevers(e.target.value)}
            placeholder="Write for 30 minutes&#10;Exercise for 20 minutes&#10;Read 10 pages"
            className="w-full h-32 bg-gray-900/90 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        </motion.div>

        {/* Constraints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-2 border-purple-600 rounded-lg p-6 bg-purple-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📜</span>
            <h2 className="text-xl font-bold text-purple-500">Rules (Constraints)</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            What are you not willing to sacrifice to achieve your vision? Your non-negotiables.
          </p>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="I will not sacrifice..."
            className="w-full h-24 bg-gray-900/90 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </motion.div>
      </div>

      {/* Submit */}
      <div className="mt-6 sticky bottom-0 bg-black pt-4">
        <button
          onClick={handleComplete}
          disabled={!isComplete || isSaving}
          className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition shadow-2xl"
        >
          {isSaving ? 'Saving...' : 'Start Your Journey →'}
        </button>
        {!isComplete && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Complete all 6 components to continue
          </p>
        )}
      </div>
    </div>
  );
}
