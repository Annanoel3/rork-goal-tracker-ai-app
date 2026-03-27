import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { LEVEL_NAMES } from '@/constants/gamification';

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, level, onClose }) => {
  const { theme } = useApp();
  const colors = getTheme(theme);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start();

      setTimeout(() => {
        handleClose();
      }, 3000);
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible, scaleAnim, rotateAnim, handleClose]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const levelName = LEVEL_NAMES[level] || 'Beginner';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: colors.cardBackground,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.iconContainer, { transform: [{ rotate }] }]}>
            <Sparkles color={colors.accent} size={60} fill={colors.accent} />
          </Animated.View>
          <Text style={[styles.title, { color: colors.text }]}>Level Up!</Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
          <Text style={[styles.levelName, { color: colors.primary }]}>{levelName}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Keep crushing your goals! 🎉
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center' as const,
    gap: 16,
    width: Dimensions.get('window').width - 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  levelText: {
    fontSize: 40,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  levelName: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  message: {
    fontSize: 16,
    textAlign: 'center' as const,
  },
});
