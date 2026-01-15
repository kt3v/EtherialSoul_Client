import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import socketService from '../services/socket';

export default function ChatScreen({ navigation, route }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const chatModeSetRef = useRef(false);
    
    const { chatMode = 'astro', initialMessage } = route.params || {};

    useEffect(() => {
        // Set up event listeners FIRST
        socketService.onMessageReceived((message) => {
            console.log('📨 onMessageReceived callback:', message);
            setMessages((prev) => {
                console.log('📝 Previous messages:', prev);
                const newMessages = [...prev, message];
                console.log('📝 New messages:', newMessages);
                return newMessages;
            });
            setIsSending(false);
        });

        socketService.onAIMessage((message) => {
            setMessages((prev) => [...prev, message]);
        });

        socketService.onAIBlock((block) => {
            console.log('🤖 onAIBlock callback:', block);
            setIsAIResponding(true);
            // Add AI block as a message
            const message = {
                id: Date.now() + Math.random(),
                text: block.text,
                sender: 'ai',
                timestamp: block.timestamp,
                group: block.group,
            };
            console.log('🤖 Creating AI message:', message);
            setMessages((prev) => {
                console.log('🤖 Previous messages:', prev);
                const newMessages = [...prev, message];
                console.log('🤖 New messages:', newMessages);
                return newMessages;
            });
        });

        socketService.onAIComplete(() => {
            setIsAIResponding(false);
        });

        socketService.onError((error) => {
            console.error('Socket error:', error);
            setIsSending(false);
        });

        // Connect to WebSocket LAST
        socketService.connect();

        // Check connection status and send chat mode when connected
        const checkConnection = setInterval(() => {
            const connected = socketService.connected;
            setIsConnected(connected);
            
            // Send chat mode once when connection is established
            if (connected && !chatModeSetRef.current) {
                chatModeSetRef.current = true;
                console.log('📤 Setting chat mode:', chatMode);
                socketService.setChatMode(chatMode, initialMessage);
            }
        }, 1000);

        return () => {
            clearInterval(checkConnection);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            socketService.offMessageReceived();
            socketService.offAIMessage();
            socketService.offAIBlock();
            socketService.offAIComplete();
            socketService.offError();
        };
    }, []);

    const handleTextChange = (text) => {
        setInputText(text);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // If text is not empty and user wasn't typing before, send typing start
        if (text.length > 0 && !isTypingRef.current) {
            isTypingRef.current = true;
            socketService.sendTypingStatus(true);
        }

        // If text is empty, send typing stop immediately
        if (text.length === 0 && isTypingRef.current) {
            isTypingRef.current = false;
            socketService.sendTypingStatus(false);
            return;
        }

        // Set timeout to detect when user stops typing
        if (text.length > 0) {
            typingTimeoutRef.current = setTimeout(() => {
                if (isTypingRef.current) {
                    isTypingRef.current = false;
                    socketService.sendTypingStatus(false);
                }
            }, 1000); // 1 second of inactivity = stopped typing
        }
    };

    const sendMessage = () => {
        if (!inputText.trim() || !isConnected) return;

        // Clear typing timeout and send typing stop
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTypingRef.current) {
            isTypingRef.current = false;
            socketService.sendTypingStatus(false);
        }

        setIsSending(true);
        socketService.sendMessage(inputText.trim(), chatMode);
        setInputText('');
    };

    const handleEndChat = () => {
        // Stop AI response if it's responding
        if (isAIResponding) {
            socketService.stopAIResponse();
            setIsAIResponding(false);
        }
        
        // Send end_chat signal to server
        if (isConnected) {
            socketService.endChat();
        }
        
        // Clear all messages
        setMessages([]);
        
        // Navigate back to Dashboard
        navigation.navigate('Dashboard');
    };

    const renderMessage = ({ item }) => {
        const isUser = item.sender === 'user';
        const isSystem = item.sender === 'system';

        return (
            <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                        isSystem && styles.systemBubble,
                    ]}
                >
                    <Text style={[styles.messageText, isSystem && styles.systemText]}>
                        {item.text}
                    </Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <LinearGradient colors={[COLORS.background, '#1a0a2e']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleEndChat}
                >
                    <Text style={styles.exitButtonText}>← Exit</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Your spiritual mentor</Text>
                    <View style={[styles.statusDot, isConnected && styles.statusConnected]} />
                </View>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Начните разговор с AI</Text>
                        <Text style={styles.emptySubtext}>
                            {isConnected ? 'Отправьте сообщение ниже' : 'Подключение к серверу...'}
                        </Text>
                    </View>
                }
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={handleTextChange}
                        placeholder="Введите сообщение..."
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        maxLength={1000}
                        editable={isConnected && !isSending}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || !isConnected || isSending) && styles.sendButtonDisabled,
                        ]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || !isConnected || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.sendButtonText}>→</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    exitButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FF8C42',
        borderRadius: 12,
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    exitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.error,
    },
    statusConnected: {
        backgroundColor: COLORS.success,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    messageContainer: {
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: COLORS.userMessage,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: COLORS.aiMessage,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    systemBubble: {
        backgroundColor: COLORS.surfaceLight,
        borderColor: COLORS.secondary,
    },
    messageText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 22,
    },
    systemText: {
        color: COLORS.secondary,
    },
    timestamp: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 20,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.surfaceLight,
        opacity: 0.5,
    },
    sendButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
});
