'use client';

import { motion } from 'framer-motion';

interface MenuModalProps {
  onClose: () => void;
  onAdvancedReflection: () => void;
  onWeeklyReflection: () => void;
  onMonthlyBossFight: () => void;
  onReset: () => void;
}

export default function MenuModal({
  onClose,
  onAdvancedReflection,
  onWeeklyReflection,
  onMonthlyBossFight,
  onReset,
}: MenuModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border-2 border-purple-600 rounded-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Menu</h2>

        <div className="space-y-3">
          <button
            onClick={() => {
              onAdvancedReflection();
              onClose();
            }}
            className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-600 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <div className="font-semibold text-white">Advanced Reflection</div>
                <div className="text-sm text-gray-400">16-question deep dive</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onWeeklyReflection();
              onClose();
            }}
            className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-blue-600 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-semibold text-white">Weekly Reflection</div>
                <div className="text-sm text-gray-400">8-minute review (test it now)</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onMonthlyBossFight();
              onClose();
            }}
            className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-orange-600 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <div className="font-semibold text-white">Monthly Boss Fight</div>
                <div className="text-sm text-gray-400">10-minute completion (test it now)</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset? This will delete all your progress and start fresh.')) {
                onReset();
              }
            }}
            className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-red-900 hover:border-red-600 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <div className="font-semibold text-red-400">Reset & Start Over</div>
                <div className="text-sm text-gray-400">Clear all data and restart onboarding</div>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-white"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
