'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  CharacterSheet,
  DailyLever,
  BossFight,
  DailyLog,
} from '@/types';
import { loadDashboardData } from '@/lib/database';

interface UseUserDataReturn {
  user: User | null;
  sheet: CharacterSheet | null;
  levers: DailyLever[];
  activeBoss: BossFight | null;
  todayLog: DailyLog | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserData(userId: string): UseUserDataReturn {
  const [user, setUser] = useState<User | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [levers, setLevers] = useState<DailyLever[]>([]);
  const [activeBoss, setActiveBoss] = useState<BossFight | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await loadDashboardData(userId);
      setUser(data.user);
      setSheet(data.sheet);
      setLevers(data.levers);
      setActiveBoss(data.activeBoss);
      setTodayLog(data.todayLog);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    user,
    sheet,
    levers,
    activeBoss,
    todayLog,
    loading,
    error,
    refetch,
  };
}
