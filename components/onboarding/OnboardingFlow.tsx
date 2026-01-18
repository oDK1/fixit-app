'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ONBOARDING_QUESTIONS } from '@/lib/questions';
import { createClient } from '@/lib/supabase/client';
import { sanitizeInput } from '@/lib/sanitize';
import { OnboardingResponse } from '@/types';
import QuickCharacterSheet from './QuickCharacterSheet';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes total
  const [isSaving, setIsSaving] = useState(false);
  const [showSkipOption, setShowSkipOption] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = ONBOARDING_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const saveAnswer = async (answer: string) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      // Sanitize user input before storing
      const sanitizedAnswer = sanitizeInput(answer, { maxLength: 5000 });
      await supabase.from('onboarding_responses').upsert({
        user_id: userId,
        question_number: question.number,
        question_text: question.text,
        answer: sanitizedAnswer,
      });
      setAnswers({ ...answers, [question.number]: sanitizedAnswer });
    } catch (error) {
      // Error handling without exposing details
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    const answer = answers[question.number] || '';
    if (answer.trim()) {
      await saveAnswer(answer);

      if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        await finalizeOnboarding();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finalizeOnboarding = async () => {
    const supabase = createClient();
    // Extract and sanitize key answers for character sheet
    const antiVision = sanitizeInput(answers[17] || '', { maxLength: 2000 });
    const vision = sanitizeInput(answers[18] || '', { maxLength: 2000 });
    const yearGoal = sanitizeInput(answers[19] || '', { maxLength: 2000 });
    const monthProject = sanitizeInput(answers[20] || '', { maxLength: 2000 });
    const constraints = sanitizeInput(answers[22] || '', { maxLength: 2000 });

    // Save character sheet
    await supabase.from('character_sheet').insert({
      user_id: userId,
      anti_vision: antiVision,
      vision,
      year_goal: yearGoal,
      month_project: monthProject,
      constraints,
    });

    // Parse and save daily levers from question 21
    const leversText = answers[21] || '';
    const levers = leversText
      .split('\n')
      .filter((l) => l.trim())
      .slice(0, 10) // Limit to 10 levers max
      .map((lever, index) => ({
        user_id: userId,
        lever_text: sanitizeInput(lever.replace(/^\d+\.\s*/, '').trim(), { maxLength: 500 }),
        xp_value: 50,
        order: index,
        active: true,
      }));

    if (levers.length > 0) {
      await supabase.from('daily_levers').insert(levers);
    }

    // Create first boss fight
    await supabase.from('boss_fights').insert({
      user_id: userId,
      month_start: new Date().toISOString().split('T')[0],
      project_text: monthProject,
      status: 'active',
      progress: 0,
    });

    onComplete();
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'pain':
        return 'Part 1: Pain Awareness';
      case 'anti-vision':
        return 'Part 1: Anti-Vision';
      case 'vision':
        return 'Part 1: Vision';
      case 'synthesis':
        return 'Part 3: Evening Synthesis';
      default:
        return 'Onboarding';
    }
  };

  if (showSkipOption) {
    return (
      <QuickCharacterSheet
        userId={userId}
        onComplete={onComplete}
        onBack={() => setShowSkipOption(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col relative overflow-hidden">
      {/* Background engraving texture */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-10" />
        <img
          src="/images/falling-engraving.jpeg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {getSectionTitle(question.section)}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSkipOption(true)}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              Already did this? Skip to quick setup
            </button>
            <div className="text-red-500 font-mono">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-2 text-sm text-gray-400">
          Question {currentQuestion + 1} of {ONBOARDING_QUESTIONS.length}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col relative z-10"
        >
          <h2 className="text-xl mb-6 leading-relaxed">{question.text}</h2>

          <textarea
            value={answers[question.number] || ''}
            onChange={(e) =>
              setAnswers({ ...answers, [question.number]: e.target.value })
            }
            placeholder={question.placeholder}
            className="flex-1 bg-gray-900/90 border-2 border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none shadow-2xl backdrop-blur-sm"
            autoFocus
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center relative z-10">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-gray-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!answers[question.number]?.trim() || isSaving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition font-semibold"
        >
          {isSaving
            ? 'Saving...'
            : currentQuestion === ONBOARDING_QUESTIONS.length - 1
            ? 'Complete'
            : 'Next'}
        </button>
      </div>
    </div>
  );
}
