import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, Crown } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getTheme } from '@/constants/theme';
import { chatWithAI, generateGamePlan, GamePlanGenerationParams } from '@/services/ai';
import { BannerAd } from '@/components/BannerAd';
import { ChatMessage } from '@/types';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const { addGamePlan, addChatMessage, chatHistory, theme, canSendMessage, getRemainingMessages } = useApp();
  const { isPremium } = useSubscription();
  const colors = getTheme(theme);
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(
    chatHistory.length > 0
      ? chatHistory
      : [
          {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm here to help you think through your goals. What's on your mind?",
            timestamp: new Date().toISOString(),
          },
        ]
  );
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const messageAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!canSendMessage(isPremium)) {
      Alert.alert(
        'Daily Message Limit Reached',
        'You\'ve reached your daily limit of 15 messages. Upgrade to Premium for unlimited AI chat!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/subscription') }
        ]
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = newMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const aiResponse = await chatWithAI(conversationHistory);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      await addChatMessage(userMessage);
      await addChatMessage(assistantMessage);

      const shouldCreateGoal = 
        aiResponse.toLowerCase().includes('check it out on your goals page');

      if (shouldCreateGoal) {
        setTimeout(async () => {
          try {
            console.log('Creating game plan automatically...');

            const goalTitle = extractGoalTitle(conversationHistory);
            const goalDescription = extractGoalDescription(conversationHistory);
            const category = extractCategory(conversationHistory);

            const gamePlanParams: GamePlanGenerationParams = {
              goalTitle,
              goalDescription,
              category,
              conversationHistory,
            };

            const gamePlan = await generateGamePlan(gamePlanParams);
            await addGamePlan(gamePlan);

            console.log('Game plan created successfully, navigating to goals page in 6 seconds...');
            setTimeout(() => {
              console.log('Navigating to goals page now');
              router.push('/(tabs)');
            }, 6000);
          } catch (error) {
            console.error('Error creating game plan:', error);
            const errorMessage: ChatMessage = {
              id: (Date.now() + 3).toString(),
              role: 'assistant',
              content: 'I had trouble creating the game plan. Could you tell me a bit more about what you want to achieve?',
              timestamp: new Date().toISOString(),
            };
            setMessages([...updatedMessages, errorMessage]);
            await addChatMessage(errorMessage);
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Sorry, I had trouble processing that. Please try again!',
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    
    messages.forEach((message) => {
      if (!messageAnims[message.id]) {
        messageAnims[message.id] = new Animated.Value(0);
        Animated.timing(messageAnims[message.id], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [messages, messageAnims]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Sparkles color="#FFF" size={24} fill="#FFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Coach</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {isPremium ? 'Unlimited messages' : `${getRemainingMessages(isPremium)} messages left today`}
            </Text>
          </View>
          {!isPremium && (
            <Pressable
              style={[styles.upgradeButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Crown color="#FFF" size={16} />
            </Pressable>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const animValue = messageAnims[message.id] || new Animated.Value(1);
            return (
              <Animated.View
                key={message.id}
                style={{
                  opacity: animValue,
                  transform: [{
                    translateY: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                }}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? [styles.userBubble, { backgroundColor: colors.primary }]
                      : [styles.assistantBubble, { backgroundColor: colors.surface }],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: message.role === 'user' ? '#FFF' : colors.text },
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.surface }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type your message..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: colors.primary, opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send color="#FFF" size={20} />
          </Pressable>
        </View>
        {!isPremium && <BannerAd />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function extractGoalTitle(history: { role: string; content: string }[]): string {
  const userMessages = history.filter(m => m.role === 'user');
  if (userMessages.length > 0) {
    const firstMessage = userMessages[0].content;
    const sentences = firstMessage.split(/[.!?]/);
    return sentences[0].trim().slice(0, 60);
  }
  return 'My Goal';
}

function extractGoalDescription(history: { role: string; content: string }[]): string {
  const userMessages = history.filter(m => m.role === 'user');
  const description = userMessages.map(m => m.content).join(' ');
  return description.slice(0, 200);
}

function extractCategory(history: { role: string; content: string }[]): string {
  const allContent = history.map(m => m.content.toLowerCase()).join(' ');
  
  if (allContent.match(/\b(workout|exercise|fitness|gym|run|train|health)\b/)) return 'fitness';
  if (allContent.match(/\b(learn|study|practice|skill|education|course)\b/)) return 'learning';
  if (allContent.match(/\b(business|startup|launch|app|product|monetize)\b/)) return 'business';
  if (allContent.match(/\b(save|invest|money|debt|financial|budget)\b/)) return 'financial';
  if (allContent.match(/\b(write|paint|create|art|music|photography)\b/)) return 'creative';
  if (allContent.match(/\b(eat|diet|sleep|meditate|wellness|stress)\b/)) return 'lifestyle';
  
  return 'personal';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    gap: 14,
    borderBottomWidth: 1,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 2,
    opacity: 0.7,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end' as const,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: 'flex-start' as const,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
