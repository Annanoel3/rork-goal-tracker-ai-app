import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Goal, User, GamificationData, ChatMessage, ThemeMode, NotificationSettings, GamePlan, Step, StepStatus, MilestoneStatus, SubtaskStatus, ReminderConfig, CompletionType, ResourcePin } from '@/types';
import { calculateLevel, getPointsToNextLevel, POINTS_CONFIG } from '@/constants/gamification';
import { loadOpenAIKey } from '@/services/ai';

const STORAGE_KEYS = {
  USER: '@user',
  GOALS: '@goals',
  GAME_PLANS: '@game_plans',
  GAMIFICATION: '@gamification',
  CHAT_HISTORY: '@chat_history',
  THEME: '@theme',
  NOTIFICATIONS: '@notifications',
  HAS_ONBOARDED: '@has_onboarded',
  DAILY_CHAT_COUNT: '@daily_chat_count',
  LAST_CHAT_RESET_DATE: '@last_chat_reset_date',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);
  const [gamification, setGamification] = useState<GamificationData>({
    totalPoints: 0,
    level: 0,
    pointsToNextLevel: 100,
    dailyStreak: 0,
    lastActiveDate: '',
    achievements: [],
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    progressUpdates: true,
    reminders: true,
    achievements: true,
    leaderboard: true,
  });
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyChatCount, setDailyChatCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      console.log('AppContext: Loading data...');
      
      loadOpenAIKey().then(loaded => {
        console.log('AppContext: OpenAI loaded:', loaded);
      }).catch(err => {
        console.error('AppContext: OpenAI load failed:', err);
      });
      
      const [
        storedUser,
        storedGoals,
        storedGamePlans,
        storedGamification,
        storedChatHistory,
        storedTheme,
        storedNotifications,
        storedOnboarded,
        storedDailyChatCount,
        storedLastChatResetDate,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.GAME_PLANS),
        AsyncStorage.getItem(STORAGE_KEYS.GAMIFICATION),
        AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHAT_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_CHAT_RESET_DATE),
      ]);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedGamePlans) setGamePlans(JSON.parse(storedGamePlans));
      if (storedGamification) setGamification(JSON.parse(storedGamification));
      if (storedChatHistory) setChatHistory(JSON.parse(storedChatHistory));
      if (storedTheme) setTheme(JSON.parse(storedTheme));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      if (storedOnboarded) setHasOnboarded(JSON.parse(storedOnboarded));
      
      const today = new Date().toDateString();
      if (storedLastChatResetDate) {
        const lastResetDate = JSON.parse(storedLastChatResetDate);
        if (lastResetDate !== today) {
          setDailyChatCount(0);
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHAT_COUNT, JSON.stringify(0));
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHAT_RESET_DATE, JSON.stringify(today));
        } else if (storedDailyChatCount) {
          setDailyChatCount(JSON.parse(storedDailyChatCount));
        }
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHAT_RESET_DATE, JSON.stringify(today));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createUser = async (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      level: 0,
      points: 0,
      isRankPublic: true,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    await addPoints(POINTS_CONFIG.PROFILE_SETUP);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  const addGoal = async (goal: Goal) => {
    const newGoals = [...goals, goal];
    setGoals(newGoals);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
    await addPoints(POINTS_CONFIG.CHAT_INTERACTION);
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    const newGoals = goals.map(g => g.id === goalId ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g);
    setGoals(newGoals);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
  };

  const deleteGoal = async (goalId: string) => {
    const newGoals = goals.filter(g => g.id !== goalId);
    setGoals(newGoals);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
  };

  const toggleStepCompletion = async (goalId: string, stepId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const step = goal.steps.find(s => s.id === stepId);
    if (!step) return;

    const wasCompleted = step.isCompleted;
    const updatedSteps = goal.steps.map(s =>
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    );

    const completedSteps = updatedSteps.filter(s => s.isCompleted).length;
    const progress = Math.round((completedSteps / updatedSteps.length) * 100);

    await updateGoal(goalId, { steps: updatedSteps, progress });

    if (!wasCompleted) {
      await addPoints(step.points);
    }

    if (progress === 100) {
      await addPoints(POINTS_CONFIG.COMPLETE_GOAL);
    }
  };

  const addPoints = useCallback(async (points: number) => {
    setGamification(prev => {
      const newTotalPoints = prev.totalPoints + points;
      const newLevel = calculateLevel(newTotalPoints);
      const pointsToNext = getPointsToNextLevel(newTotalPoints, newLevel);
      
      const newGamification: GamificationData = {
        ...prev,
        totalPoints: newTotalPoints,
        level: newLevel,
        pointsToNextLevel: pointsToNext,
      };

      AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(newGamification));
      
      return newGamification;
    });

    setUser(prev => {
      if (!prev) return prev;
      const newTotalPoints = prev.points + points;
      const newLevel = calculateLevel(newTotalPoints);
      const updatedUser = { ...prev, points: newTotalPoints, level: newLevel };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });

    return { leveledUp: true, newLevel: 0 };
  }, []);

  const addChatMessage = async (message: ChatMessage) => {
    const newHistory = [...chatHistory, message];
    setChatHistory(newHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(newHistory));
    
    if (message.role === 'user') {
      const newCount = dailyChatCount + 1;
      setDailyChatCount(newCount);
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHAT_COUNT, JSON.stringify(newCount));
    }
  };

  const canSendMessage = (isPremium: boolean): boolean => {
    if (isPremium) return true;
    return dailyChatCount < 15;
  };

  const getRemainingMessages = (isPremium: boolean): number => {
    if (isPremium) return -1;
    return Math.max(0, 15 - dailyChatCount);
  };

  const clearChatHistory = async () => {
    setChatHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  };

  const updateTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(newTheme));
  };

  const updateNotifications = async (newNotifications: NotificationSettings) => {
    setNotifications(newNotifications);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
  };

  const completeOnboarding = async () => {
    setHasOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(true));
  };

  const addGamePlan = useCallback(async (gamePlan: GamePlan) => {
    console.log('🎯 Adding game plan:', gamePlan.goalTitle);
    console.log('📋 Game plan structure:', {
      goalId: gamePlan.goalId,
      milestones: gamePlan.milestones.length,
      status: gamePlan.status
    });
    
    try {
      const currentPlans = await AsyncStorage.getItem(STORAGE_KEYS.GAME_PLANS);
      const existingPlans = currentPlans ? JSON.parse(currentPlans) : [];
      console.log('📦 Current plans in storage:', existingPlans.length);
      
      const newGamePlans = [...existingPlans, gamePlan];
      console.log('📦 New plans count:', newGamePlans.length);
      
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_PLANS, JSON.stringify(newGamePlans));
      console.log('✅ Game plans saved to AsyncStorage');
      
      setGamePlans(newGamePlans);
      console.log('✅ State updated');
      
      const verification = await AsyncStorage.getItem(STORAGE_KEYS.GAME_PLANS);
      const verifiedPlans = verification ? JSON.parse(verification) : [];
      console.log('🔍 Verification - stored game plans:', verifiedPlans.length);
      console.log('🔍 Verification - goal titles:', verifiedPlans.map((gp: GamePlan) => gp.goalTitle));
      
      if (verifiedPlans.length !== newGamePlans.length) {
        console.error('⚠️ Save verification failed! Expected:', newGamePlans.length, 'Got:', verifiedPlans.length);
        return false;
      }
      
      await addPoints(POINTS_CONFIG.CHAT_INTERACTION);
      console.log('✅ Points added');
      
      return true;
    } catch (error) {
      console.error('❌ Error adding game plan:', error);
      console.error('❌ Error stack:', (error as Error).stack);
      return false;
    }
  }, [addPoints]);

  const updateGamePlan = useCallback(async (goalId: string, updates: Partial<GamePlan>) => {
    console.log('Updating game plan:', goalId);
    const newGamePlans = gamePlans.map(gp => 
      gp.goalId === goalId ? { ...gp, ...updates, updatedAt: new Date().toISOString() } : gp
    );
    setGamePlans(newGamePlans);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_PLANS, JSON.stringify(newGamePlans));
  }, [gamePlans]);

  const getNextAction = (goalId: string): Step | null => {
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan || gamePlan.status === 'paused' || gamePlan.status === 'archived') return null;

    const activeMilestone = gamePlan.milestones.find(m => m.status === 'active');
    if (!activeMilestone) return null;

    const nextStep = activeMilestone.steps.find(s => 
      s.isRequired && (s.status === 'not_started' || s.status === 'in_progress')
    );
    return nextStep || null;
  };

  const completeStep = async (goalId: string, milestoneId: string, stepId: string, completionType: CompletionType = 'standard', effortMinutes?: number) => {
    console.log('Completing step:', stepId, 'type:', completionType);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const milestone = gamePlan.milestones.find(m => m.milestoneId === milestoneId);
    if (!milestone) return;

    const step = milestone.steps.find(s => s.stepId === stepId);
    if (!step) return;

    const now = new Date().toISOString();
    const effortLog = effortMinutes ? {
      logId: `${stepId}-log-${Date.now()}`,
      date: now,
      effortMinutes,
      completionType
    } : undefined;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      
      const updatedSteps = m.steps.map(s => {
        if (s.stepId !== stepId) return s;
        return {
          ...s,
          status: 'completed' as StepStatus,
          completedAt: now,
          completionType,
          effortLogs: effortLog ? [...(s.effortLogs || []), effortLog] : s.effortLogs
        };
      });

      const allRequiredComplete = updatedSteps
        .filter(s => s.isRequired)
        .every(s => s.status === 'completed' || s.status === 'skipped');

      if (allRequiredComplete && m.status === 'active') {
        return { 
          ...m, 
          steps: updatedSteps, 
          status: 'completed' as MilestoneStatus,
          completedAt: now
        };
      }

      return { ...m, steps: updatedSteps };
    });

    const justCompletedMilestone = updatedMilestones.find(
      m => m.milestoneId === milestoneId && m.status === 'completed'
    );

    if (justCompletedMilestone) {
      const currentIndex = justCompletedMilestone.orderIndex;
      const nextMilestone = updatedMilestones.find(
        m => m.orderIndex === currentIndex + 1 && m.status === 'locked'
      );

      if (nextMilestone) {
        updatedMilestones.forEach(m => {
          if (m.milestoneId === nextMilestone.milestoneId) {
            m.status = 'active';
          }
        });
      } else if (justCompletedMilestone.isFinal) {
        await updateGamePlan(goalId, {
          milestones: updatedMilestones,
          status: gamePlan.openEnded ? 'active' : 'completed',
          lastInteractionDate: now
        });
        await addPoints(POINTS_CONFIG.COMPLETE_GOAL);
        return;
      }
    }

    await updateGamePlan(goalId, { 
      milestones: updatedMilestones,
      lastInteractionDate: now
    });
    await addPoints(10);
  };

  const skipStep = async (goalId: string, milestoneId: string, stepId: string) => {
    console.log('Skipping step:', stepId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const now = new Date().toISOString();
    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;

      const updatedSteps = m.steps.map(s => {
        if (s.stepId !== stepId) return s;
        return {
          ...s,
          status: 'skipped' as StepStatus,
          skippedCount: (s.skippedCount || 0) + 1,
          lastSkipped: now
        };
      });

      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { 
      milestones: updatedMilestones,
      lastInteractionDate: now
    });
  };

  const completeSubtask = async (
    goalId: string,
    milestoneId: string,
    stepId: string,
    subtaskId: string
  ) => {
    console.log('Completing subtask:', subtaskId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;

      const updatedSteps = m.steps.map(s => {
        if (s.stepId !== stepId) return s;

        const updatedSubtasks = s.subtasks.map(st => 
          st.subtaskId === subtaskId
            ? { ...st, status: (st.status === 'completed' ? 'not_started' : 'completed') as SubtaskStatus }
            : st
        );

        return { ...s, subtasks: updatedSubtasks };
      });

      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
    await addPoints(5);
  };

  const pauseGamePlan = async (goalId: string) => {
    console.log('Pausing game plan:', goalId);
    await updateGamePlan(goalId, { status: 'paused' });
  };

  const resumeGamePlan = async (goalId: string) => {
    console.log('Resuming game plan:', goalId);
    await updateGamePlan(goalId, { status: 'active' });
  };

  const archiveGamePlan = async (goalId: string) => {
    console.log('Archiving game plan:', goalId);
    await updateGamePlan(goalId, { status: 'archived' });
  };

  const updateStepTitle = async (goalId: string, milestoneId: string, stepId: string, title: string) => {
    console.log('Updating step title:', stepId, title);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => 
        s.stepId === stepId ? { ...s, title } : s
      );
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const updateStepDetails = async (goalId: string, milestoneId: string, stepId: string, details: string) => {
    console.log('Updating step details:', stepId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => 
        s.stepId === stepId ? { ...s, details } : s
      );
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const toggleStepRequired = async (goalId: string, milestoneId: string, stepId: string) => {
    console.log('Toggling step required:', stepId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => 
        s.stepId === stepId ? { ...s, isRequired: !s.isRequired } : s
      );
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const updateSubtaskTitle = async (
    goalId: string,
    milestoneId: string,
    stepId: string,
    subtaskId: string,
    title: string
  ) => {
    console.log('Updating subtask title:', subtaskId, title);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => {
        if (s.stepId !== stepId) return s;
        const updatedSubtasks = s.subtasks.map(st =>
          st.subtaskId === subtaskId ? { ...st, title } : st
        );
        return { ...s, subtasks: updatedSubtasks };
      });
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const addSubtask = async (
    goalId: string,
    milestoneId: string,
    stepId: string,
    title: string
  ) => {
    console.log('Adding subtask:', title);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => {
        if (s.stepId !== stepId) return s;
        const newSubtask = {
          subtaskId: `${stepId}-st${Date.now()}`,
          title,
          status: 'not_started' as SubtaskStatus,
        };
        return { ...s, subtasks: [...s.subtasks, newSubtask] };
      });
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const deleteSubtask = async (
    goalId: string,
    milestoneId: string,
    stepId: string,
    subtaskId: string
  ) => {
    console.log('Deleting subtask:', subtaskId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => {
        if (s.stepId !== stepId) return s;
        return { ...s, subtasks: s.subtasks.filter(st => st.subtaskId !== subtaskId) };
      });
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const updateStepReminders = async (
    goalId: string,
    milestoneId: string,
    stepId: string,
    reminders: ReminderConfig
  ) => {
    console.log('Updating step reminders:', stepId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const now = new Date().toISOString();
    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      const updatedSteps = m.steps.map(s => 
        s.stepId === stepId ? { 
          ...s, 
          reminders: {
            ...reminders,
            lastAdjusted: now
          }
        } : s
      );
      return { ...m, steps: updatedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const reorderSteps = async (
    goalId: string,
    milestoneId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    console.log('Reordering steps:', fromIndex, toIndex);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const updatedMilestones = gamePlan.milestones.map(m => {
      if (m.milestoneId !== milestoneId) return m;
      
      const steps = [...m.steps];
      const [removed] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, removed);
      
      const reorderedSteps = steps.map((s, index) => ({ ...s, orderIndex: index }));
      return { ...m, steps: reorderedSteps };
    });

    await updateGamePlan(goalId, { milestones: updatedMilestones });
  };

  const completeFallbackAction = async (goalId: string, milestoneId: string, stepId: string, effortMinutes?: number) => {
    console.log('Completing fallback action:', stepId);
    await completeStep(goalId, milestoneId, stepId, 'fallback', effortMinutes);
  };

  const restartGoal = async (goalId: string, makeEasier: boolean = false) => {
    console.log('Restarting goal:', goalId, 'makeEasier:', makeEasier);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const now = new Date().toISOString();
    const updatedMilestones = gamePlan.milestones.map((m, index) => {
      const resetSteps = m.steps.map(s => ({
        ...s,
        status: 'not_started' as StepStatus,
        completedAt: undefined,
        completionType: undefined
      }));

      return {
        ...m,
        steps: resetSteps,
        status: (index === 0 ? 'active' : 'locked') as MilestoneStatus,
        completedAt: undefined
      };
    });

    await updateGamePlan(goalId, {
      status: 'active',
      milestones: updatedMilestones,
      lastInteractionDate: now,
      dormantSince: undefined,
      restartCount: (gamePlan.restartCount || 0) + 1
    });
  };

  const addResourcePin = async (goalId: string, pin: Omit<ResourcePin, 'pinId' | 'createdAt'>) => {
    console.log('Adding resource pin:', pin.title);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    const newPin: ResourcePin = {
      ...pin,
      pinId: `${goalId}-pin-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    await updateGamePlan(goalId, {
      resourcePins: [...(gamePlan.resourcePins || []), newPin]
    });
  };

  const removeResourcePin = async (goalId: string, pinId: string) => {
    console.log('Removing resource pin:', pinId);
    const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
    if (!gamePlan) return;

    await updateGamePlan(goalId, {
      resourcePins: (gamePlan.resourcePins || []).filter(p => p.pinId !== pinId)
    });
  };

  const detectDormantGoals = useCallback(async () => {
    if (isLoading) return;
    
    const now = new Date();
    const DORMANT_THRESHOLD_DAYS = 7;
    let hasUpdates = false;
    const updates: { goalId: string; dormantSince: string }[] = [];

    for (const gp of gamePlans) {
      if (gp.status !== 'active' || gp.dormantSince) continue;

      const lastInteraction = gp.lastInteractionDate ? new Date(gp.lastInteractionDate) : new Date(gp.createdAt);
      const daysSinceInteraction = Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceInteraction >= DORMANT_THRESHOLD_DAYS) {
        console.log('Goal became dormant:', gp.goalTitle);
        updates.push({ goalId: gp.goalId, dormantSince: now.toISOString() });
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      const newGamePlans = gamePlans.map(gp => {
        const update = updates.find(u => u.goalId === gp.goalId);
        if (update) {
          return { ...gp, dormantSince: update.dormantSince };
        }
        return gp;
      });
      setGamePlans(newGamePlans);
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_PLANS, JSON.stringify(newGamePlans));
    }
  }, [gamePlans, isLoading]);

  const dormantCheckRef = useRef(false);
  useEffect(() => {
    if (dormantCheckRef.current || isLoading) return;
    dormantCheckRef.current = true;
    const timer = setTimeout(() => {
      detectDormantGoals();
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading, detectDormantGoals]);

  return {
    user,
    goals,
    gamePlans,
    gamification,
    chatHistory,
    theme,
    notifications,
    hasOnboarded,
    isLoading,
    dailyChatCount,
    canSendMessage,
    getRemainingMessages,
    createUser,
    updateUser,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleStepCompletion,
    addGamePlan,
    updateGamePlan,
    getNextAction,
    completeStep,
    skipStep,
    completeSubtask,
    pauseGamePlan,
    resumeGamePlan,
    archiveGamePlan,
    updateStepTitle,
    updateStepDetails,
    toggleStepRequired,
    updateSubtaskTitle,
    addSubtask,
    deleteSubtask,
    updateStepReminders,
    reorderSteps,
    completeFallbackAction,
    restartGoal,
    addResourcePin,
    removeResourcePin,
    addPoints,
    addChatMessage,
    clearChatHistory,
    updateTheme,
    updateNotifications,
    completeOnboarding,
  };
});
