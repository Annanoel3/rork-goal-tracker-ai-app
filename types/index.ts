export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  level: number;
  points: number;
  rank?: number;
  isRankPublic: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  timeframe: {
    start: string;
    end: string;
    duration: string;
  };
  steps: GoalStep[];
  progress: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  points: number;
  dueDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  goalId?: string;
}

export interface GamificationData {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  dailyStreak: number;
  lastActiveDate: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
  avatarUrl?: string;
  level: number;
}

export type ThemeMode = 'light' | 'dark' | 'colorful';

export interface NotificationSettings {
  progressUpdates: boolean;
  reminders: boolean;
  achievements: boolean;
  leaderboard: boolean;
}
