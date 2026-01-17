'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { calculateLevel } from '@/lib/xp';
import { BossFight, CharacterSheet } from '@/types';

interface MonthlyBossFightProps {
  userId: string;
  onComplete: () => void;
}

export default function MonthlyBossFight({
  userId,
  onComplete,
}: MonthlyBossFightProps) {
  const [step, setStep] = useState<'review' | 'result' | 'new-project' | 'evolution'>('review');
  const [currentBoss, setCurrentBoss] = useState<BossFight | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Form state
  const [wasCompleted, setWasCompleted] = useState(false);
  const [learnings, setLearnings] = useState('');
  const [loot, setLoot] = useState<string[]>(['', '', '']);
  const [newProject, setNewProject] = useState('');
  const [newVision, setNewVision] = useState('');
  const [newYearGoal, setNewYearGoal] = useState('');
  const [constraintsViolated, setConstraintsViolated] = useState(false);
  const [constraintsValid, setConstraintsValid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    // Get active boss fight
    const { data: bossData } = await supabase
      .from('boss_fights')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setCurrentBoss(bossData);

    // Get character sheet
    const { data: sheetData } = await supabase
      .from('character_sheet')
      .select('*')
      .eq('user_id', userId)
      .single();

    setSheet(sheetData);
    setNewVision(sheetData?.vision || '');
    setNewYearGoal(sheetData?.year_goal || '');
    setNewProject(sheetData?.month_project || '');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      // Update current boss fight
      if (currentBoss) {
        await supabase
          .from('boss_fights')
          .update({
            status: wasCompleted ? 'defeated' : 'failed',
            progress: wasCompleted ? 100 : currentBoss.progress,
            learnings,
            loot_acquired: wasCompleted ? loot.filter(l => l.trim()) : [],
            xp_gained: wasCompleted ? 1000 : 250,
            completed_at: new Date().toISOString(),
          })
          .eq('id', currentBoss.id);
      }

      // Create new boss fight
      await supabase.from('boss_fights').insert({
        user_id: userId,
        month_start: new Date().toISOString().split('T')[0],
        project_text: newProject,
        status: 'active',
        progress: 0,
      });

      // Update character sheet
      await supabase
        .from('character_sheet')
        .update({
          vision: newVision,
          year_goal: newYearGoal,
          month_project: newProject,
        })
        .eq('user_id', userId);

      // Update user XP
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', userId)
        .single();

      const xpGain = wasCompleted ? 1000 : 250;
      const newXp = (userData?.total_xp || 0) + xpGain;
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
      console.error('Error completing boss fight:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'review':
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Project Completion Review</h2>

            <div className="border-2 border-orange-600 rounded-lg p-6 bg-orange-900/10 mb-6">
              <h3 className="text-orange-500 font-bold mb-2">This Month's Project:</h3>
              <p className="text-xl text-white">{currentBoss?.project_text}</p>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-lg mb-4">
                  Did you complete your monthly project?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setWasCompleted(true)}
                    className={`flex-1 py-4 rounded-lg font-semibold transition ${
                      wasCompleted
                        ? 'bg-green-600 border-2 border-green-400'
                        : 'bg-gray-800 border-2 border-gray-700 hover:border-green-600'
                    }`}
                  >
                    ✓ Yes, Completed
                  </button>
                  <button
                    onClick={() => setWasCompleted(false)}
                    className={`flex-1 py-4 rounded-lg font-semibold transition ${
                      !wasCompleted && wasCompleted !== null
                        ? 'bg-red-600 border-2 border-red-400'
                        : 'bg-gray-800 border-2 border-gray-700 hover:border-red-600'
                    }`}
                  >
                    ✗ No, Not Yet
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-lg mb-2">
                  What did you learn that you couldn't have known before?
                </label>
                <textarea
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="I learned that..."
                  className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>

              {wasCompleted && (
                <div>
                  <label className="block text-lg mb-2">
                    What surprised you about who you became this month?
                  </label>
                  <textarea
                    value={loot[0]}
                    onChange={(e) => setLoot([e.target.value, loot[1], loot[2]])}
                    placeholder="I was surprised by..."
                    className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                  />
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'result':
        return (
          <motion.div
            key="result"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col flex-1 items-center justify-center"
          >
            {wasCompleted ? (
              <>
                <motion.div
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="text-8xl mb-8"
                >
                  ⚔️
                </motion.div>
                <h2 className="text-4xl font-bold text-green-500 mb-4">
                  BOSS DEFEATED!
                </h2>
                <p className="text-2xl text-gray-400 mb-8">
                  "{currentBoss?.project_text}"
                </p>

                <div className="bg-gray-900 border-2 border-green-600 rounded-lg p-6 mb-8">
                  <h3 className="text-green-500 font-bold mb-4 text-xl">💎 LOOT ACQUIRED:</h3>
                  <ul className="space-y-2">
                    {loot.filter(l => l.trim()).map((item, i) => (
                      <li key={i} className="text-white">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-3xl font-bold text-yellow-500">
                  +1000 XP
                </div>
                <div className="text-gray-400 mt-2">Level up!</div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-8xl mb-8"
                >
                  ⚠️
                </motion.div>
                <h2 className="text-4xl font-bold text-orange-500 mb-4">
                  BOSS REMAINS
                </h2>
                <p className="text-xl text-gray-400 mb-4">
                  "{currentBoss?.project_text}"
                </p>
                <p className="text-gray-400 mb-8">
                  Progress: {currentBoss?.progress || 0}%
                </p>

                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
                  <h3 className="text-gray-400 mb-2">What you learned:</h3>
                  <p className="text-white">{learnings}</p>
                </div>

                <div className="text-2xl font-bold text-yellow-500">
                  +250 XP
                </div>
                <div className="text-gray-400 mt-2">For trying</div>
              </>
            )}
          </motion.div>
        );

      case 'new-project':
        return (
          <motion.div
            key="new-project"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">New Monthly Project</h2>

            <p className="text-gray-400 mb-4">
              What's the next boss fight toward your 1-year goal?
            </p>

            <div className="mb-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-400">Your 1-year goal:</p>
              <p className="text-white">{sheet?.year_goal}</p>
            </div>

            <div>
              <label className="block text-lg mb-2">
                What's the next boss fight toward your 1-year goal?
              </label>
              <textarea
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="In the next month, I will..."
                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                autoFocus
              />
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Tip:</h3>
              <p className="text-gray-300 text-sm">
                What skills will this unlock? Make it specific and measurable.
              </p>
            </div>
          </motion.div>
        );

      case 'evolution':
        return (
          <motion.div
            key="evolution"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Vision Evolution</h2>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-lg mb-2">
                  Does your vision still feel true, or have you outgrown it?
                </label>
                <div className="mb-2 p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Current vision:</p>
                  <p className="text-white italic">"{sheet?.vision}"</p>
                </div>
                <textarea
                  value={newVision}
                  onChange={(e) => setNewVision(e.target.value)}
                  placeholder="Update your vision..."
                  className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-lg mb-2">
                  Did you violate any constraints this month?
                </label>
                <div className="mb-2 p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Your constraints:</p>
                  <p className="text-white">{sheet?.constraints}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setConstraintsViolated(true)}
                    className={`flex-1 py-3 rounded-lg transition ${
                      constraintsViolated
                        ? 'bg-red-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConstraintsViolated(false)}
                    className={`flex-1 py-3 rounded-lg transition ${
                      !constraintsViolated
                        ? 'bg-green-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {constraintsViolated && (
                <div>
                  <label className="block text-lg mb-2 text-orange-500">
                    Do these constraints still serve you, or are they hiding fears?
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setConstraintsValid(true)}
                      className={`flex-1 py-3 rounded-lg transition ${
                        constraintsValid
                          ? 'bg-blue-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      Still valid
                    </button>
                    <button
                      onClick={() => setConstraintsValid(false)}
                      className={`flex-1 py-3 rounded-lg transition ${
                        !constraintsValid
                          ? 'bg-purple-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      Need to evolve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getNextStep = () => {
    const steps: typeof step[] = ['review', 'result', 'new-project', 'evolution'];
    const currentIndex = steps.indexOf(step);
    return steps[currentIndex + 1];
  };

  const getPrevStep = () => {
    const steps: typeof step[] = ['review', 'result', 'new-project', 'evolution'];
    const currentIndex = steps.indexOf(step);
    return steps[currentIndex - 1];
  };

  const canProceed = () => {
    switch (step) {
      case 'review':
        return learnings.trim() && (wasCompleted ? loot[0].trim() : true);
      case 'result':
        return true;
      case 'new-project':
        return newProject.trim();
      case 'evolution':
        return newVision.trim();
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Monthly Boss Fight</h1>
          <div className="text-yellow-500 font-mono">{formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(getPrevStep())}
          disabled={step === 'review' || step === 'result'}
          className="px-6 py-3 bg-gray-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        >
          Previous
        </button>

        <button
          onClick={() => {
            const next = getNextStep();
            if (next) {
              setStep(next);
            } else {
              handleComplete();
            }
          }}
          disabled={!canProceed() || isSaving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition font-semibold"
        >
          {isSaving ? 'Saving...' : step === 'evolution' ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
