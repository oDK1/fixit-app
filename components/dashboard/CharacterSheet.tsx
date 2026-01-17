'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { CharacterSheet as Sheet, DailyLever } from '@/types';

interface CharacterSheetProps {
  userId: string;
  onClose: () => void;
}

export default function CharacterSheet({ userId, onClose }: CharacterSheetProps) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [levers, setLevers] = useState<DailyLever[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editAntiVision, setEditAntiVision] = useState('');
  const [editVision, setEditVision] = useState('');
  const [editYearGoal, setEditYearGoal] = useState('');
  const [editMonthProject, setEditMonthProject] = useState('');
  const [editConstraints, setEditConstraints] = useState('');
  const [editLevers, setEditLevers] = useState<Array<{ id?: string; lever_text: string; xp_value: number; order: number }>>([]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: sheetData, error: sheetError } = await supabase
        .from('character_sheet')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Check for actual errors (not just "no rows returned")
      if (sheetError && sheetError.code !== 'PGRST116') {
        console.error('Error loading character sheet:', sheetError);
        setError(sheetError.message || 'Failed to load character sheet');
        return;
      }

      // If no data found, show helpful message
      if (!sheetData) {
        setError('No character sheet found. Please complete onboarding first.');
        return;
      }

      setSheet(sheetData);

      // Initialize edit form
      setEditAntiVision(sheetData.anti_vision || '');
      setEditVision(sheetData.vision || '');
      setEditYearGoal(sheetData.year_goal || '');
      setEditMonthProject(sheetData.month_project || '');
      setEditConstraints(sheetData.constraints || '');

      const { data: leversData } = await supabase
        .from('daily_levers')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('order');
      setLevers(leversData || []);
      setEditLevers((leversData || []).map(l => ({ id: l.id, lever_text: l.lever_text, xp_value: l.xp_value, order: l.order })));
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load character sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    if (sheet) {
      setEditAntiVision(sheet.anti_vision || '');
      setEditVision(sheet.vision || '');
      setEditYearGoal(sheet.year_goal || '');
      setEditMonthProject(sheet.month_project || '');
      setEditConstraints(sheet.constraints || '');
    }
    setEditLevers(levers.map(l => ({ id: l.id, lever_text: l.lever_text, xp_value: l.xp_value, order: l.order })));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!sheet) return;

    setIsSaving(true);
    try {
      // Save character sheet
      const { error: updateError } = await supabase
        .from('character_sheet')
        .update({
          anti_vision: editAntiVision,
          vision: editVision,
          year_goal: editYearGoal,
          month_project: editMonthProject,
          constraints: editConstraints,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Save levers
      // 1. Deactivate removed levers
      const removedLeverIds = levers
        .filter(l => !editLevers.find(el => el.id === l.id))
        .map(l => l.id);

      if (removedLeverIds.length > 0) {
        await supabase
          .from('daily_levers')
          .update({ active: false })
          .in('id', removedLeverIds);
      }

      // 2. Update existing levers
      for (const lever of editLevers.filter(l => l.id)) {
        await supabase
          .from('daily_levers')
          .update({
            lever_text: lever.lever_text,
            xp_value: lever.xp_value,
            order: lever.order,
          })
          .eq('id', lever.id);
      }

      // 3. Insert new levers
      const newLevers = editLevers.filter(l => !l.id);
      if (newLevers.length > 0) {
        await supabase.from('daily_levers').insert(
          newLevers.map(l => ({
            user_id: userId,
            lever_text: l.lever_text,
            xp_value: l.xp_value,
            order: l.order,
            active: true,
          }))
        );
      }

      // Update local state
      setSheet({
        ...sheet,
        anti_vision: editAntiVision,
        vision: editVision,
        year_goal: editYearGoal,
        month_project: editMonthProject,
        constraints: editConstraints,
      });

      // Reload data to get updated levers
      await loadData();

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving character sheet:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
        <div className="bg-gray-900 border-2 border-orange-600 rounded-lg p-8 max-w-md">
          <div className="text-center mb-6">
            <span className="text-6xl">📋</span>
          </div>
          <h2 className="text-2xl font-bold text-orange-500 mb-4 text-center">
            Character Sheet Not Found
          </h2>
          <p className="text-gray-300 mb-6 text-center">
            {error || 'You need to complete onboarding first to create your character sheet.'}
          </p>
          <p className="text-sm text-gray-400 mb-6 text-center">
            Complete the 22-question onboarding or use quick setup to create your 6-component character sheet.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg transition text-white font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">CHARACTER SHEET</h1>
            <div className="flex items-center gap-4">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition"
                >
                  ✏️ Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Forcefield Effect */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            {/* Anti-Vision */}
            <div className="border-2 border-red-600 rounded-lg p-6 bg-red-900/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 border-2 border-red-600 opacity-30"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💀</span>
                  <h2 className="text-xl font-bold text-red-500">
                    ANTI-VISION (Stakes)
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={editAntiVision}
                    onChange={(e) => setEditAntiVision(e.target.value)}
                    className="w-full bg-black/50 border border-red-600 rounded-lg p-3 text-white text-lg leading-relaxed resize-none focus:outline-none focus:border-red-400"
                    rows={3}
                  />
                ) : (
                  <p className="text-white text-lg leading-relaxed">
                    {sheet.anti_vision}
                  </p>
                )}
              </div>
            </div>

            {/* Vision */}
            <div className="border-2 border-green-600 rounded-lg p-6 bg-green-900/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 border-2 border-green-600 opacity-30"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">✨</span>
                  <h2 className="text-xl font-bold text-green-500">
                    VISION (Win Condition)
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={editVision}
                    onChange={(e) => setEditVision(e.target.value)}
                    className="w-full bg-black/50 border border-green-600 rounded-lg p-3 text-white text-lg leading-relaxed resize-none focus:outline-none focus:border-green-400"
                    rows={3}
                  />
                ) : (
                  <p className="text-white text-lg leading-relaxed">{sheet.vision}</p>
                )}
              </div>
            </div>

            {/* Mission */}
            <div className="border-2 border-yellow-600 rounded-lg p-6 bg-yellow-900/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 border-2 border-yellow-600 opacity-30"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎯</span>
                  <h2 className="text-xl font-bold text-yellow-500">
                    MISSION (1-Year Goal)
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={editYearGoal}
                    onChange={(e) => setEditYearGoal(e.target.value)}
                    className="w-full bg-black/50 border border-yellow-600 rounded-lg p-3 text-white text-lg leading-relaxed resize-none focus:outline-none focus:border-yellow-400"
                    rows={3}
                  />
                ) : (
                  <p className="text-white text-lg leading-relaxed">
                    {sheet.year_goal}
                  </p>
                )}
              </div>
            </div>

            {/* Boss Fight */}
            <div className="border-2 border-orange-600 rounded-lg p-6 bg-orange-900/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 border-2 border-orange-600 opacity-30"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1.5,
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">⚔️</span>
                  <h2 className="text-xl font-bold text-orange-500">
                    BOSS (1-Month Project)
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={editMonthProject}
                    onChange={(e) => setEditMonthProject(e.target.value)}
                    className="w-full bg-black/50 border border-orange-600 rounded-lg p-3 text-white text-lg leading-relaxed resize-none focus:outline-none focus:border-orange-400"
                    rows={3}
                  />
                ) : (
                  <p className="text-white text-lg leading-relaxed">
                    {sheet.month_project}
                  </p>
                )}
              </div>
            </div>

            {/* Quests */}
            <div className="border-2 border-blue-600 rounded-lg p-6 bg-blue-900/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 border-2 border-blue-600 opacity-30"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 2,
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">⚡</span>
                  <h2 className="text-xl font-bold text-blue-500">
                    QUESTS (Daily Levers)
                  </h2>
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    {editLevers.map((lever, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={lever.lever_text}
                          onChange={(e) => {
                            const newLevers = [...editLevers];
                            newLevers[index].lever_text = e.target.value;
                            setEditLevers(newLevers);
                          }}
                          placeholder="Quest description"
                          className="flex-1 bg-black/50 border border-blue-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400"
                        />
                        <input
                          type="number"
                          value={lever.xp_value}
                          onChange={(e) => {
                            const newLevers = [...editLevers];
                            newLevers[index].xp_value = Number(e.target.value);
                            setEditLevers(newLevers);
                          }}
                          placeholder="XP"
                          className="w-20 bg-black/50 border border-blue-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => {
                            setEditLevers(editLevers.filter((_, i) => i !== index));
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setEditLevers([
                          ...editLevers,
                          {
                            lever_text: '',
                            xp_value: 25,
                            order: editLevers.length,
                          },
                        ]);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
                    >
                      + Add Quest
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {levers.map((lever) => (
                      <li key={lever.id} className="text-white text-lg flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        {lever.lever_text}
                        <span className="text-sm text-yellow-500 ml-auto">+{lever.xp_value} XP</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Rules */}
            <div className="border-2 border-purple-600 rounded-lg p-6 bg-purple-900/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 border-2 border-purple-600 opacity-30"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 2.5,
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📜</span>
                  <h2 className="text-xl font-bold text-purple-500">
                    RULES (Constraints)
                  </h2>
                </div>
                {isEditing ? (
                  <textarea
                    value={editConstraints}
                    onChange={(e) => setEditConstraints(e.target.value)}
                    className="w-full bg-black/50 border border-purple-600 rounded-lg p-3 text-white text-lg leading-relaxed resize-none focus:outline-none focus:border-purple-400"
                    rows={3}
                  />
                ) : (
                  <p className="text-white text-lg leading-relaxed">
                    {sheet.constraints}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          {isEditing ? (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-lg font-semibold transition text-white disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
