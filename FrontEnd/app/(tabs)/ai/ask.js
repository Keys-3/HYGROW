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
  Keyboard,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, User, Sparkles, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';
import useAppStore from '../../../src/store/useAppStore';
import { Alert } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AskAIScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const user = useAppStore((state) => state.user);
  
  const initialMessages = [
    { id: '1', role: 'assistant', text: 'Hello! I am HyGrow AI. How can I help you with your farm today?' },
    { id: '2', role: 'assistant', text: 'You can ask me things like:\n- **"How are my sensors?"**\n- **"What crops should I grow?"**\n- **"How is the weather?"**' }
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const flatListRef = useRef(null);

  const storageKey = `chat_history_${user?.id || 'guest'}`;

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedChats = await AsyncStorage.getItem(storageKey);
        if (savedChats) {
          setMessages(JSON.parse(savedChats));
        }
      } catch (error) {
        console.error('Failed to load chat history', error);
      }
    };
    loadChatHistory();
  }, [storageKey]);

  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat history', error);
      }
    };
    if (messages.length > 1) {
      saveChatHistory();
    }
  }, [messages, storageKey]);

  const handleClearChats = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to delete all your chat history?");
      if (confirmed) {
        AsyncStorage.removeItem(storageKey).then(() => {
          setMessages(initialMessages);
        });
      }
      return;
    }

    Alert.alert(
      "Clear Chats",
      "Are you sure you want to delete all your chat history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(storageKey);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMessages(initialMessages);
          }
        }
      ]
    );
  };


  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: inputText.trim() };
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      setTimeout(() => {
        let aiText = "I'm sorry, I don't understand that. You can ask me about:\n- **Sensors** (e.g. 'How are my sensors?')\n- **Crops** (e.g. 'What crops should I grow?')\n- **Weather** (e.g. 'How is the weather?')";
        
        const lowerInput = userMessage.text.toLowerCase();
        if (lowerInput.includes('sensor') || lowerInput.includes('ph') || lowerInput.includes('water')) {
          aiText = "Based on the latest data, your sensors are online. Your pH is around 6.0 and the water level is stable at 82%.";
        } else if (lowerInput.includes('crop') || lowerInput.includes('grow')) {
          aiText = "For this season, I recommend growing leafy greens like Spinach and Lettuce, as they thrive in your current hydroponic setup parameters.";
        } else if (lowerInput.includes('weather') || lowerInput.includes('temperature') || lowerInput.includes('temp')) {
          aiText = "The current temperature is optimal for your crops (around 24°C). The humidity is at 65%.";
        } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
          aiText = "Hello there! How can I assist you with your farm today?";
        }

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          text: aiText
        }]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error in chat:', error);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error while processing your request.'
      }]);
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    
    if (isUser) {
      return (
        <View style={[styles.messageBubble, styles.userBubble]}>
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageContent, styles.userMessageContent]}
          >
            <Text style={styles.userMessageText}>{item.text}</Text>
          </LinearGradient>
          <View style={[styles.avatar, styles.userAvatar]}>
            <User color="#fff" size={14} />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageBubble, styles.aiBubble]}>
        <View style={[styles.avatar, styles.aiAvatar]}>
          <Sparkles color="#fff" size={14} />
        </View>
        <View style={[styles.messageContent, styles.aiMessageContent]}>
          <Markdown 
            style={markdownStyles(themeColors)}
            mergeStyle={true}
          >
            {item.text}
          </Markdown>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={themeColors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>HyGrow AI</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearChats} style={styles.backButton}>
          <Trash2 color="#EF4444" size={22} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={() => 
          isLoading ? (
            <View style={styles.typingIndicatorContainer}>
              <View style={[styles.avatar, styles.aiAvatar, { marginRight: 8 }]}>
                 <Sparkles color="#fff" size={14} />
              </View>
              <View style={[styles.messageContent, styles.aiMessageContent, styles.typingBubble]}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything about your farm..."
            placeholderTextColor={themeColors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Send color={(!inputText.trim() || isLoading) ? themeColors.textMuted : "#fff"} size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Markdown Styles specifically generated for react-native-markdown-display
const markdownStyles = (theme) => ({
  body: {
    ...typography.body,
    color: theme.text,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  heading1: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  heading2: {
    ...typography.h4,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  heading3: {
    ...typography.h4,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  strong: {
    fontWeight: '700',
    color: theme.text,
  },
  em: {
    fontStyle: 'italic',
  },
  blockquote: {
    backgroundColor: theme.background,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    borderRadius: 4,
  },
  code_inline: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: theme.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: theme.primary,
  },
  code_block: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: theme.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    color: theme.text,
  },
  fence: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#1E1E1E',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    color: '#D4D4D4',
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet_list_icon: {
    marginRight: 8,
    marginTop: 4,
    fontSize: 16,
    color: theme.primary,
  },
  ordered_list_icon: {
    marginRight: 8,
    marginTop: 0,
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  }
});

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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    ...shadows.sm,
    zIndex: 10,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: theme.text,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  chatContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    maxWidth: '100%',
    alignItems: 'flex-end',
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
    marginBottom: 4,
    ...shadows.sm,
  },
  userAvatar: {
    backgroundColor: theme.textSecondary,
    marginLeft: 8,
  },
  aiAvatar: {
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  messageContent: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 20,
    ...shadows.sm,
  },
  userMessageContent: {
    borderBottomRightRadius: 4,
  },
  aiMessageContent: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    ...typography.body,
    color: '#fff',
    lineHeight: 22,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: theme.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.card,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    color: theme.text,
    ...typography.body,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 0,
    shadowOpacity: 0,
  }
});
