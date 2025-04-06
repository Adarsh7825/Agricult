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
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { useOffline } from '../context/OfflineContext';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const { t } = useLocalization();
    const { isOffline } = useOffline();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'farmer',
        farmSize: '',
        farmSizeUnit: 'acres',
        primaryCrops: '',
        farmingType: 'conventional',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // Registration steps (1: personal, 2: farm)

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const validateStep1 = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError(t('required_fields_missing'));
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(t('passwords_do_not_match'));
            return false;
        }

        if (formData.password.length < 6) {
            setError(t('password_too_short'));
            return false;
        }

        setError('');
        return true;
    };

    const goToStep2 = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const goBackToStep1 = () => {
        setStep(1);
    };

    const handleRegister = async () => {
        if (isOffline) {
            Alert.alert(
                t('offline_mode'),
                t('register_offline_error'),
                [{ text: t('ok') }]
            );
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Format primaryCrops as an array from comma-separated string
            const primaryCropsArray = formData.primaryCrops
                ? formData.primaryCrops.split(',').map(crop => crop.trim())
                : [];

            // Create payload
            const userData = {
                ...formData,
                primaryCrops: primaryCropsArray,
                farmSize: parseFloat(formData.farmSize) || 0,
            };

            delete userData.confirmPassword; // Remove confirmPassword field

            await register(userData);
            // Registration successful - the auth context will handle navigation
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || t('registration_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <>
            <Text style={styles.title}>{t('create_account')}</Text>

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('first_name')}
                    value={formData.firstName}
                    onChangeText={(text) => handleChange('firstName', text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('last_name')}
                    value={formData.lastName}
                    onChangeText={(text) => handleChange('lastName', text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('email')}
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('phone')}
                    value={formData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('password')}
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
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

            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={t('confirm_password')}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                >
                    <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#757575"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[
                    styles.nextButton,
                    (isSubmitting || isOffline) && styles.buttonDisabled,
                ]}
                onPress={goToStep2}
                disabled={isSubmitting || isOffline}
            >
                <Text style={styles.buttonText}>{t('next')}</Text>
            </TouchableOpacity>

            <View style={styles.navContainer}>
                <Text style={styles.navText}>{t('already_have_account')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.navLink}>{t('login')}</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            <Text style={styles.title}>{t('farm_details')}</Text>

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>{t('user_role')}:</Text>
                <View style={styles.roleButtons}>
                    <TouchableOpacity
                        style={[
                            styles.roleButton,
                            formData.role === 'farmer' && styles.roleButtonActive,
                        ]}
                        onPress={() => handleChange('role', 'farmer')}
                    >
                        <Text
                            style={[
                                styles.roleButtonText,
                                formData.role === 'farmer' && styles.roleButtonTextActive,
                            ]}
                        >
                            {t('farmer')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.roleButton,
                            formData.role === 'buyer' && styles.roleButtonActive,
                        ]}
                        onPress={() => handleChange('role', 'buyer')}
                    >
                        <Text
                            style={[
                                styles.roleButtonText,
                                formData.role === 'buyer' && styles.roleButtonTextActive,
                            ]}
                        >
                            {t('buyer')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {formData.role === 'farmer' && (
                <>
                    <View style={styles.farmSizeContainer}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="resize" size={20} color="#4CAF50" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('farm_size')}
                                value={formData.farmSize}
                                onChangeText={(text) => handleChange('farmSize', text)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.unitSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.unitButton,
                                    formData.farmSizeUnit === 'acres' && styles.unitButtonActive,
                                ]}
                                onPress={() => handleChange('farmSizeUnit', 'acres')}
                            >
                                <Text
                                    style={[
                                        styles.unitButtonText,
                                        formData.farmSizeUnit === 'acres' && styles.unitButtonTextActive,
                                    ]}
                                >
                                    {t('acres')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.unitButton,
                                    formData.farmSizeUnit === 'hectares' && styles.unitButtonActive,
                                ]}
                                onPress={() => handleChange('farmSizeUnit', 'hectares')}
                            >
                                <Text
                                    style={[
                                        styles.unitButtonText,
                                        formData.farmSizeUnit === 'hectares' && styles.unitButtonTextActive,
                                    ]}
                                >
                                    {t('hectares')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.unitButton,
                                    formData.farmSizeUnit === 'bigha' && styles.unitButtonActive,
                                ]}
                                onPress={() => handleChange('farmSizeUnit', 'bigha')}
                            >
                                <Text
                                    style={[
                                        styles.unitButtonText,
                                        formData.farmSizeUnit === 'bigha' && styles.unitButtonTextActive,
                                    ]}
                                >
                                    {t('bigha')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="leaf" size={20} color="#4CAF50" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('primary_crops_hint')}
                            value={formData.primaryCrops}
                            onChangeText={(text) => handleChange('primaryCrops', text)}
                        />
                    </View>

                    <View style={styles.farmingTypeContainer}>
                        <Text style={styles.farmingTypeLabel}>{t('farming_type')}:</Text>
                        <View style={styles.farmingTypeOptions}>
                            <TouchableOpacity
                                style={styles.typeOption}
                                onPress={() => handleChange('farmingType', 'conventional')}
                            >
                                <View style={styles.radioButton}>
                                    {formData.farmingType === 'conventional' && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                                <Text style={styles.typeText}>{t('conventional')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.typeOption}
                                onPress={() => handleChange('farmingType', 'organic')}
                            >
                                <View style={styles.radioButton}>
                                    {formData.farmingType === 'organic' && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                                <Text style={styles.typeText}>{t('organic')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.typeOption}
                                onPress={() => handleChange('farmingType', 'mixed')}
                            >
                                <View style={styles.radioButton}>
                                    {formData.farmingType === 'mixed' && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                                <Text style={styles.typeText}>{t('mixed')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={goBackToStep1}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>{t('back')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.registerButton,
                        (isSubmitting || isOffline) && styles.buttonDisabled,
                    ]}
                    onPress={handleRegister}
                    disabled={isSubmitting || isOffline}
                >
                    {isSubmitting ? (
                        <Text style={styles.buttonText}>{t('registering')}</Text>
                    ) : (
                        <Text style={styles.buttonText}>{t('register')}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {isOffline && (
                <View style={styles.offlineWarning}>
                    <Ionicons name="cloud-offline" size={16} color="#F57C00" />
                    <Text style={styles.offlineWarningText}>{t('register_requires_connection')}</Text>
                </View>
            )}
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidView}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.formContainer}>
                        {step === 1 ? renderStep1() : renderStep2()}
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
    nextButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    registerButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#757575',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
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
        marginTop: 10,
    },
    navText: {
        color: '#757575',
    },
    navLink: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    roleContainer: {
        marginBottom: 15,
    },
    roleLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: '#424242',
    },
    roleButtons: {
        flexDirection: 'row',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    roleButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    roleButtonText: {
        color: '#424242',
    },
    roleButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    farmSizeContainer: {
        marginBottom: 15,
    },
    unitSelector: {
        flexDirection: 'row',
        marginTop: 10,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    unitButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    unitButtonText: {
        color: '#424242',
    },
    unitButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    farmingTypeContainer: {
        marginBottom: 15,
    },
    farmingTypeLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: '#424242',
    },
    farmingTypeOptions: {
        marginTop: 5,
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
    },
    typeText: {
        fontSize: 16,
        color: '#424242',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 15,
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
});

export default RegisterScreen; 