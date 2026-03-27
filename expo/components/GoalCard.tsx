import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, CheckCircle2 } from 'lucide-react-native';
import { Goal } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { ProgressBar } from './ProgressBar';
import { format } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const { theme } = useApp();
  const colors = getTheme(theme);

  const completedSteps = goal.steps.filter(s => s.isCompleted).length;
  const totalSteps = goal.steps.length;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {goal.title}
          </Text>
          <Text style={[styles.category, { color: colors.secondary }]}>
            {goal.category}
          </Text>
        </View>
        {goal.progress === 100 && (
          <CheckCircle2 color={colors.success} size={28} fill={colors.success} />
        )}
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {goal.description}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Calendar color={colors.textTertiary} size={16} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {format(new Date(goal.timeframe.end), 'MMM dd, yyyy')}
          </Text>
        </View>
        <Text style={[styles.stepsText, { color: colors.textTertiary }]}>
          {completedSteps}/{totalSteps} steps
        </Text>
      </View>

      <ProgressBar progress={goal.progress} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  category: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  stat: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  stepsText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
