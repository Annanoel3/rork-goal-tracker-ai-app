import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Crown, Check, Sparkles, Zap, Shield } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubscriptionScreen() {
  const { theme } = useApp();
  const { isPremium, offerings, purchasePackage, restorePurchases, isPurchasing, isRestoring, isConfigured } = useSubscription();
  const colors = getTheme(theme);
  const [selectedPackage, setSelectedPackage] = useState<string>('monthly');

  if (!theme) {
    return null;
  }

  const handlePurchase = async () => {
    if (!offerings) {
      Alert.alert('Error', 'No subscription plans available');
      return;
    }

    const pkg = offerings.availablePackages.find(p => p.identifier === selectedPackage);
    if (!pkg) {
      Alert.alert('Error', 'Selected plan not found');
      return;
    }

    const success = await purchasePackage(pkg);
    if (success) {
      Alert.alert('Success', 'Welcome to Premium! 🎉');
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert('Success', 'Purchases restored successfully!');
    } else {
      Alert.alert('Info', 'No purchases to restore');
    }
  };

  const features = [
    { icon: Sparkles, title: 'No Ads', description: 'Enjoy the app without any interruptions' },
    { icon: Crown, title: 'Unlimited Goals', description: 'Create as many goals as you want' },
    { icon: Zap, title: 'Unlimited AI Chat', description: 'Get unlimited personalized guidance and support' },
    { icon: Shield, title: 'Weekly Analytics', description: 'Track completion times and progress insights' },
    { icon: Shield, title: 'Priority Support', description: 'Get help when you need it most' },
  ];

  if (isPremium) {
    return (
      <>
        <Stack.Screen options={{ title: 'Premium Subscription' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumBadge}
            >
              <Crown color="#FFF" size={48} />
              <Text style={[styles.premiumTitle, { color: colors.text }]}>You&apos;re Premium! 👑</Text>
              <Text style={styles.premiumSubtitle}>Enjoying all premium features</Text>
            </LinearGradient>

            <View style={styles.featuresSection}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View key={index} style={[styles.featureCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <Icon color={colors.primary} size={24} />
                    <View style={styles.featureContent}>
                      <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                        {feature.description}
                      </Text>
                    </View>
                    <Check color={colors.success} size={20} />
                  </View>
                );
              })}
            </View>

            <Pressable
              style={[styles.restoreButton, { borderColor: colors.border }]}
              onPress={handleRestore}
              disabled={isRestoring}
            >
              <Text style={[styles.restoreButtonText, { color: colors.textSecondary }]}>
                {isRestoring ? 'Restoring...' : 'Restore Purchases'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Upgrade to Premium' }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Crown color="#FFF" size={40} />
            </LinearGradient>
            <Text style={[styles.title, { color: colors.text }]}>Unlock Premium</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Remove ads and access exclusive features
            </Text>
          </View>

          <View style={styles.featuresSection}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={[styles.featureCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Icon color={colors.primary} size={24} />
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {isConfigured && offerings && offerings.availablePackages.length > 0 ? (
            <View style={styles.packagesSection}>
              {offerings.availablePackages.map((pkg) => {
                const isSelected = pkg.identifier === selectedPackage;
                const isYearly = pkg.identifier === 'yearly' || pkg.identifier.includes('annual');
                
                return (
                  <Pressable
                    key={pkg.identifier}
                    style={[
                      styles.packageCard,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.cardBackground,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedPackage(pkg.identifier)}
                  >
                    {isYearly && (
                      <View style={styles.bestValueBadge}>
                        <Text style={styles.bestValueText}>BEST VALUE</Text>
                      </View>
                    )}
                    <Text style={[styles.packageTitle, { color: isSelected ? '#FFF' : colors.text }]}>
                      {pkg.product.title}
                    </Text>
                    <Text style={[styles.packagePrice, { color: isSelected ? '#FFF' : colors.text }]}>
                      {pkg.product.priceString}
                    </Text>
                    <Text style={[styles.packageDescription, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                      {pkg.product.description || (isYearly ? 'Save 50% with annual billing' : 'Billed monthly')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {!isConfigured ? 'Initializing...' : 'Loading plans...'}
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
            onPress={handlePurchase}
            disabled={isPurchasing || !offerings}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            )}
          </Pressable>

          <Pressable style={styles.restoreButton} onPress={handleRestore} disabled={isRestoring}>
            <Text style={[styles.restoreButtonText, { color: colors.textSecondary }]}>
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </Pressable>

          <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  featuresSection: {
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
  },
  packagesSection: {
    gap: 12,
    marginBottom: 24,
  },
  packageCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
  },
  subscribeButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  premiumBadge: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
});
