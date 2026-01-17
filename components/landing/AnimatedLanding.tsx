'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingMan from './FloatingMan';
import EnterButton from './EnterButton';

interface AnimatedLandingProps {
  onEnter: () => void;
}

export default function AnimatedLanding({ onEnter }: AnimatedLandingProps) {
  const [isEntering, setIsEntering] = useState(false);

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

      {/* Enter Button - positioned in the black area at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-50">
        <motion.div
          animate={{ opacity: isEntering ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <EnterButton onClick={handleEnter} disabled={isEntering} />
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
