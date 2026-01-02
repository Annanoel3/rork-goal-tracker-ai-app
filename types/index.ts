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
export type ReminderFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type CompletionType = 'standard' | 'effort_based' | 'fallback';

export interface Subtask {
  subtaskId: string;
  title: string;
  status: SubtaskStatus;
  isRequired?: boolean;
}

export interface ReminderConfig {
  enabled: boolean;
  frequency: ReminderFrequency;
  timeOfDay?: string;
  customDays?: number[];
  message?: string;
  snoozedCount?: number;
  lastSnoozed?: string;
  ignoredCount?: number;
  lastAdjusted?: string;
}

export interface FallbackAction {
  title: string;
  details?: string;
  effortMinutes?: number;
}

export interface StepEffortLog {
  logId: string;
  date: string;
  effortMinutes: number;
  completionType: CompletionType;
}

export interface Step {
  stepId: string;
  title: string;
  details?: string;
  orderIndex: number;
  status: StepStatus;
  isRequired: boolean;
  dueCadence?: string;
  reminders?: ReminderConfig;
  subtasks: Subtask[];
  requiresContext: boolean;
  skippedCount?: number;
  lastSkipped?: string;
  fallbackAction?: FallbackAction;
  allowEffortBased?: boolean;
  effortMinutesTarget?: number;
  effortLogs?: StepEffortLog[];
  completedAt?: string;
  completionType?: CompletionType;
}

export interface MilestoneEditHistory {
  editId: string;
  timestamp: string;
  changeType: 'title' | 'steps_added' | 'steps_removed' | 'steps_reordered' | 'restructured';
  summary: string;
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
  version: number;
  editHistory?: MilestoneEditHistory[];
  reopenedCount?: number;
}

export interface ResourcePin {
  pinId: string;
  type: 'link' | 'note' | 'contact' | 'file';
  title: string;
  content: string;
  url?: string;
  createdAt: string;
}

export interface GoalPattern {
  patternId: string;
  type: 'preferred_time' | 'step_size_preference' | 'energy_correlation' | 'consistency';
  insight: string;
  confidence: number;
  lastUpdated: string;
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
  lastInteractionDate?: string;
  dormantSince?: string;
  restartCount?: number;
  pauseCount?: number;
  resourcePins?: ResourcePin[];
  detectedPatterns?: GoalPattern[];
  energyTrackingEnabled?: boolean;
  adaptiveReminders?: boolean;
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
