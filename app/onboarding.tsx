import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Send, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getTheme } from '@/constants/theme';
import { chatWithAI, generateGoalFromConversation } from '@/services/ai';
import { ChatMessage } from '@/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const { createUser, addGoal, addChatMessage, completeOnboarding, theme, user } = useApp();
  const { setUserIdForNotifications } = useNotifications();
  const colors = getTheme(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI goal coach! 🎯 What's your name?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [conversationStage, setConversationStage] = useState<'name' | 'goal' | 'planning'>('name');
  const scrollViewRef = React.useRef<ScrollView>(null);
  const logoScale = React.useRef(new Animated.Value(0)).current;
  const logoRotate = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, logoRotate]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

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
      if (conversationStage === 'name') {
        const rawName = inputText.trim();
        const name = rawName.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        await createUser(name);
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Great to meet you, ${name}! 🌟\n\nNow, what goal would you like to work on? It could be anything - fitness, career, learning a new skill, or something else entirely. Tell me about what you want to achieve!`,
          timestamp: new Date().toISOString(),
        };
        setMessages([...newMessages, assistantMessage]);
        setConversationStage('goal');
        setIsLoading(false);
      } else {
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
        
        setMessages([...newMessages, assistantMessage]);

        if (conversationStage === 'goal') {
          setConversationStage('planning');
        }

        if (aiResponse.toLowerCase().includes('ready to start') || 
            aiResponse.toLowerCase().includes('let\'s get started') ||
            aiResponse.toLowerCase().includes('sounds good')) {
          setTimeout(async () => {
            try {
              const goal = await generateGoalFromConversation(conversationHistory);
              await addGoal(goal);
              
              for (const msg of [...newMessages, assistantMessage]) {
                await addChatMessage(msg);
              }

              await completeOnboarding();
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error creating goal:', error);
            }
          }, 1000);
        }
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
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      console.log('Onboarding: Setting OneSignal user ID:', user.id);
      setUserIdForNotifications(user.id);
    }
  }, [user?.id, setUserIdForNotifications]);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Animated.View 
            style={[
              styles.logoContainer, 
              { 
                backgroundColor: colors.primary,
                transform: [{ scale: logoScale }, { rotate: spin }],
              }
            ]}
          >
            <Sparkles color="#FFF" size={32} fill="#FFF" />
          </Animated.View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>GoalQuest</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Your AI-powered goal companion
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
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
          ))}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center' as const,
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    opacity: 0.8,
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
});
