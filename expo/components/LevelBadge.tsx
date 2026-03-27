import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { LEVEL_NAMES } from '@/constants/gamification';

interface LevelBadgeProps {
  level: number;
  points: number;
  size?: 'small' | 'medium' | 'large';
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, points, size = 'medium' }) => {
  const { theme } = useApp();
  const colors = getTheme(theme);

  const sizeMap = {
    small: { container: 50, text: 16, icon: 16 },
    medium: { container: 70, text: 22, icon: 20 },
    large: { container: 100, text: 32, icon: 28 },
  };

  const dimensions = sizeMap[size];
  const levelName = LEVEL_NAMES[level] || 'Beginner';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: dimensions.container,
            height: dimensions.container,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Zap color="#FFF" size={dimensions.icon} fill="#FFF" />
        <Text style={[styles.level, { fontSize: dimensions.text }]}>{level}</Text>
      </View>
      {size !== 'small' && (
        <>
          <Text style={[styles.levelName, { color: colors.text }]}>{levelName}</Text>
          <Text style={[styles.points, { color: colors.textSecondary }]}>{points.toLocaleString()} pts</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    gap: 4,
  },
  badge: {
    borderRadius: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  level: {
    color: '#FFF',
    fontWeight: '800' as const,
    position: 'absolute' as const,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  points: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
