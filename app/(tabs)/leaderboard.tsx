import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Crown, Medal, Award, Lock } from 'lucide-react-native';
import { BannerAd } from '@/components/BannerAd';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { LevelBadge } from '@/components/LevelBadge';

export default function LeaderboardScreen() {
  const { user, updateUser, theme } = useApp();
  const colors = getTheme(theme);

  const mockLeaderboard = [
    { userId: '1', name: 'Alex Chen', points: 15420, rank: 1, level: 12 },
    { userId: '2', name: 'Sarah Johnson', points: 14890, rank: 2, level: 11 },
    { userId: '3', name: 'Mike Williams', points: 13250, rank: 3, level: 11 },
    { userId: '4', name: 'Emma Davis', points: 12100, rank: 4, level: 10 },
    { userId: '5', name: 'James Wilson', points: 11800, rank: 5, level: 10 },
    { userId: '6', name: 'Olivia Brown', points: 10950, rank: 6, level: 9 },
    { userId: '7', name: 'Daniel Martinez', points: 10200, rank: 7, level: 9 },
    { userId: '8', name: 'Sophia Garcia', points: 9800, rank: 8, level: 9 },
    { userId: '9', name: 'Liam Anderson', points: 9350, rank: 9, level: 8 },
    { userId: '10', name: 'Ava Taylor', points: 8900, rank: 10, level: 8 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown color="#FFD700" size={28} fill="#FFD700" />;
      case 2:
        return <Medal color="#C0C0C0" size={24} fill="#C0C0C0" />;
      case 3:
        return <Medal color="#CD7F32" size={24} fill="#CD7F32" />;
      default:
        return null;
    }
  };

  const handleTogglePrivacy = async () => {
    if (user) {
      await updateUser({ isRankPublic: !user.isRankPublic });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Trophy color="#FFF" size={32} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Top performers worldwide
          </Text>
        </View>

        <View style={[styles.prizeCard, { backgroundColor: colors.cardBackground, borderColor: colors.accent }]}>
          <Award color={colors.accent} size={32} />
          <Text style={[styles.prizeTitle, { color: colors.text }]}>Weekly Prize Pool</Text>
          <Text style={[styles.prizeSubtitle, { color: colors.accent }]}>Coming Soon! 🎉</Text>
          <Text style={[styles.prizeText, { color: colors.textSecondary }]}>
            Top 10 most consistent users will win prizes
          </Text>
        </View>

        <View style={[styles.privacyCard, { backgroundColor: colors.surface }]}>
          <View style={styles.privacyLeft}>
            <Lock color={colors.textSecondary} size={20} />
            <View style={styles.privacyText}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>Public Ranking</Text>
              <Text style={[styles.privacySubtitle, { color: colors.textSecondary }]}>
                Show my rank on leaderboard
              </Text>
            </View>
          </View>
          <Switch
            value={user?.isRankPublic ?? true}
            onValueChange={handleTogglePrivacy}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {user && user.isRankPublic && (
          <View style={[styles.userRankCard, { backgroundColor: colors.primary }]}>
            <View style={styles.userRankContent}>
              <Text style={styles.userRankLabel}>Your Rank</Text>
              <Text style={styles.userRankValue}>#{user.rank || '—'}</Text>
            </View>
            <View style={styles.userRankDivider} />
            <View style={styles.userRankContent}>
              <Text style={styles.userRankLabel}>Your Points</Text>
              <Text style={styles.userRankValue}>{user.points.toLocaleString()}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top 10 Leaders</Text>
          <View style={styles.leaderboardList}>
            {mockLeaderboard.map((entry) => (
              <View
                key={entry.userId}
                style={[
                  styles.leaderboardItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: entry.rank <= 3 ? colors.accent : colors.border,
                    borderWidth: entry.rank <= 3 ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.leaderboardLeft}>
                  <View style={[styles.rankBadge, { backgroundColor: entry.rank <= 3 ? colors.accent : colors.surface }]}>
                    {entry.rank <= 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <Text style={[styles.rankText, { color: colors.text }]}>#{entry.rank}</Text>
                    )}
                  </View>
                  <View style={styles.leaderboardInfo}>
                    <Text style={[styles.leaderboardName, { color: colors.text }]} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    <Text style={[styles.leaderboardPoints, { color: colors.textSecondary }]}>
                      {entry.points.toLocaleString()} pts
                    </Text>
                  </View>
                </View>
                <LevelBadge level={entry.level} points={entry.points} size="small" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <BannerAd />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    opacity: 0.8,
  },
  prizeCard: {
    alignItems: 'center' as const,
    padding: 32,
    borderRadius: 24,
    gap: 10,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  prizeTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  prizeSubtitle: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  prizeText: {
    fontSize: 15,
    textAlign: 'center' as const,
    opacity: 0.8,
  },
  privacyCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 18,
    borderRadius: 16,
  },
  privacyLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  privacySubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.8,
  },
  userRankCard: {
    flexDirection: 'row' as const,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  userRankContent: {
    flex: 1,
    alignItems: 'center' as const,
  },
  userRankDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  userRankLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '700' as const,
  },
  userRankValue: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '800' as const,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderboardLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  rankText: {
    fontSize: 17,
    fontWeight: '800' as const,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  leaderboardPoints: {
    fontSize: 15,
    marginTop: 3,
    opacity: 0.8,
  },
});
