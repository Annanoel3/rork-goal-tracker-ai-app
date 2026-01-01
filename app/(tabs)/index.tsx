import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { GoalCard } from '@/components/GoalCard';
import { LevelBadge } from '@/components/LevelBadge';
import { LevelUpModal } from '@/components/LevelUpModal';

export default function GoalsScreen() {
  const router = useRouter();
  const { user, goals, gamification, hasOnboarded, isLoading, theme } = useApp();
  const colors = getTheme(theme);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpLevel] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!isLoading && !hasOnboarded) {
      router.replace('/onboarding');
    }
  }, [hasOnboarded, isLoading, router]);

  useEffect(() => {
    if (!isLoading && hasOnboarded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, hasOnboarded, fadeAnim, slideAnim]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const activeGoals = goals.filter(g => g.isActive);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hey, {user?.name || 'there'}! 👋
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Let&apos;s crush those goals today
            </Text>
          </View>
          {user && (
            <LevelBadge level={user.level} points={user.points} size="medium" />
          )}
        </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{activeGoals.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Goals</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {gamification.dailyStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {goals.reduce((sum, g) => sum + g.steps.filter(s => s.isCompleted).length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
        </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Goals</Text>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.addButtonText}>Add Goal</Text>
            </Pressable>
          </View>

          {activeGoals.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Sparkles color={colors.primary} size={48} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No goals yet!</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Chat with our AI coach to create your first goal
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <Text style={styles.emptyButtonText}>Start Chat</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.goalsGrid}>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => router.push(`/goal/${goal.id}` as any)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <LevelUpModal
        visible={showLevelUpModal}
        level={levelUpLevel}
        onClose={() => setShowLevelUpModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500' as const,
    marginTop: 6,
    opacity: 0.8,
  },
  statsCard: {
    flexDirection: 'row' as const,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    opacity: 0.7,
  },
  divider: {
    width: 1,
    height: '100%',
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  goalsGrid: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center' as const,
    padding: 48,
    borderRadius: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center' as const,
    lineHeight: 24,
    opacity: 0.8,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
