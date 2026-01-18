'use client';

import { motion } from 'framer-motion';

interface EnterButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function EnterButton({ onClick, disabled }: EnterButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative px-8 py-5 text-base font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Vintage engraved border effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-white to-gray-300 rounded-lg" />
      <div className="absolute inset-[3px] bg-black rounded-lg" />
      <div className="absolute inset-[6px] bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-lg border-2 border-gray-600" />

      {/* Text with engraved effect */}
      <span className="relative block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400" style={{
        textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 -1px 1px rgba(255,255,255,0.2)',
        filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.1))',
      }}>
        FIX YOUR LIFE
      </span>

      {/* Glow effect on hover */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-lg"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}
