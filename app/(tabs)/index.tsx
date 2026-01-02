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
import { Plus, Sparkles, MessageCircle, Play } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { LevelBadge } from '@/components/LevelBadge';
import { LevelUpModal } from '@/components/LevelUpModal';
import { BannerAd } from '@/components/BannerAd';

export default function GoalsScreen() {
  const router = useRouter();
  const { user, goals, gamePlans, gamification, hasOnboarded, isLoading, theme, getNextAction } = useApp();
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

  const activeGamePlans = gamePlans.filter(gp => gp.status === 'active' || gp.status === 'paused');

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
            <Text style={[styles.statValue, { color: colors.primary }]}>{activeGamePlans.length}</Text>
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

          {activeGamePlans.length === 0 ? (
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
              {activeGamePlans.map((gamePlan) => {
                const nextAction = getNextAction(gamePlan.goalId);
                const activeMilestone = gamePlan.milestones.find(m => m.status === 'active');
                const isPaused = gamePlan.status === 'paused';

                return (
                  <View key={gamePlan.goalId} style={[styles.goalCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <Pressable
                      style={styles.goalCardHeader}
                      onPress={() => router.push(`/game-plan/${gamePlan.goalId}` as any)}
                    >
                      <View style={styles.goalCardTop}>
                        <Text style={[styles.goalCardTitle, { color: colors.text }]}>
                          {gamePlan.goalTitle}
                        </Text>
                        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.categoryText, { color: colors.primary }]}>
                            {gamePlan.category}
                          </Text>
                        </View>
                      </View>
                      {activeMilestone && (
                        <Text style={[styles.milestoneText, { color: colors.textSecondary }]}>
                          📍 {activeMilestone.title}
                        </Text>
                      )}
                    </Pressable>

                    {isPaused ? (
                      <View style={[styles.pausedCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.pausedCardText, { color: colors.textSecondary }]}>Goal paused</Text>
                        <Pressable
                          style={[styles.viewButton, { backgroundColor: colors.primary }]}
                          onPress={() => router.push(`/game-plan/${gamePlan.goalId}` as any)}
                        >
                          <Text style={styles.viewButtonText}>Resume</Text>
                        </Pressable>
                      </View>
                    ) : nextAction ? (
                      <View style={styles.nextActionCard}>
                        <Text style={[styles.nextActionLabel, { color: colors.textSecondary }]}>Next Action</Text>
                        <Text style={[styles.nextActionTitle, { color: colors.text }]}>
                          {nextAction.title}
                        </Text>
                        <View style={styles.actionButtons}>
                          <Pressable
                            style={[styles.actionButton, { backgroundColor: colors.success }]}
                            onPress={() => router.push(`/game-plan/${gamePlan.goalId}` as any)}
                          >
                            <Play color="#FFF" size={16} />
                            <Text style={styles.actionButtonText}>Do It</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.helpButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => router.push('/(tabs)/chat')}
                          >
                            <MessageCircle color={colors.text} size={16} />
                            <Text style={[styles.helpButtonText, { color: colors.text }]}>Need Help?</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.completedCard, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.completedText, { color: colors.success }]}>All caught up! 🎉</Text>
                        <Pressable
                          style={[styles.viewButton, { backgroundColor: colors.primary }]}
                          onPress={() => router.push(`/game-plan/${gamePlan.goalId}` as any)}
                        >
                          <Text style={styles.viewButtonText}>View Plan</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <BannerAd />

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
  goalCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalCardHeader: {
    padding: 20,
    gap: 8,
  },
  goalCardTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  goalCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  nextActionCard: {
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  nextActionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  nextActionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  pausedCard: {
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  pausedCardText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  completedCard: {
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  completedText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600' as const,
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
