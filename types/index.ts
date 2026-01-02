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

export type GamePlanStatus = 'active' | 'paused' | 'completed' | 'archived';
export type MilestoneStatus = 'locked' | 'active' | 'completed';
export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type SubtaskStatus = 'not_started' | 'completed';

export interface Subtask {
  subtaskId: string;
  title: string;
  status: SubtaskStatus;
}

export interface Step {
  stepId: string;
  title: string;
  details?: string;
  orderIndex: number;
  status: StepStatus;
  isRequired: boolean;
  dueCadence?: string;
  reminders?: string[];
  subtasks: Subtask[];
  requiresContext: boolean;
  skippedCount?: number;
}

export interface Milestone {
  milestoneId: string;
  title: string;
  description?: string;
  orderIndex: number;
  status: MilestoneStatus;
  steps: Step[];
  isFinal: boolean;
  completedAt?: string;
}

export interface GamePlan {
  goalId: string;
  goalTitle: string;
  goalDescription: string;
  createdAt: string;
  updatedAt: string;
  status: GamePlanStatus;
  openEnded: boolean;
  category: string;
  milestones: Milestone[];
  celebrationShown?: boolean;
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
