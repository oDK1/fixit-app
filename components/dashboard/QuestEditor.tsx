'use client';

import { useState } from 'react';
import { DailyLever } from '@/types';
import {
  updateLever,
  deactivateLevers,
  createLevers,
} from '@/lib/database';

interface EditableLever {
  id?: string;
  lever_text: string;
  xp_value: number;
  order: number;
}

interface QuestEditorProps {
  userId: string;
  levers: DailyLever[];
  onSave: () => void;
  onCancel: () => void;
}

export default function QuestEditor({
  userId,
  levers,
  onSave,
  onCancel,
}: QuestEditorProps) {
  const [editLevers, setEditLevers] = useState<EditableLever[]>(
    levers.map((l) => ({
      id: l.id,
      lever_text: l.lever_text,
      xp_value: l.xp_value,
      order: l.order,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Deactivate removed levers
      const removedLeverIds = levers
        .filter((l) => !editLevers.find((el) => el.id === l.id))
        .map((l) => l.id);

      await deactivateLevers(removedLeverIds);

      // 2. Update existing levers
      for (const lever of editLevers.filter((l) => l.id)) {
        await updateLever(lever.id!, {
          lever_text: lever.lever_text,
          xp_value: lever.xp_value,
          order: lever.order,
        });
      }

      // 3. Insert new levers
      const newLevers = editLevers.filter((l) => !l.id);
      if (newLevers.length > 0) {
        await createLevers(userId, newLevers);
      }

      onSave();
    } catch (err) {
      console.error('Error saving quests:', err);
      alert('Failed to save quests. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateLeverField = (
    index: number,
    field: 'lever_text' | 'xp_value',
    value: string | number
  ) => {
    const newLevers = [...editLevers];
    newLevers[index] = { ...newLevers[index], [field]: value };
    setEditLevers(newLevers);
  };

  const removeLever = (index: number) => {
    setEditLevers(editLevers.filter((_, i) => i !== index));
  };

  const addLever = () => {
    setEditLevers([
      ...editLevers,
      {
        lever_text: '',
        xp_value: 25,
        order: editLevers.length,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {editLevers.map((lever, index) => (
        <div key={lever.id || `new-${index}`} className="flex gap-2 items-start">
          <input
            type="text"
            value={lever.lever_text}
            onChange={(e) => updateLeverField(index, 'lever_text', e.target.value)}
            placeholder="Quest description"
            className="flex-1 bg-black/50 border border-blue-600 rounded-lg p-2 text-white focus:outline-none focus:border-blue-400"
          />
          <input
            type="number"
            value={lever.xp_value}
            onChange={(e) => updateLeverField(index, 'xp_value', Number(e.target.value))}
            placeholder="XP"
            className="w-20 bg-black/50 border border-blue-600 rounded-lg p-2 text-white text-center focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={() => removeLever(index)}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addLever}
        className="w-full py-2 bg-blue-600/50 hover:bg-blue-600 rounded-lg text-white font-semibold border border-blue-600 border-dashed"
      >
        + Add Quest
      </button>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition text-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Quests'}
        </button>
      </div>
    </div>
  );
}
