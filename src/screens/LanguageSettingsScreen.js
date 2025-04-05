import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { useOffline } from '../context/OfflineContext';

const LanguageSettingsScreen = ({ navigation }) => {
    const { t, locale, changeLocale, getSupportedLocales, initialized } = useLocalization();
    const { isOffline } = useOffline();

    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load supported languages
    useEffect(() => {
        if (initialized) {
            setLanguages(getSupportedLocales());
            setLoading(false);
        }
    }, [initialized]);

    // Handle language selection
    const handleLanguageSelect = async (languageCode) => {
        try {
            if (languageCode === locale) {
                return; // Already selected
            }

            await changeLocale(languageCode);

            // Show confirmation
            Alert.alert(
                t('language_changed'),
                t('language_change_success'),
                [{ text: t('ok') }]
            );

            // Go back to settings screen after delay
            setTimeout(() => {
                navigation.goBack();
            }, 500);
        } catch (error) {
            console.error('Failed to change language:', error);
            Alert.alert(
                t('error'),
                t('language_change_error'),
                [{ text: t('ok') }]
            );
        }
    };

    // Render language item
    const renderLanguageItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.languageItem,
                locale === item.code && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageSelect(item.code)}
        >
            <Text
                style={[
                    styles.languageName,
                    locale === item.code && styles.selectedLanguageText
                ]}
            >
                {item.name}
            </Text>

            {locale === item.code && (
                <Ionicons name="checkmark" size={24} color="#3E7D44" />
            )}
        </TouchableOpacity>
    );

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3E7D44" />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{t('select_language')}</Text>
                <Text style={styles.subHeaderText}>
                    {isOffline
                        ? t('language_offline_notice')
                        : t('language_online_notice')}
                </Text>
            </View>

            <FlatList
                data={languages}
                renderItem={renderLanguageItem}
                keyExtractor={item => item.code}
                contentContainerStyle={styles.languagesList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#757575" />
                <Text style={styles.infoText}>
                    {t('language_info')}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    subHeaderText: {
        fontSize: 14,
        color: '#757575',
    },
    languagesList: {
        paddingVertical: 8,
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    selectedLanguage: {
        backgroundColor: '#F0F8F1',
    },
    languageName: {
        fontSize: 16,
        color: '#333333',
    },
    selectedLanguageText: {
        color: '#3E7D44',
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginLeft: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#666666',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#757575',
        marginLeft: 8,
    },
});

export default LanguageSettingsScreen; 