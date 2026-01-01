import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Goal, User, GamificationData, ChatMessage, ThemeMode, NotificationSettings } from '@/types';
import { calculateLevel, getPointsToNextLevel, POINTS_CONFIG } from '@/constants/gamification';
import { loadOpenAIKey } from '@/services/ai';

const STORAGE_KEYS = {
  USER: '@user',
  GOALS: '@goals',
  GAMIFICATION: '@gamification',
  CHAT_HISTORY: '@chat_history',
  THEME: '@theme',
  NOTIFICATIONS: '@notifications',
  HAS_ONBOARDED: '@has_onboarded',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadOpenAIKey();
      
      const [
        storedUser,
        storedGoals,
        storedGamification,
        storedChatHistory,
        storedTheme,
        storedNotifications,
        storedOnboarded,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.GAMIFICATION),
        AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
      ]);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedGoals) setGoals(JSON.parse(storedGoals));
      if (storedGamification) setGamification(JSON.parse(storedGamification));
      if (storedChatHistory) setChatHistory(JSON.parse(storedChatHistory));
      if (storedTheme) setTheme(JSON.parse(storedTheme));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      if (storedOnboarded) setHasOnboarded(JSON.parse(storedOnboarded));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const addPoints = async (points: number) => {
    const newTotalPoints = gamification.totalPoints + points;
    const newLevel = calculateLevel(newTotalPoints);
    const pointsToNext = getPointsToNextLevel(newTotalPoints, newLevel);
    
    const leveledUp = newLevel > gamification.level;

    const newGamification: GamificationData = {
      ...gamification,
      totalPoints: newTotalPoints,
      level: newLevel,
      pointsToNextLevel: pointsToNext,
    };

    setGamification(newGamification);
    await AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(newGamification));

    if (user) {
      await updateUser({ points: newTotalPoints, level: newLevel });
    }

    return { leveledUp, newLevel };
  };

  const addChatMessage = async (message: ChatMessage) => {
    const newHistory = [...chatHistory, message];
    setChatHistory(newHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(newHistory));
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

  return {
    user,
    goals,
    gamification,
    chatHistory,
    theme,
    notifications,
    hasOnboarded,
    isLoading,
    createUser,
    updateUser,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleStepCompletion,
    addPoints,
    addChatMessage,
    clearChatHistory,
    updateTheme,
    updateNotifications,
    completeOnboarding,
  };
});
