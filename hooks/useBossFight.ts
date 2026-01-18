'use client';

import { useState, useEffect, useCallback } from 'react';
import { BossFight, CharacterSheet, WeeklyReflection } from '@/types';
import {
  getActiveBossFight,
  getCharacterSheet,
  getWeeklyReflections,
  completeBossFight as completeBossFightService,
  createBossFight,
  updateBossFightProgress,
  updateCharacterSheet,
  updateUserXP,
} from '@/lib/database';

interface UseBossFightReturn {
  bossFight: BossFight | null;
  sheet: CharacterSheet | null;
  weeklyReflections: WeeklyReflection[];
  loading: boolean;
  updateProgress: (progress: number) => Promise<void>;
  complete: (
    completed: boolean,
    learnings: string,
    newProject: string,
    visionUpdates?: { vision?: string; anti_vision?: string }
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBossFight(userId: string): UseBossFightReturn {
  const [bossFight, setBossFight] = useState<BossFight | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const [bossData, sheetData] = await Promise.all([
      getActiveBossFight(userId),
      getCharacterSheet(userId),
    ]);

    setBossFight(bossData);
    setSheet(sheetData);

    // Load weekly reflections for current boss fight period
    if (bossData?.created_at) {
      const reflections = await getWeeklyReflections(userId, bossData.created_at);
      setWeeklyReflections(reflections);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateProgress = useCallback(
    async (progress: number) => {
      await updateBossFightProgress(userId, progress);
      if (bossFight) {
        setBossFight({ ...bossFight, progress });
      }
    },
    [userId, bossFight]
  );

  const complete = useCallback(
    async (
      completed: boolean,
      learnings: string,
      newProject: string,
      visionUpdates?: { vision?: string; anti_vision?: string }
    ) => {
      if (bossFight) {
        const { xpGain } = await completeBossFightService(
          bossFight.id,
          completed,
          learnings
        );
        await updateUserXP(userId, xpGain);
      }

      // Create new boss fight
      await createBossFight(userId, newProject);

      // Update character sheet
      const updates: Partial<CharacterSheet> = {
        month_project: newProject,
      };
      if (visionUpdates?.vision) {
        updates.vision = visionUpdates.vision;
      }
      if (visionUpdates?.anti_vision) {
        updates.anti_vision = visionUpdates.anti_vision;
      }
      await updateCharacterSheet(userId, updates);

      await refetch();
    },
    [userId, bossFight, refetch]
  );

  return {
    bossFight,
    sheet,
    weeklyReflections,
    loading,
    updateProgress,
    complete,
    refetch,
  };
}
