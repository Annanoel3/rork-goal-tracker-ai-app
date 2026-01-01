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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/constants/theme';
import { chatWithAI, generateGoalFromConversation } from '@/services/ai';
import { ChatMessage } from '@/types';

export default function ChatScreen() {
  const { addGoal, addChatMessage, chatHistory, theme } = useApp();
  const colors = getTheme(theme);

  const [messages, setMessages] = useState<ChatMessage[]>(
    chatHistory.length > 0
      ? chatHistory
      : [
          {
            id: '1',
            role: 'assistant',
            content: "Hi! 🎯 I'm here to help you create or adjust your goals. What would you like to work on?",
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

      if (
        aiResponse.toLowerCase().includes('ready to start') ||
        aiResponse.toLowerCase().includes("let's get started") ||
        aiResponse.toLowerCase().includes('sounds good')
      ) {
        setTimeout(async () => {
          try {
            const goal = await generateGoalFromConversation(conversationHistory);
            await addGoal(goal);

            const successMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: '🎉 Awesome! Your goal has been created. Check it out in the Goals tab!',
              timestamp: new Date().toISOString(),
            };
            setMessages([...updatedMessages, successMessage]);
            await addChatMessage(successMessage);
          } catch (error) {
            console.error('Error creating goal:', error);
          }
        }, 1000);
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
              Create and adjust your goals
            </Text>
          </View>
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
});
