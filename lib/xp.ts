import { XP_THRESHOLDS } from '@/types';

export function calculateLevel(totalXp: number): number {
  let level = 1;

  for (let lvl = 8; lvl >= 1; lvl--) {
    if (totalXp >= XP_THRESHOLDS[lvl]) {
      level = lvl;
      break;
    }
  }

  return level;
}

export function getXpForNextLevel(currentLevel: number): number {
  return XP_THRESHOLDS[currentLevel + 1] || XP_THRESHOLDS[8];
}

export function getXpProgress(totalXp: number, currentLevel: number): number {
  const currentThreshold = XP_THRESHOLDS[currentLevel];
  const nextThreshold = XP_THRESHOLDS[currentLevel + 1] || XP_THRESHOLDS[8];
  const xpInLevel = totalXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return (xpInLevel / xpNeeded) * 100;
}
