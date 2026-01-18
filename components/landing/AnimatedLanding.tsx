'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingMan from './FloatingMan';
import EnterButton from './EnterButton';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

interface AnimatedLandingProps {
  onEnter: () => void;
  errorMessage?: string | null;
  autoPlay?: boolean;
}

export default function AnimatedLanding({ onEnter, errorMessage, autoPlay = false }: AnimatedLandingProps) {
  const [isEntering, setIsEntering] = useState(false);

  // Auto-play the video for Google auth users
  useEffect(() => {
    if (autoPlay && !isEntering) {
      setIsEntering(true);
      // Trigger onEnter after 5-second video completes
      setTimeout(() => {
        onEnter();
      }, 5000);
    }
  }, [autoPlay, isEntering, onEnter]);

  const handleEnter = () => {
    setIsEntering(true);
    // Trigger onboarding after 5-second video completes
    setTimeout(() => {
      onEnter();
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fullscreen Video */}
      <FloatingMan isEntering={isEntering} />

      {/* Error Message Banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4 z-50 bg-red-900/90 border border-red-500 rounded-lg p-4 text-center"
        >
          <p className="text-red-100">{errorMessage}</p>
        </motion.div>
      )}

      {/* Auth Buttons - positioned in the black area at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3 z-50 px-6">
        <motion.div
          animate={{ opacity: isEntering ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <EnterButton onClick={handleEnter} disabled={isEntering} />
        </motion.div>

        <motion.div
          animate={{ opacity: isEntering ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex items-center justify-between"
        >
          <div className="flex-1" />
          <div className="max-w-xs">
            <GoogleSignInButton disabled={isEntering} />
          </div>
          <div className="flex-1 flex justify-end">
            <p className="text-gray-500 text-sm whitespace-nowrap">
              Sign in to save your progress
            </p>
          </div>
        </motion.div>
      </div>

      {/* Screen darkening effect on enter */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            className="absolute inset-0 bg-black z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 1.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
