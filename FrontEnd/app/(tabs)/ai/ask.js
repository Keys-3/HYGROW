import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useThemeColors, spacing, borderRadius, typography } from '../../../src/theme/theme';
import useAppStore from '../../../src/store/useAppStore';

export default function AskAIScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const user = useAppStore((state) => state.user);
  
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hello! I am HyGrow AI. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const flatListRef = useRef(null);

  // Generate system prompt based on user role
  const getSystemPrompt = () => {
    const basePrompt = "You are HyGrow AI, an intelligent agricultural and farm management assistant built into the HyGrow app. You must never mention that you are an AI model developed by Google, Gemini, or any other third party. Keep your answers polite, helpful, and concise.";
    
    if (user?.role === 'farmer') {
      return basePrompt + " Your primary user is a farmer. Focus on providing actionable advice on crop management, sensor data interpretation, yield prediction, disease management, and sustainable farming practices.";
    } else if (user?.role === 'customer') {
      return basePrompt + " Your primary user is a customer looking to buy farm produce. Focus on answering questions about available crops, organic farming practices used by the farmers, and order delivery processes.";
    } else if (user?.role === 'admin') {
      return basePrompt + " Your primary user is a system administrator. Focus on providing insights regarding overall system operations, user management, advanced analytics, and inventory overviews.";
    }
    
    return basePrompt;
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const rawKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const apiKey = rawKey.trim();
      
      if (!apiKey || apiKey === 'dummy_gemini_api_key_here') {
        // Fallback for dummy key to simulate AI response
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant', 
            text: "This is a simulated response because the Gemini API key in the environment variables is currently set to a dummy value. Please update EXPO_PUBLIC_GEMINI_API_KEY with a valid key." 
          }]);
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Format history for Gemini SDK
      const history = messages
        .filter(msg => msg.id !== '1')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: getSystemPrompt()
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage.text);
      const aiText = result.response.text();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: aiText
      }]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error while processing your request. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble, 
        isUser ? styles.userBubble : styles.aiBubble
      ]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: themeColors.primary + '20' }]}>
            <Bot color={themeColors.primary} size={16} />
          </View>
        )}
        
        <View style={[
          styles.messageContent, 
          isUser ? styles.userMessageContent : styles.aiMessageContent
        ]}>
          <Text style={[
            styles.messageText, 
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {item.text}
          </Text>
        </View>

        {isUser && (
          <View style={[styles.avatar, { backgroundColor: themeColors.primary, marginLeft: 8 }]}>
            <User color="#fff" size={16} />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={themeColors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HyGrow AI</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask anything about your farm..."
          placeholderTextColor={themeColors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send color="#fff" size={20} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.md,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: theme.text,
  },
  chatContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '100%',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userMessageContent: {
    backgroundColor: theme.primary,
    borderTopRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderTopLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: theme.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    color: theme.text,
    ...typography.body,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.primary + '80',
  }
});
