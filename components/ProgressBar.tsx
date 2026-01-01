import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = true, height = 8 }) => {
  const { theme } = useApp();
  const colors = getTheme(theme);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.surface, height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: colors.primary,
              height,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    minWidth: 40,
    textAlign: 'right' as const,
  },
});
