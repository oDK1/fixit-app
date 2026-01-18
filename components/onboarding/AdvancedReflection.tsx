'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ONBOARDING_QUESTIONS } from '@/lib/questions';
import { createClient } from '@/lib/supabase/client';

interface AdvancedReflectionProps {
  userId: string;
  isFullScreen?: boolean;
  onClose?: () => void;
}

export default function AdvancedReflection({ userId, isFullScreen = false, onClose }: AdvancedReflectionProps) {
  const [isOpen, setIsOpen] = useState(isFullScreen);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = useState<number | null>(null);

  useEffect(() => {
    if ((isOpen || isFullScreen) && userId) {
      loadAnswers();
    }
  }, [isOpen, isFullScreen, userId]);

  const loadAnswers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('onboarding_responses')
      .select('question_number, answer')
      .eq('user_id', userId);

    if (data) {
      const answersMap: Record<number, string> = {};
      data.forEach((item) => {
        answersMap[item.question_number] = item.answer;
      });
      setAnswers(answersMap);
    }
  };

  const saveAnswer = async (questionNumber: number, answer: string) => {
    if (!answer.trim()) return;

    setSavingQuestion(questionNumber);
    try {
      const supabase = createClient();
      const question = ONBOARDING_QUESTIONS.find(q => q.number === questionNumber);
      await supabase.from('onboarding_responses').upsert({
        user_id: userId,
        question_number: questionNumber,
        question_text: question?.text || '',
        answer,
      });
      setAnswers({ ...answers, [questionNumber]: answer });
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setSavingQuestion(null);
    }
  };

  // Only show questions 1-16 (questions 17-22 are already in the character sheet)
  const advancedQuestions = ONBOARDING_QUESTIONS.filter(q => q.number <= 16);

  const sections = [
    {
      id: 'pain',
      title: 'Pain Awareness',
      emoji: '😔',
      description: 'Uncover what you tolerate',
      questions: advancedQuestions.filter(q => q.section === 'pain'),
    },
    {
      id: 'anti-vision',
      title: 'Anti-Vision Deep Dive',
      emoji: '💀',
      description: 'Face the life you refuse',
      questions: advancedQuestions.filter(q => q.section === 'anti-vision'),
    },
    {
      id: 'vision',
      title: 'Vision Deep Dive',
      emoji: '✨',
      description: 'Define what you truly want',
      questions: advancedQuestions.filter(q => q.section === 'vision'),
    },
    {
      id: 'synthesis',
      title: "Understanding Why You're Stuck",
      emoji: '🧠',
      description: 'Identify the internal patterns',
      questions: advancedQuestions.filter(q => q.section === 'synthesis'),
    },
  ];

  const answeredCount = Object.keys(answers).filter(num => parseInt(num) <= 16).length;
  const totalQuestions = advancedQuestions.length;

  const handleClose = () => {
    if (isFullScreen && onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  // Full-screen wrapper for menu access
  if (isFullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 overflow-y-auto"
      >
        <div className="min-h-screen p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🧠</span>
                <div>
                  <h1 className="text-3xl font-bold text-purple-400">Advanced Reflection</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    16-question deep dive for profound insights
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-2xl p-2"
              >
                ✕
              </button>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Completion</span>
                <span className="text-sm font-semibold text-purple-400">
                  {answeredCount}/{totalQuestions} questions
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map((section) => {
                const sectionAnswered = section.questions.filter(q => answers[q.number]).length;
                const isExpanded = expandedSection === section.id;

                return (
                  <div key={section.id} className="border border-gray-700 rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full p-4 bg-gray-900/50 hover:bg-gray-900/70 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{section.emoji}</span>
                        <div className="text-left">
                          <h4 className="font-bold text-white">{section.title}</h4>
                          <p className="text-xs text-gray-400">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {sectionAnswered}/{section.questions.length}
                        </span>
                        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                    </button>

                    {/* Section Questions */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-6 bg-black/30">
                            {section.questions.map((question) => {
                              const hasAnswer = !!answers[question.number];
                              const isSaving = savingQuestion === question.number;

                              return (
                                <div key={question.number} className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <span className={`text-lg ${hasAnswer ? 'text-green-500' : 'text-gray-600'}`}>
                                      {hasAnswer ? '✓' : '○'}
                                    </span>
                                    <div className="flex-1">
                                      <label className="block text-sm font-medium text-white mb-2">
                                        Q{question.number}. {question.text}
                                      </label>
                                      <textarea
                                        value={answers[question.number] || ''}
                                        onChange={(e) => {
                                          setAnswers({ ...answers, [question.number]: e.target.value });
                                        }}
                                        onBlur={(e) => {
                                          if (e.target.value.trim() && e.target.value !== answers[question.number]) {
                                            saveAnswer(question.number, e.target.value);
                                          }
                                        }}
                                        placeholder={question.placeholder}
                                        className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                                      />
                                      {isSaving && (
                                        <p className="text-xs text-gray-500 mt-1">Saving...</p>
                                      )}
                                      {hasAnswer && !isSaving && (
                                        <p className="text-xs text-green-600 mt-1">Saved ✓</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {answeredCount === totalQuestions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-green-900/20 border border-green-600 rounded-lg text-center"
              >
                <p className="text-green-400 font-semibold">
                  Complete! You've finished the 16-question deep dive.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Use these insights to refine your dashboard components.
                </p>
              </motion.div>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition text-white"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Collapsed card view (for embedding in other views)
  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-purple-600/30 rounded-lg p-6 bg-purple-900/5 cursor-pointer hover:border-purple-600/60 transition"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧠</span>
            <div>
              <h3 className="text-xl font-bold text-purple-400">Advanced Reflection</h3>
              <p className="text-sm text-gray-400 mt-1">
                Optional 16-question deep dive for profound insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="text-lg font-bold text-purple-400">
                {answeredCount}/{totalQuestions}
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
              Explore →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Expanded inline view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-purple-600 rounded-lg p-6 bg-purple-900/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🧠</span>
          <div>
            <h3 className="text-2xl font-bold text-purple-400">Advanced Reflection</h3>
            <p className="text-sm text-gray-400 mt-1">
              Deep dive into pain, anti-vision, and vision for profound insights
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Completion</span>
          <span className="text-sm font-semibold text-purple-400">
            {answeredCount}/{totalQuestions} questions
          </span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const sectionAnswered = section.questions.filter(q => answers[q.number]).length;
          const isExpanded = expandedSection === section.id;

          return (
            <div key={section.id} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full p-4 bg-gray-900/50 hover:bg-gray-900/70 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.emoji}</span>
                  <div className="text-left">
                    <h4 className="font-bold text-white">{section.title}</h4>
                    <p className="text-xs text-gray-400">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {sectionAnswered}/{section.questions.length}
                  </span>
                  <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                </div>
              </button>

              {/* Section Questions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-6 bg-black/30">
                      {section.questions.map((question) => {
                        const hasAnswer = !!answers[question.number];
                        const isSaving = savingQuestion === question.number;

                        return (
                          <div key={question.number} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className={`text-lg ${hasAnswer ? 'text-green-500' : 'text-gray-600'}`}>
                                {hasAnswer ? '✓' : '○'}
                              </span>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-white mb-2">
                                  Q{question.number}. {question.text}
                                </label>
                                <textarea
                                  value={answers[question.number] || ''}
                                  onChange={(e) => {
                                    setAnswers({ ...answers, [question.number]: e.target.value });
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value.trim() && e.target.value !== answers[question.number]) {
                                      saveAnswer(question.number, e.target.value);
                                    }
                                  }}
                                  placeholder={question.placeholder}
                                  className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                                />
                                {isSaving && (
                                  <p className="text-xs text-gray-500 mt-1">Saving...</p>
                                )}
                                {hasAnswer && !isSaving && (
                                  <p className="text-xs text-green-600 mt-1">Saved ✓</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {answeredCount === totalQuestions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-green-900/20 border border-green-600 rounded-lg text-center"
        >
          <p className="text-green-400 font-semibold">
            Complete! You've finished the 16-question deep dive.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Use these insights to refine your Character Sheet components above.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
