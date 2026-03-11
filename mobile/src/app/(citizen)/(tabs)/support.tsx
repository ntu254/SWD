import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { Send, User, Bot, MessageSquare } from 'lucide-react-native';
import { GlassCard } from '../../../shared/ui/GlassCard';
import { citizenService } from '../../../features/citizen/citizenService';
import { chatWithAi, ChatMessage as AiChatHistory } from '../../../shared/services/geminiService';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function SupportScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn về việc phân loại rác và quy trình thu gom?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            // Prepare history for Gemini
            const history: AiChatHistory[] = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const botResponse = await chatWithAi(inputText, history);
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Xin lỗi, tôi đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => (
        <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
            {item.sender === 'bot' && (
                <View style={styles.botIcon}>
                    <Bot size={16} color="#fff" />
                </View>
            )}
            <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>
                    {item.text}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <MessageSquare size={24} color="#fff" />
                <Text style={styles.headerTitle}>Hỗ trợ AI</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {loading && (
                <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#059669" />
                    <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={{ flex: 0 }}
            >
                <GlassCard style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Hỏi về phân loại rác..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || loading}
                    >
                        <Send size={20} color="#fff" />
                    </TouchableOpacity>
                </GlassCard>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        backgroundColor: '#047857',
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
    chatContent: { padding: 16, paddingBottom: 32 },
    messageRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    botIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#059669',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userBubble: { backgroundColor: '#059669', borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#ffffff' },
    botText: { color: '#334155' },
    loadingBubble: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 10, alignItems: 'center', gap: 8 },
    loadingText: { color: '#64748b', fontSize: 13, fontStyle: 'italic' },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        borderRadius: 30,
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        color: '#1e293b',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#059669',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#94a3b8' },
});
