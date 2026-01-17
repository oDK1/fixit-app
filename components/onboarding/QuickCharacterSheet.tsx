'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface QuickCharacterSheetProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function QuickCharacterSheet({
  userId,
  onComplete,
  onBack,
}: QuickCharacterSheetProps) {
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

      console.log('Quick setup completed successfully');
      onComplete();
    } catch (error) {
      console.error('Unexpected error saving character sheet:', error);
      alert('An unexpected error occurred. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const isComplete =
    antiVision.trim() &&
    vision.trim() &&
    yearGoal.trim() &&
    monthProject.trim() &&
    dailyLevers.trim() &&
    constraints.trim();

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white mb-4"
        >
          ← Back to full onboarding
        </button>
        <h1 className="text-3xl font-bold mb-2">Create Your Character Sheet</h1>
        <p className="text-gray-400">
          Fill out the 6 components to start your journey
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-6 overflow-y-auto">
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
          <p className="text-sm text-gray-400 mb-2">
            What is the life you refuse to let yourself become? One sentence.
          </p>
          <textarea
            value={antiVision}
            onChange={(e) => setAntiVision(e.target.value)}
            placeholder="I refuse to die having never..."
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
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
          <p className="text-sm text-gray-400 mb-2">
            What are you building toward? One sentence.
          </p>
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="I am building toward..."
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
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
          <p className="text-sm text-gray-400 mb-2">
            What must be true in one year to know you've broken the old pattern?
          </p>
          <textarea
            value={yearGoal}
            onChange={(e) => setYearGoal(e.target.value)}
            placeholder="In one year, this must be true..."
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 resize-none"
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
          <p className="text-sm text-gray-400 mb-2">
            What must be true in one month for the one-year goal to remain possible?
          </p>
          <textarea
            value={monthProject}
            onChange={(e) => setMonthProject(e.target.value)}
            placeholder="In one month, this must be true..."
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
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
          <p className="text-sm text-gray-400 mb-2">
            2-3 actions you can timeblock that the person you're becoming would simply do (one per line)
          </p>
          <textarea
            value={dailyLevers}
            onChange={(e) => setDailyLevers(e.target.value)}
            placeholder="Write for 30 minutes&#10;Exercise for 20 minutes&#10;Read 10 pages"
            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
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
          <p className="text-sm text-gray-400 mb-2">
            What are you not willing to sacrifice to achieve your vision?
          </p>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="I will not sacrifice..."
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </motion.div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          onClick={handleComplete}
          disabled={!isComplete || isSaving}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {isSaving ? 'Saving...' : 'Start Your Journey'}
        </button>
      </div>
    </div>
  );
}
