'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer, useBossFight } from '@/hooks';

interface MonthlyBossFightProps {
  userId: string;
  onComplete: () => void;
}

export default function MonthlyBossFight({
  userId,
  onComplete,
}: MonthlyBossFightProps) {
  const [step, setStep] = useState<'completion' | 'review' | 'new-project'>('completion');
  const { bossFight, sheet, weeklyReflections, loading, complete } = useBossFight(userId);
  const { formatTime } = useTimer(600);

  // Form state
  const [wasCompleted, setWasCompleted] = useState<boolean | null>(null);
  const [reflection, setReflection] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newVision, setNewVision] = useState(sheet?.vision || '');
  const [newAntiVision, setNewAntiVision] = useState(sheet?.anti_vision || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update form when sheet loads
  if (sheet && !newVision && sheet.vision) {
    setNewVision(sheet.vision);
  }
  if (sheet && !newAntiVision && sheet.anti_vision) {
    setNewAntiVision(sheet.anti_vision);
  }

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      await complete(wasCompleted === true, reflection, newProject, {
        vision: newVision,
        anti_vision: newAntiVision,
      });
      onComplete();
    } catch (error) {
      console.error('Error completing boss fight:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'completion':
        return (
          <motion.div
            key="completion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Project Completion</h2>

            <div className="border-2 border-orange-600 rounded-lg p-6 bg-orange-900/10 mb-6">
              <h3 className="text-orange-500 font-bold mb-2">This Month's Boss:</h3>
              <p className="text-xl text-white">{bossFight?.project_text || 'No active project'}</p>
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
                      wasCompleted === true
                        ? 'bg-green-600 border-2 border-green-400'
                        : 'bg-gray-800 border-2 border-gray-700 hover:border-green-600'
                    }`}
                  >
                    Yes, Completed
                  </button>
                  <button
                    onClick={() => setWasCompleted(false)}
                    className={`flex-1 py-4 rounded-lg font-semibold transition ${
                      wasCompleted === false
                        ? 'bg-red-600 border-2 border-red-400'
                        : 'bg-gray-800 border-2 border-gray-700 hover:border-red-600'
                    }`}
                  >
                    No, Not Yet
                  </button>
                </div>
              </div>

              {wasCompleted !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Weekly Reflections Display */}
                  <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      {wasCompleted
                        ? 'When did you feel most alive/dead this month?'
                        : 'What was blocking your progress this month?'}
                    </h3>
                    <div className="space-y-3 max-h-32 overflow-y-auto">
                      {weeklyReflections.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No weekly reflections this month</p>
                      ) : (
                        weeklyReflections.map((ref, index) => {
                          const content = wasCompleted ? ref.most_alive : ref.blocking_progress;
                          return (
                            <div key={ref.id} className="text-sm">
                              <span className="text-purple-400 font-medium">Week {index + 1}:</span>
                              <span className="text-gray-300 ml-2">
                                {content || <span className="text-gray-500 italic">Not recorded</span>}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg mb-2">
                      {wasCompleted ? 'What did you learn?' : 'Why were you not able to complete?'}
                    </label>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder={wasCompleted ? 'I learned that...' : 'I was not able to complete because...'}
                      className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            <h2 className="text-2xl font-bold mb-6">Review Your Direction</h2>

            <div className="space-y-6 flex-1">
              {/* Anti-Vision */}
              <div className="border-2 border-red-600 rounded-lg p-4 bg-red-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💀</span>
                  <h3 className="text-red-500 font-bold">Anti-Vision (Stakes)</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Does this still make you feel something?
                </p>
                <textarea
                  value={newAntiVision}
                  onChange={(e) => setNewAntiVision(e.target.value)}
                  className="w-full h-24 bg-gray-900 border border-red-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                />
              </div>

              {/* Vision */}
              <div className="border-2 border-green-600 rounded-lg p-4 bg-green-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-green-500 font-bold">Vision (Win Condition)</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Does this still feel true, or have you outgrown it?
                </p>
                <textarea
                  value={newVision}
                  onChange={(e) => setNewVision(e.target.value)}
                  className="w-full h-24 bg-gray-900 border border-green-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                />
              </div>
            </div>
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

            {/* 1-Year Goal Display */}
            <div className="border-2 border-yellow-600 rounded-lg p-4 bg-yellow-900/10 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="text-yellow-500 font-bold">1-Year Goal (Mission)</h3>
              </div>
              <p className="text-white">{sheet?.year_goal || 'No year goal set'}</p>
            </div>

            <div className="flex-1">
              <label className="block text-lg mb-2">
                What's the next step toward your 1-year goal?
              </label>
              <textarea
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="In the next month, I will..."
                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                autoFocus
              />
            </div>

            {/* XP Preview */}
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg text-center">
              <p className="text-gray-400 mb-2">XP Reward for this month:</p>
              <p className="text-3xl font-bold text-yellow-500">
                +{wasCompleted ? '1000' : '250'} XP
              </p>
              {wasCompleted && (
                <p className="text-green-500 text-sm mt-1">Boss Defeated Bonus!</p>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const steps: typeof step[] = ['completion', 'review', 'new-project'];

  const canProceed = () => {
    switch (step) {
      case 'completion':
        return wasCompleted !== null && reflection.trim();
      case 'review':
        return newAntiVision.trim() && newVision.trim();
      case 'new-project':
        return newProject.trim();
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Monthly Boss Fight</h1>
          <div className="text-yellow-500 font-mono">{formatTime()}</div>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= steps.indexOf(step) ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => {
            const currentIndex = steps.indexOf(step);
            if (currentIndex > 0) setStep(steps[currentIndex - 1]);
          }}
          disabled={step === 'completion'}
          className="px-6 py-3 bg-gray-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        >
          Previous
        </button>

        <button
          onClick={() => {
            const currentIndex = steps.indexOf(step);
            const nextStep = steps[currentIndex + 1];
            if (nextStep) {
              setStep(nextStep);
            } else {
              handleComplete();
            }
          }}
          disabled={!canProceed() || isSaving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition font-semibold"
        >
          {isSaving ? 'Saving...' : step === 'new-project' ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
