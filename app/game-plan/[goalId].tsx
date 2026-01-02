import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronDown, ChevronRight, Check, Lock, Circle, CheckCircle, Play, Pause, Archive, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { Milestone, Step } from '@/types';

export default function GamePlanScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const router = useRouter();
  const { gamePlans, theme, completeStep, skipStep, completeSubtask, pauseGamePlan, resumeGamePlan, archiveGamePlan } = useApp();
  const colors = getTheme(theme);

  const gamePlan = gamePlans.find(gp => gp.goalId === goalId);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(gamePlan?.milestones.filter(m => m.status === 'active').map(m => m.milestoneId) || [])
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (!gamePlan) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleCompleteStep = async (milestone: Milestone, step: Step) => {
    await completeStep(goalId, milestone.milestoneId, step.stepId);
  };

  const handleSkipStep = async (milestone: Milestone, step: Step) => {
    await skipStep(goalId, milestone.milestoneId, step.stepId);
  };

  const handleToggleSubtask = async (milestone: Milestone, step: Step, subtaskId: string) => {
    await completeSubtask(goalId, milestone.milestoneId, step.stepId, subtaskId);
  };

  const handlePause = async () => {
    await pauseGamePlan(goalId);
  };

  const handleResume = async () => {
    await resumeGamePlan(goalId);
  };

  const handleArchive = async () => {
    await archiveGamePlan(goalId);
    router.back();
  };

  const isCelebrating = gamePlan.status === 'completed';
  const finalMilestone = gamePlan.milestones.find(m => m.isFinal && m.status === 'completed');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Game Plan',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{gamePlan.goalTitle}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {gamePlan.goalDescription}
          </Text>
        </View>

        {gamePlan.status === 'paused' && (
          <View style={[styles.pausedBanner, { backgroundColor: colors.surface }]}>
            <Pause color={colors.textSecondary} size={20} />
            <Text style={[styles.pausedText, { color: colors.textSecondary }]}>
              This goal is paused
            </Text>
            <Pressable
              style={[styles.resumeButton, { backgroundColor: colors.primary }]}
              onPress={handleResume}
            >
              <Text style={styles.resumeButtonText}>Resume</Text>
            </Pressable>
          </View>
        )}

        {isCelebrating && (
          <View style={[styles.celebration, { backgroundColor: colors.success + '20' }]}>
            <Sparkles color={colors.success} size={48} />
            <Text style={[styles.celebrationTitle, { color: colors.success }]}>
              🎉 Goal {gamePlan.openEnded ? 'Milestone' : 'Completed'}! 🎉
            </Text>
            {finalMilestone && (
              <Text style={[styles.celebrationText, { color: colors.text }]}>
                Completed on {new Date(finalMilestone.completedAt!).toLocaleDateString()}
              </Text>
            )}
            <View style={styles.celebrationActions}>
              {gamePlan.openEnded && (
                <Pressable
                  style={[styles.celebrationButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/chat')}
                >
                  <Text style={styles.celebrationButtonText}>Expand Goal</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.celebrationButton, { backgroundColor: colors.accent }]}
                onPress={handleArchive}
              >
                <Text style={styles.celebrationButtonText}>Archive</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.timeline}>
          {gamePlan.milestones.map((milestone, index) => {
            const isExpanded = expandedMilestones.has(milestone.milestoneId);
            const isLocked = milestone.status === 'locked';
            const isCompleted = milestone.status === 'completed';
            const isActive = milestone.status === 'active';

            return (
              <View key={milestone.milestoneId} style={styles.milestoneContainer}>
                <View style={styles.milestoneRow}>
                  <View style={styles.timelineIndicator}>
                    {index > 0 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: isCompleted ? colors.success : colors.border },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.milestoneIcon,
                        {
                          backgroundColor: isCompleted
                            ? colors.success
                            : isActive
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {isLocked && <Lock color="#FFF" size={16} />}
                      {isActive && <Play color="#FFF" size={16} />}
                      {isCompleted && <Check color="#FFF" size={16} />}
                    </View>
                    {index < gamePlan.milestones.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: isCompleted ? colors.success : colors.border },
                        ]}
                      />
                    )}
                  </View>

                  <Pressable
                    style={[
                      styles.milestoneCard,
                      {
                        backgroundColor: isActive ? colors.cardBackground : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                        opacity: isLocked ? 0.6 : 1,
                      },
                    ]}
                    onPress={() => !isLocked && toggleMilestone(milestone.milestoneId)}
                    disabled={isLocked}
                  >
                    <View style={styles.milestoneHeader}>
                      <View style={styles.milestoneTitleRow}>
                        <Text
                          style={[
                            styles.milestoneTitle,
                            { color: isActive ? colors.primary : colors.text },
                          ]}
                        >
                          {milestone.title}
                        </Text>
                        {!isLocked && (
                          isExpanded ? (
                            <ChevronDown color={colors.textSecondary} size={20} />
                          ) : (
                            <ChevronRight color={colors.textSecondary} size={20} />
                          )
                        )}
                      </View>
                      {milestone.description && (
                        <Text style={[styles.milestoneDescription, { color: colors.textSecondary }]}>
                          {milestone.description}
                        </Text>
                      )}
                    </View>

                    {isExpanded && !isLocked && (
                      <View style={styles.stepsContainer}>
                        {milestone.steps.map((step) => {
                          const stepExpanded = expandedSteps.has(step.stepId) || step.requiresContext;
                          const hasSubtasks = step.subtasks.length > 0;

                          return (
                            <View key={step.stepId} style={styles.stepContainer}>
                              <View style={styles.stepRow}>
                                <View
                                  style={[
                                    styles.stepIcon,
                                    {
                                      backgroundColor:
                                        step.status === 'completed'
                                          ? colors.success
                                          : step.status === 'skipped'
                                          ? colors.textSecondary
                                          : colors.border,
                                    },
                                  ]}
                                >
                                  {step.status === 'completed' ? (
                                    <CheckCircle color="#FFF" size={16} />
                                  ) : (
                                    <Circle color="#FFF" size={16} />
                                  )}
                                </View>

                                <View style={styles.stepContent}>
                                  <Pressable
                                    onPress={() => hasSubtasks && toggleStep(step.stepId)}
                                    style={styles.stepTitleRow}
                                  >
                                    <Text
                                      style={[
                                        styles.stepTitle,
                                        {
                                          color:
                                            step.status === 'completed' || step.status === 'skipped'
                                              ? colors.textSecondary
                                              : colors.text,
                                          textDecorationLine:
                                            step.status === 'completed' || step.status === 'skipped'
                                              ? 'line-through'
                                              : 'none',
                                        },
                                      ]}
                                    >
                                      {step.title}
                                    </Text>
                                    {hasSubtasks && (
                                      stepExpanded ? (
                                        <ChevronDown color={colors.textSecondary} size={18} />
                                      ) : (
                                        <ChevronRight color={colors.textSecondary} size={18} />
                                      )
                                    )}
                                  </Pressable>

                                  {step.details && (
                                    <Text style={[styles.stepDetails, { color: colors.textSecondary }]}>
                                      {step.details}
                                    </Text>
                                  )}

                                  {stepExpanded && hasSubtasks && (
                                    <View style={styles.subtasksContainer}>
                                      {step.subtasks.map((subtask) => (
                                        <Pressable
                                          key={subtask.subtaskId}
                                          style={styles.subtaskRow}
                                          onPress={() => handleToggleSubtask(milestone, step, subtask.subtaskId)}
                                        >
                                          <View
                                            style={[
                                              styles.subtaskCheckbox,
                                              {
                                                backgroundColor:
                                                  subtask.status === 'completed'
                                                    ? colors.primary
                                                    : 'transparent',
                                                borderColor: colors.border,
                                              },
                                            ]}
                                          >
                                            {subtask.status === 'completed' && (
                                              <Check color="#FFF" size={12} />
                                            )}
                                          </View>
                                          <Text
                                            style={[
                                              styles.subtaskTitle,
                                              {
                                                color:
                                                  subtask.status === 'completed'
                                                    ? colors.textSecondary
                                                    : colors.text,
                                                textDecorationLine:
                                                  subtask.status === 'completed'
                                                    ? 'line-through'
                                                    : 'none',
                                              },
                                            ]}
                                          >
                                            {subtask.title}
                                          </Text>
                                        </Pressable>
                                      ))}
                                    </View>
                                  )}

                                  {step.status !== 'completed' && step.status !== 'skipped' && (
                                    <View style={styles.stepActions}>
                                      <Pressable
                                        style={[styles.stepButton, { backgroundColor: colors.success }]}
                                        onPress={() => handleCompleteStep(milestone, step)}
                                      >
                                        <Text style={styles.stepButtonText}>Complete</Text>
                                      </Pressable>
                                      {!step.isRequired && (
                                        <Pressable
                                          style={[
                                            styles.stepButton,
                                            { backgroundColor: colors.textSecondary },
                                          ]}
                                          onPress={() => handleSkipStep(milestone, step)}
                                        >
                                          <Text style={styles.stepButtonText}>Skip</Text>
                                        </Pressable>
                                      )}
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {gamePlan.status === 'active' && !isCelebrating && (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handlePause}
            >
              <Pause color={colors.text} size={20} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Pause Goal</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleArchive}
            >
              <Archive color={colors.text} size={20} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Archive</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
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
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  pausedBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  pausedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  resumeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resumeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  celebration: {
    alignItems: 'center' as const,
    padding: 32,
    borderRadius: 20,
    gap: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
  },
  celebrationText: {
    fontSize: 16,
    textAlign: 'center' as const,
  },
  celebrationActions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 8,
  },
  celebrationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  celebrationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  timeline: {
    gap: 16,
  },
  milestoneContainer: {
    position: 'relative' as const,
  },
  milestoneRow: {
    flexDirection: 'row' as const,
    gap: 16,
  },
  timelineIndicator: {
    alignItems: 'center' as const,
    width: 32,
  },
  timelineLine: {
    width: 2,
    flex: 1,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 4,
  },
  milestoneCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    gap: 12,
  },
  milestoneHeader: {
    gap: 8,
  },
  milestoneTitleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    flex: 1,
  },
  milestoneDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 12,
    marginTop: 8,
  },
  stepContainer: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    gap: 8,
  },
  stepTitleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  stepDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
  subtasksContainer: {
    gap: 8,
    marginTop: 4,
  },
  subtaskRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  subtaskTitle: {
    fontSize: 14,
    flex: 1,
  },
  stepActions: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 4,
  },
  stepButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stepButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
