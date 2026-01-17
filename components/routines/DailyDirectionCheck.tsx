'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { calculateLevel } from '@/lib/xp';

interface DailyDirectionCheckProps {
  userId: string;
  onComplete: () => void;
}

export default function DailyDirectionCheck({
  userId,
  onComplete,
}: DailyDirectionCheckProps) {
  const [step, setStep] = useState<'swipe' | 'comment'>('swipe');
  const [direction, setDirection] = useState<'vision' | 'hate' | null>(null);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSwipe = (dir: 'vision' | 'hate') => {
    setDirection(dir);
    setStep('comment');
  };

  const handleSubmit = async () => {
    if (!direction || !comment.trim()) return;

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if log exists
      const { data: existingLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const xpGain = direction === 'vision' ? 50 : 0;

      if (existingLog) {
        await supabase
          .from('daily_logs')
          .update({
            direction,
            comment,
            xp_gained: (existingLog.xp_gained || 0) + xpGain,
          })
          .eq('id', existingLog.id);
      } else {
        await supabase.from('daily_logs').insert({
          user_id: userId,
          date: today,
          direction,
          comment,
          xp_gained: xpGain,
          levers_completed: [],
        });
      }

      // Update user streak if vision
      if (direction === 'vision') {
        const { data: userData } = await supabase
          .from('users')
          .select('current_streak, total_xp')
          .eq('id', userId)
          .single();

        const newStreak = (userData?.current_streak || 0) + 1;
        const newXp = (userData?.total_xp || 0) + xpGain;
        const newLevel = calculateLevel(newXp);

        await supabase
          .from('users')
          .update({
            current_streak: newStreak,
            total_xp: newXp,
            current_level: newLevel,
          })
          .eq('id', userId);
      }

      onComplete();
    } catch (error) {
      console.error('Error saving direction check:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background engraving effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        <img
          src="/images/falling-engraving.jpeg"
          alt=""
          className="w-full h-full object-cover blur-sm"
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 'swipe' && (
          <motion.div
            key="swipe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md relative z-10"
          >
            <h1 className="text-4xl font-bold text-center mb-16 leading-tight">
              Am I falling into the life I <span className="text-red-500">hate</span><br />
              or climbing toward the life I <span className="text-green-500">want</span>?
            </h1>

            <div className="flex gap-6">
              {/* Hate Button */}
              <motion.button
                onClick={() => handleSwipe('hate')}
                className="flex-1 aspect-square bg-gradient-to-br from-red-900 to-red-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform border-2 border-red-600 shadow-2xl relative overflow-hidden"
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <span className="text-6xl relative z-10">←</span>
                <span className="text-xl font-bold relative z-10 tracking-wider">DESCENT</span>
              </motion.button>

              {/* Vision Button */}
              <motion.button
                onClick={() => handleSwipe('vision')}
                className="flex-1 aspect-square bg-gradient-to-br from-green-900 to-green-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform border-2 border-green-600 shadow-2xl relative overflow-hidden"
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <span className="text-6xl relative z-10">→</span>
                <span className="text-xl font-bold relative z-10 tracking-wider">ASCENT</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'comment' && (
          <motion.div
            key="comment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md relative z-10"
          >
            <button
              onClick={() => setStep('swipe')}
              className="mb-6 text-gray-400 hover:text-white"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Why do you feel this way today?
            </h2>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Be honest with yourself..."
              className="w-full h-64 bg-gray-900/90 border-2 border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none shadow-2xl backdrop-blur-sm"
              autoFocus
            />

            <motion.button
              onClick={handleSubmit}
              disabled={!comment.trim() || isSaving}
              className="w-full mt-6 py-4 bg-white text-black rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition shadow-2xl border-2 border-white"
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? 'Saving...' : 'Complete Check'}
              {direction === 'vision' && !isSaving && (
                <span className="ml-2 text-green-600">+50 XP</span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
