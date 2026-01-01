import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings2, Palette, Bell, Key, FileText, Shield, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { ThemeMode } from '@/types';
import { initializeOpenAI, isOpenAIInitialized } from '@/services/ai';
import { LevelBadge } from '@/components/LevelBadge';

export default function SettingsScreen() {
  const { user, theme, updateTheme, notifications, updateNotifications } = useApp();
  const colors = getTheme(theme);
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(isOpenAIInitialized());

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid OpenAI API key');
      return;
    }
    
    try {
      await initializeOpenAI(apiKey);
      setApiKeyConfigured(true);
      setShowApiKey(false);
      setApiKey('');
      Alert.alert('Success', 'OpenAI API key saved successfully!');
    } catch {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    await updateTheme(newTheme);
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    await updateNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Settings2 color="#FFF" size={32} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {user && (
          <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <LevelBadge level={user.level} points={user.points} size="medium" />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Palette color={colors.primary} size={22} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
              </View>
            </View>
            <View style={styles.themeOptions}>
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme === 'light' ? colors.primary : colors.surface,
                    borderColor: theme === 'light' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Text style={[styles.themeOptionText, { color: theme === 'light' ? '#FFF' : colors.text }]}>
                  Light
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme === 'dark' ? colors.primary : colors.surface,
                    borderColor: theme === 'dark' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={[styles.themeOptionText, { color: theme === 'dark' ? '#FFF' : colors.text }]}>
                  Dark
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme === 'colorful' ? colors.primary : colors.surface,
                    borderColor: theme === 'colorful' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleThemeChange('colorful')}
              >
                <Text style={[styles.themeOptionText, { color: theme === 'colorful' ? '#FFF' : colors.text }]}>
                  Colorful
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell color={colors.primary} size={22} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Progress Updates</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Get notified about your progress
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.progressUpdates}
                onValueChange={() => handleNotificationToggle('progressUpdates')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell color={colors.primary} size={22} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Reminders</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Recurring reminders for your goals
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.reminders}
                onValueChange={() => handleNotificationToggle('reminders')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell color={colors.primary} size={22} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Achievements</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Celebrate your milestones
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.achievements}
                onValueChange={() => handleNotificationToggle('achievements')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>OpenAI Configuration</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {!showApiKey && (
              <Pressable style={styles.settingRow} onPress={() => setShowApiKey(true)}>
                <View style={styles.settingLeft}>
                  <Key color={colors.primary} size={22} />
                  <View style={styles.flex1}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>OpenAI API Key</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      {apiKeyConfigured ? 'Configured ✓' : 'Required for AI features'}
                    </Text>
                  </View>
                </View>
                <ChevronRight color={colors.textTertiary} size={20} />
              </Pressable>
            )}
            {showApiKey && (
              <View style={styles.apiKeyInput}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  placeholder="sk-..."
                  placeholderTextColor={colors.textTertiary}
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.apiKeyButtons}>
                  <Pressable
                    style={[styles.button, styles.buttonSecondary, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowApiKey(false);
                      setApiKey('');
                    }}
                  >
                    <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleSaveApiKey}
                  >
                    <Text style={[styles.buttonText, { color: '#FFF' }]}>Save</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Pressable
              style={styles.settingRow}
              onPress={() => openLink('https://example.com/privacy')}
            >
              <View style={styles.settingLeft}>
                <Shield color={colors.primary} size={22} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
              </View>
              <ChevronRight color={colors.textTertiary} size={20} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              style={styles.settingRow}
              onPress={() => openLink('https://example.com/terms')}
            >
              <View style={styles.settingLeft}>
                <FileText color={colors.primary} size={22} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Terms & Conditions</Text>
              </View>
              <ChevronRight color={colors.textTertiary} size={20} />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.version, { color: colors.textTertiary }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center' as const,
    gap: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginTop: 8,
  },
  profileCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  settingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    gap: 12,
  },
  settingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  themeOptions: {
    flexDirection: 'row' as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  apiKeyInput: {
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  apiKeyButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  flex1: {
    flex: 1,
  },
  version: {
    fontSize: 13,
    textAlign: 'center' as const,
    marginTop: 8,
  },
});
