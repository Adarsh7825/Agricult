import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { useOffline } from '../context/OfflineContext';

const ForgotPasswordScreen = ({ navigation }) => {
    const { resetPassword } = useAuth();
    const { t } = useLocalization();
    const { isOffline } = useOffline();

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (isOffline) {
            Alert.alert(
                t('offline_mode'),
                t('reset_requires_connection'),
                [{ text: t('ok') }]
            );
            return;
        }

        if (!email) {
            setError(t('email_required'));
            return;
        }

        if (!validateEmail(email)) {
            setError(t('invalid_email'));
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await resetPassword(email);
            setResetSent(true);
        } catch (error) {
            console.error('Password reset error:', error);
            setError(error.message || t('reset_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (resetSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.formContainer}>
                    <View style={styles.successContainer}>
                        <Ionicons name="mail" size={60} color="#4CAF50" />
                        <Text style={styles.successTitle}>{t('reset_email_sent')}</Text>
                        <Text style={styles.successText}>
                            {t('reset_instructions_sent', { email })}
                        </Text>
                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonText}>{t('back_to_login')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidView}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.formContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
                        </TouchableOpacity>

                        <Text style={styles.title}>{t('forgot_password')}</Text>
                        <Text style={styles.subtitle}>{t('reset_password_instructions')}</Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail" size={20} color="#4CAF50" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('email')}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.resetButton,
                                (isSubmitting || isOffline) && styles.buttonDisabled,
                            ]}
                            onPress={handleResetPassword}
                            disabled={isSubmitting || isOffline}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('reset_password')}</Text>
                            )}
                        </TouchableOpacity>

                        {isOffline && (
                            <View style={styles.offlineWarning}>
                                <Ionicons name="cloud-offline" size={16} color="#F57C00" />
                                <Text style={styles.offlineWarningText}>
                                    {t('reset_requires_connection')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.navContainer}>
                            <Text style={styles.navText}>{t('remember_password')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.navLink}>{t('login')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardAvoidView: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        padding: 5,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 20,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fdeaea',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    errorText: {
        color: '#e74c3c',
        marginLeft: 6,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    resetButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    buttonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    navText: {
        color: '#757575',
    },
    navLink: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    offlineWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    offlineWarningText: {
        color: '#F57C00',
        marginLeft: 6,
        fontSize: 14,
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 30,
    },
    backToLoginButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export default ForgotPasswordScreen; 