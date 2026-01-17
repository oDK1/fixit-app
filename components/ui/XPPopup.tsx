'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface XPPopupProps {
  xp: number;
  trigger: boolean;
}

export default function XPPopup({ xp, trigger }: XPPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -50, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="absolute top-0 right-0 text-2xl font-bold text-yellow-400 pointer-events-none z-50"
        >
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
