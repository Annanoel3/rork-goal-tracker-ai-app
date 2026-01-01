export const POINTS_CONFIG = {
  COMPLETE_STEP: 10,
  DAILY_CHECKIN: 5,
  COMPLETE_GOAL: 100,
  STREAK_BONUS: 5,
  CHAT_INTERACTION: 2,
  PROFILE_SETUP: 20,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
  20000, 26000, 33000, 41000, 50000
];

export const calculateLevel = (points: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i;
    }
  }
  return 0;
};

export const getPointsToNextLevel = (currentPoints: number, currentLevel: number): number => {
  const nextLevel = currentLevel + 1;
  if (nextLevel >= LEVEL_THRESHOLDS.length) {
    return 0;
  }
  return LEVEL_THRESHOLDS[nextLevel] - currentPoints;
};

export const LEVEL_NAMES = [
  'Beginner',
  'Novice',
  'Apprentice',
  'Skilled',
  'Advanced',
  'Expert',
  'Master',
  'Elite',
  'Champion',
  'Legend',
  'Mythic',
  'Immortal',
  'Transcendent',
  'Celestial',
  'Divine',
  'Eternal',
];
