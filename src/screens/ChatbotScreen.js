import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    ScrollView,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { chatAPI } from '../services/apiService';
import speechService from '../services/speechService';

const { width } = Dimensions.get('window');

// Sample conversation data 
const initialMessages = [
    {
        id: '1',
        text: 'Hello! I\'m your Smart Farming Assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date().getTime() - 60000,
    },
];

// Sample supported languages
const languages = [
    { id: 'en-US', name: 'English', selected: true },
    { id: 'hi-IN', name: 'हिन्दी', selected: false },
    { id: 'mr-IN', name: 'मराठी', selected: false },
    { id: 'gu-IN', name: 'ગુજરાતી', selected: false },
    { id: 'ta-IN', name: 'தமிழ்', selected: false },
    { id: 'te-IN', name: 'తెలుగు', selected: false },
];

// Sample predefined questions
const predefinedQuestions = [
    "What fertilizer should I use for tomatoes?",
    "How to prevent leaf curl in chili plants?",
    "When is the best time to sow wheat?",
    "Current price of potatoes in nearby markets?",
    "Weather forecast for the next week?",
];

const ChatbotScreen = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    const [showLanguageSelection, setShowLanguageSelection] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState('');

    // Animation values
    const langMenuHeight = useRef(new Animated.Value(0)).current;
    const micAnimation = useRef(new Animated.Value(1)).current;
    const flatListRef = useRef(null);

    // Initialize speech recognition on component mount
    useEffect(() => {
        // Initialize speech recognition
        const initSpeech = async () => {
            const initialized = speechService.initialize();
            if (!initialized && Platform.OS !== 'web') {
                Alert.alert(
                    'Speech Recognition Unavailable',
                    'Speech recognition is not available on your device.'
                );
            }
        };

        initSpeech();

        // Set up speech service event handlers
        speechService.onSpeechStart = () => {
            setRecordingStatus('Listening...');
        };

        speechService.onSpeechEnd = () => {
            setRecordingStatus('');
            setIsRecording(false);
        };

        speechService.onSpeechResults = (transcript) => {
            setInputText(transcript);
        };

        speechService.onSpeechError = (error) => {
            console.error('Speech recognition error:', error);
            setRecordingStatus('');
            setIsRecording(false);
            Alert.alert(
                'Speech Recognition Error',
                'An error occurred while trying to recognize your speech.'
            );
        };

        return () => {
            // Clean up speech recognition
            speechService.destroy();
        };
    }, []);

    // Update speech service language when selected language changes
    useEffect(() => {
        speechService.setLanguage(selectedLanguage);
    }, [selectedLanguage]);

    // Pulse animation for mic button when recording
    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(micAnimation, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(micAnimation, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.timing(micAnimation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isRecording]);

    // Toggle language selection menu
    const toggleLanguageMenu = () => {
        Animated.timing(langMenuHeight, {
            toValue: showLanguageSelection ? 0 : 200,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setShowLanguageSelection(!showLanguageSelection);
    };

    // Select a language
    const selectLanguage = (langId) => {
        setSelectedLanguage(langId);
        toggleLanguageMenu();
    };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (inputText.trim() === '') return;

        const newUserMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().getTime(),
        };

        setMessages([...messages, newUserMessage]);
        setInputText('');

        try {
            // Show typing indicator
            const typingIndicator = {
                id: 'typing-indicator',
                text: 'Typing...',
                sender: 'bot',
                isTyping: true,
                timestamp: new Date().getTime(),
            };

            setMessages(prevMessages => [...prevMessages, typingIndicator]);

            // Call Flask API
            const response = await chatAPI.sendMessage(inputText);

            // Remove typing indicator and add actual response
            setMessages(prevMessages =>
                prevMessages
                    .filter(msg => msg.id !== 'typing-indicator')
                    .concat({
                        id: Date.now().toString(),
                        text: response.data.response,
                        sender: 'bot',
                        timestamp: new Date().getTime(),
                    })
            );
        } catch (error) {
            console.error('Chat error:', error);
            // Remove typing indicator
            setMessages(prevMessages =>
                prevMessages
                    .filter(msg => msg.id !== 'typing-indicator')
                    .concat({
                        id: Date.now().toString(),
                        text: 'Sorry, I encountered an error. Please try again later.',
                        sender: 'bot',
                        timestamp: new Date().getTime(),
                    })
            );
        }
    };

    // Toggle voice recording
    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            await speechService.stopRecording();
            setIsRecording(false);
            setRecordingStatus('');
        } else {
            // Start recording
            const success = await speechService.startRecording();
            if (success) {
                setIsRecording(true);
                setRecordingStatus('Listening...');
            } else {
                Alert.alert(
                    'Speech Recognition Failed',
                    'Failed to start speech recognition. Please try again.'
                );
            }
        }
    };

    // Use predefined question
    const useQuestion = (question) => {
        setInputText(question);
    };

    // Format timestamp to readable time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Render each message
    const renderMessage = ({ item }) => {
        const isBot = item.sender === 'bot';
        const isTyping = item.isTyping;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isBot ? styles.botMessageContainer : styles.userMessageContainer,
                ]}
            >
                {isBot && (
                    <View style={styles.botIconContainer}>
                        <MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" />
                    </View>
                )}

                <View
                    style={[
                        styles.messageBubble,
                        isBot ? styles.botMessageBubble : styles.userMessageBubble,
                    ]}
                >
                    {isTyping ? (
                        <View style={styles.typingContainer}>
                            <View style={styles.typingDot} />
                            <View style={styles.typingDot} />
                            <View style={styles.typingDot} />
                        </View>
                    ) : (
                        <Text style={[styles.messageText, isBot ? styles.botMessageText : styles.userMessageText]}>
                            {item.text}
                        </Text>
                    )}
                    <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Smart Assistant</Text>
                    <TouchableOpacity
                        style={styles.languageButton}
                        onPress={toggleLanguageMenu}
                    >
                        <Text style={styles.languageButtonText}>
                            {languages.find(lang => lang.id === selectedLanguage)?.name || 'English'}
                        </Text>
                        <MaterialCommunityIcons
                            name={showLanguageSelection ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#4CAF50"
                        />
                    </TouchableOpacity>
                </View>

                {/* Language Selection Menu */}
                <Animated.View style={[styles.languageMenu, { height: langMenuHeight }]}>
                    <FlatList
                        data={languages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.languageItem,
                                    item.id === selectedLanguage && styles.selectedLanguageItem,
                                ]}
                                onPress={() => selectLanguage(item.id)}
                            >
                                <Text
                                    style={[
                                        styles.languageItemText,
                                        item.id === selectedLanguage && styles.selectedLanguageItemText,
                                    ]}
                                >
                                    {item.name}
                                </Text>
                                {item.id === selectedLanguage && (
                                    <MaterialCommunityIcons name="check" size={18} color="#4CAF50" />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </Animated.View>

                {/* Message List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                    onLayout={() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                />

                {/* Quick Questions */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQuestionsContainer}>
                    {predefinedQuestions.map((question, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickQuestionButton}
                            onPress={() => useQuestion(question)}
                        >
                            <Text style={styles.quickQuestionText}>{question}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Speech Status */}
                {recordingStatus ? (
                    <View style={styles.speechStatusContainer}>
                        <Text style={styles.speechStatusText}>
                            <MaterialCommunityIcons name="microphone" size={16} color="#FF5252" />
                            {' ' + recordingStatus}
                        </Text>
                    </View>
                ) : null}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />

                    <Animated.View
                        style={[
                            styles.recordButton,
                            isRecording && styles.recordingButton,
                            { transform: [{ scale: micAnimation }] },
                        ]}
                    >
                        <TouchableOpacity onPress={toggleRecording}>
                            <MaterialCommunityIcons
                                name={isRecording ? "microphone" : "microphone-outline"}
                                size={24}
                                color={isRecording ? "#FFFFFF" : "#4CAF50"}
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !inputText.trim() && styles.disabledSendButton,
                        ]}
                        onPress={handleSendMessage}
                        disabled={!inputText.trim()}
                    >
                        <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E4053',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    languageButtonText: {
        fontSize: 14,
        color: '#4CAF50',
        marginRight: 4,
    },
    languageMenu: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        overflow: 'hidden',
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    selectedLanguageItem: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    languageItemText: {
        fontSize: 16,
        color: '#2E4053',
    },
    selectedLanguageItemText: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    messageList: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '80%',
    },
    botMessageContainer: {
        alignSelf: 'flex-start',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    botIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: '100%',
    },
    botMessageBubble: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    userMessageBubble: {
        backgroundColor: '#4CAF50',
    },
    messageText: {
        fontSize: 16,
        marginBottom: 4,
    },
    botMessageText: {
        color: '#2E4053',
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    timestampText: {
        fontSize: 10,
        color: '#7E8C8D',
        alignSelf: 'flex-end',
    },
    quickQuestionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#F5F8FA',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    quickQuestionButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    quickQuestionText: {
        fontSize: 12,
        color: '#2E4053',
    },
    speechStatusContainer: {
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    speechStatusText: {
        color: '#FF5252',
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F8FA',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        maxHeight: 100,
    },
    recordButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    recordingButton: {
        backgroundColor: '#FF5252',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    disabledSendButton: {
        backgroundColor: '#CCCCCC',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginHorizontal: 2,
    },
});

export default ChatbotScreen; 