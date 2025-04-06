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
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { useOffline } from '../context/OfflineContext';
import AppImages from '../utils/AppImages';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const { t } = useLocalization();
    const { isOffline } = useOffline();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (isOffline) {
            Alert.alert(
                t('offline_mode'),
                t('login_offline_error'),
                [{ text: t('ok') }]
            );
            return;
        }

        if (!email || !password) {
            setError(t('email_password_required'));
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || t('login_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigateToRegister = () => {
        navigation.navigate('Register');
    };

    const navigateToForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidView}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={AppImages.logo}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>Agricult</Text>
                        <Text style={styles.tagline}>{t('farmer_companion')}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>{t('login_to_account')}</Text>

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
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed" size={20} color="#4CAF50" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('password')}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color="#757575"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPasswordButton}
                            onPress={navigateToForgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>{t('forgot_password')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                (isSubmitting || isOffline) && styles.loginButtonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isSubmitting || isOffline}
                        >
                            {isSubmitting ? (
                                <Text style={styles.loginButtonText}>{t('logging_in')}</Text>
                            ) : (
                                <Text style={styles.loginButtonText}>{t('login')}</Text>
                            )}
                        </TouchableOpacity>

                        {isOffline && (
                            <View style={styles.offlineWarning}>
                                <Ionicons name="cloud-offline" size={16} color="#F57C00" />
                                <Text style={styles.offlineWarningText}>{t('login_requires_connection')}</Text>
                            </View>
                        )}

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>{t('dont_have_account')} </Text>
                            <TouchableOpacity onPress={navigateToRegister}>
                                <Text style={styles.registerLink}>{t('register')}</Text>
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
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 10,
    },
    tagline: {
        fontSize: 16,
        color: '#757575',
        marginTop: 5,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
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
        marginBottom: 15,
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
    passwordToggle: {
        padding: 10,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#4CAF50',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    loginButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    offlineWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    offlineWarningText: {
        color: '#F57C00',
        marginLeft: 6,
        fontSize: 14,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    registerText: {
        color: '#757575',
    },
    registerLink: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
});

export default LoginScreen; 