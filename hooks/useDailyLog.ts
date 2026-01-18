'use client';

import { useState, useEffect, useCallback } from 'react';
import { DailyLog } from '@/types';
import {
  getDailyLog,
  saveDailyLog as saveDailyLogService,
  updateUserXP,
  updateUserStreak,
} from '@/lib/database';
import { celebrateQuestComplete } from '@/lib/confetti';

interface UseDailyLogReturn {
  log: DailyLog | null;
  loading: boolean;
  save: (data: {
    direction?: 'vision' | 'hate';
    comment?: string;
    levers_completed?: string[];
    xp_gained?: number;
  }) => Promise<void>;
  submitDirectionCheck: (
    direction: 'vision' | 'hate',
    comment: string
  ) => Promise<void>;
}

export function useDailyLog(userId: string): UseDailyLogReturn {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLog = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getDailyLog(userId);
    setLog(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  const save = useCallback(
    async (data: {
      direction?: 'vision' | 'hate';
      comment?: string;
      levers_completed?: string[];
      xp_gained?: number;
    }) => {
      const updated = await saveDailyLogService(userId, data);
      setLog(updated);
    },
    [userId]
  );

  const submitDirectionCheck = useCallback(
    async (direction: 'vision' | 'hate', comment: string) => {
      const existingLog = await getDailyLog(userId);
      const xpGain = direction === 'vision' ? 50 : 0;

      if (existingLog) {
        await saveDailyLogService(userId, {
          direction,
          comment,
          xp_gained: (existingLog.xp_gained || 0) + xpGain,
        });
      } else {
        await saveDailyLogService(userId, {
          direction,
          comment,
          xp_gained: xpGain,
          levers_completed: [],
        });
      }

      if (direction === 'vision') {
        await updateUserXP(userId, xpGain);
        await updateUserStreak(userId, 1);
        celebrateQuestComplete();
      }

      await loadLog();
    },
    [userId, loadLog]
  );

  return {
    log,
    loading,
    save,
    submitDirectionCheck,
  };
}
