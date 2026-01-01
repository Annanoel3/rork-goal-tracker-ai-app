import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';

export const BannerAd: React.FC = () => {
  const { isPremium, isLoading } = useSubscription();
  const { theme } = useApp();
  const colors = getTheme(theme);

  if (isPremium || isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <Text style={[styles.adLabel, { color: colors.textTertiary }]}>Advertisement</Text>
      <View style={[styles.adContent, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.adText, { color: colors.textSecondary }]}>
          🎯 Remove ads by upgrading to Premium
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  adLabel: {
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  adContent: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center' as const,
  },
  adText: {
    fontSize: 13,
    textAlign: 'center' as const,
  },
});
