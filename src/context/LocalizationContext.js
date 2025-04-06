import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import offlineManager from '../utils/OfflineManager';

// Create context
const LocalizationContext = createContext();

// Initial translations in multiple languages
const translations = {
    en: {
        welcome: 'Welcome to Agricult',
        offline_message: 'You are currently offline. Some features may be limited.',
        crops: 'Crops',
        market: 'Market',
        weather: 'Weather',
        education: 'Education',
        settings: 'Settings',
        language: 'Language',
        notifications: 'Notifications',
        profile: 'Profile',
        save_for_offline: 'Save for offline use',
        saved_videos: 'Saved Videos',
        syncing: 'Syncing data...',
        sync_complete: 'Sync complete',
        crop_management: 'Crop Management',
        pest_control: 'Pest Control',
        irrigation: 'Irrigation',
        harvesting: 'Harvesting',
        storage: 'Storage',
        soil_health: 'Soil Health',
        seasonal_guide: 'Seasonal Guide',
        // Weather screen translations
        loading: 'Loading...',
        offline_data: 'Offline data',
        weather_error: 'Could not load weather data',
        five_day_forecast: '5-Day Forecast',
        last_updated: 'Last updated',
        offline_weather_notice: 'Using cached weather data while offline',
        // Video player translations
        loading_video: 'Loading video...',
        play: 'Play',
        delete: 'Delete',
        go_back: 'Go Back',
        video_player: 'Video Player',
        // Language settings translations
        select_language: 'Select Language',
        language_offline_notice: 'You can change language even when offline',
        language_online_notice: 'Select your preferred language',
        language_info: 'Educational videos will be shown in your selected language when available',
        language_changed: 'Language Changed',
        language_change_success: 'Your language preference has been saved',
        language_change_error: 'Failed to change language',
        error: 'Error',
        ok: 'OK',
        // Settings translations
        home: 'Home',
        app_language: 'App Language',
        offline_settings: 'Offline Settings',
        sync_on_cellular: 'Sync on Cellular',
        sync_on_cellular_desc: 'Allow syncing data when on mobile data',
        auto_download_wifi: 'Auto-download on WiFi',
        auto_download_wifi_desc: 'Automatically download recommended videos when on WiFi',
        high_quality: 'High Quality Downloads',
        high_quality_desc: 'Download videos in higher quality (uses more storage)',
        sync_now: 'Sync Now',
        sync_now_desc: 'Manually sync all pending data',
        sync_error: 'Sync Error',
        cannot_sync_offline: 'Cannot sync while offline. Please connect to the internet and try again.',
        sync_success_message: 'All data has been synchronized successfully',
        sync_error_message: 'Failed to synchronize data. Please try again later.',
        clear_videos_title: 'Clear All Videos',
        clear_videos_message: 'Are you sure you want to delete all downloaded videos? This cannot be undone.',
        cancel: 'Cancel',
        clear: 'Clear',
        success: 'Success',
        clear_videos_success: 'All videos have been removed from offline storage',
        clear_videos_error: 'Failed to clear videos',
        settings_save_error: 'Failed to save settings',
        offline_videos: 'Offline Videos',
        video: 'video',
        videos: 'videos',
        clear_videos: 'Clear All Videos',
        clear_videos_desc: 'Remove all downloaded videos to free up space',
        about: 'About',
        app_description: 'Agricult helps farmers access educational content even when offline, providing agricultural knowledge in multiple languages.',
        // Authentication translations
        app_name: 'Agricult',
        farmer_companion: 'Your farming companion',
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirm_password: 'Confirm Password',
        forgot_password: 'Forgot Password?',
        login_to_account: 'Login to your account',
        create_account: 'Create a new account',
        already_have_account: 'Already have an account?',
        dont_have_account: "Don't have an account?",
        remember_password: 'Remember your password?',
        reset_password: 'Reset Password',
        reset_password_instructions: 'Enter your email address below and we will send you instructions to reset your password.',
        email_required: 'Email is required',
        password_required: 'Password is required',
        invalid_email: 'Please enter a valid email address',
        password_too_short: 'Password must be at least 6 characters',
        passwords_do_not_match: 'Passwords do not match',
        required_fields_missing: 'Please fill all required fields',
        reset_email_sent: 'Reset Email Sent',
        reset_instructions_sent: 'Check your email for instructions to reset your password.',
        back_to_login: 'Back to Login',
        logging_in: 'Logging in...',
        registering: 'Registering...',
        reset_failed: 'Failed to reset password',
        email_password_required: 'Email and password are required',
        login_failed: 'Login failed. Please check your credentials.',
        registration_failed: 'Registration failed. Please try again.',
        login_requires_connection: 'Login requires internet connection',
        register_requires_connection: 'Registration requires internet connection',
        reset_requires_connection: 'Password reset requires internet connection',
        offline_mode: 'Offline Mode',
        login_offline_error: 'You need an internet connection to login for the first time.',
        register_offline_error: 'You need an internet connection to register.',
        footer_message: 'Making agriculture accessible for everyone',
        // Profile fields
        first_name: 'First Name',
        last_name: 'Last Name',
        phone: 'Phone Number',
        farm_details: 'Farm Details',
        user_role: 'You are a',
        farmer: 'Farmer',
        buyer: 'Buyer',
        farm_size: 'Farm Size',
        farming_type: 'Farming Type',
        conventional: 'Conventional',
        organic: 'Organic',
        mixed: 'Mixed',
        primary_crops_hint: 'Primary crops (comma separated)',
        acres: 'Acres',
        hectares: 'Hectares',
        bigha: 'Bigha',
        back: 'Back',
        next: 'Next',
        retry: 'Retry',
    },
    hi: {
        welcome: 'एग्रीकल्ट में आपका स्वागत है',
        offline_message: 'आप वर्तमान में ऑफलाइन हैं। कुछ सुविधाएँ सीमित हो सकती हैं।',
        crops: 'फसलें',
        market: 'बाज़ार',
        weather: 'मौसम',
        education: 'शिक्षा',
        settings: 'सेटिंग्स',
        language: 'भाषा',
        notifications: 'सूचनाएँ',
        profile: 'प्रोफाइल',
        save_for_offline: 'ऑफलाइन उपयोग के लिए सहेजें',
        saved_videos: 'सहेजे गए वीडियो',
        syncing: 'डेटा सिंक हो रहा है...',
        sync_complete: 'सिंक पूरा हुआ',
        crop_management: 'फसल प्रबंधन',
        pest_control: 'कीट नियंत्रण',
        irrigation: 'सिंचाई',
        harvesting: 'कटाई',
        storage: 'भंडारण',
        soil_health: 'मिट्टी का स्वास्थ्य',
        seasonal_guide: 'मौसमी मार्गदर्शिका',
    },
    te: {
        welcome: 'అగ్రికల్ట్‌కి స్వాగతం',
        offline_message: 'మీరు ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉన్నారు. కొన్ని ఫీచర్‌లు పరిమితం చేయబడవచ్చు.',
        crops: 'పంటలు',
        market: 'మార్కెట్',
        weather: 'వాతావరణం',
        education: 'విద్య',
        settings: 'సెట్టింగ్‌లు',
        language: 'భాష',
        notifications: 'నోటిఫికేషన్లు',
        profile: 'ప్రొఫైల్',
        save_for_offline: 'ఆఫ్‌లైన్ ఉపయోగం కోసం సేవ్ చేయండి',
        saved_videos: 'సేవ్ చేసిన వీడియోలు',
        syncing: 'డేటా సింక్ అవుత್తిదೆ...',
        sync_complete: 'సింక్ పూర్తయింది',
        crop_management: 'పంట నిర్వహణ',
        pest_control: 'పురుగు నియంత్రణ',
        irrigation: 'నీటిపారుదల',
        harvesting: 'పంట కోత',
        storage: 'నిల్వ',
        soil_health: 'నేల ఆరోగ్యం',
        seasonal_guide: 'సీజనల్ గైడ్',
    },
    ta: {
        welcome: 'அக்ரிகல்ட்க்கு வரவேற்கிறோம்',
        offline_message: 'நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள். சில அம்சங்கள் வரம்புக்குட்பட்டவை.',
        crops: 'பயிர்கள்',
        market: 'சந்தை',
        weather: 'வானிலை',
        education: 'கல்வி',
        settings: 'அமைப்புகள்',
        language: 'மொழி',
        notifications: 'அறிவிப்புகள்',
        profile: 'சுயவிவரம்',
        save_for_offline: 'ஆஃப்லைன் பயன்பாட்டிற்காக சேமிக்கவும்',
        saved_videos: 'சேமித்த வீடியோக்கள்',
        syncing: 'தரவு ஒத்திசைவு செய்யப்படுகிறது...',
        sync_complete: 'ஒத்திசைவு முடிந்தது',
        crop_management: 'பயிர் மேலாண்மை',
        pest_control: 'பூச்சி கட்டுப்பாடு',
        irrigation: 'நீர்ப்பாசனம்',
        harvesting: 'அறுவடை',
        storage: 'சேமிப்பு',
        soil_health: 'மண் ஆரோக்கியம்',
        seasonal_guide: 'பருவகால வழிகாட்டி',
    },
    kn: {
        welcome: 'ಅಗ್ರಿಕಲ್ಟ್‌ಗೆ ಸುಸ್ವಾಗತ',
        offline_message: 'ನೀವು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಕೆಲವು ವೈಶಿಷ್ಟ್ಯಗಳು ಸೀಮಿತವಾಗಿರಬಹುದು.',
        crops: 'ಬೆಳೆಗಳು',
        market: 'ಮಾರುಕಟ್ಟೆ',
        weather: 'ಹವಾಮಾನ',
        education: 'ಶಿಕ್ಷಣ',
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        language: 'ಭಾಷೆ',
        notifications: 'ಅಧಿಸೂಚನೆಗಳು',
        profile: 'ಪ್ರೊಫೈಲ್',
        save_for_offline: 'ಆಫ್‌ಲೈನ್ ಬಳಕೆಗೆ ಉಳಿಸಿ',
        saved_videos: 'ಉಳಿಸಿದ ವೀಡಿಯೊಗಳು',
        syncing: 'ಡೇಟಾ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...',
        sync_complete: 'ಸಿಂಕ್ ಪೂರ್ಣಗೊಂಡಿದೆ',
        crop_management: 'ಬೆಳೆ ನಿರ್ವಹಣೆ',
        pest_control: 'ಕೀಟ ನಿಯಂತ್ರಣ',
        irrigation: 'ನೀರಾವರಿ',
        harvesting: 'ಕೊಯ್ಲು',
        storage: 'ಸಂಗ್ರಹಣೆ',
        soil_health: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
        seasonal_guide: 'ಋತುಮಾನ ಮಾರ್ಗದರ್ಶಿ',
    }
};

// Create i18n instance
const i18n = new I18n(translations);

// LocalizationProvider component
export const LocalizationProvider = ({ children }) => {
    const [locale, setLocale] = useState(Localization.locale.split('-')[0]);
    const [initialized, setInitialized] = useState(false);

    // Load saved locale from storage on mount
    useEffect(() => {
        const loadSavedLocale = async () => {
            try {
                const savedLocale = await offlineManager.getData('USER_LOCALE');
                if (savedLocale && translations[savedLocale]) {
                    setLocale(savedLocale);
                } else {
                    // Use device locale if supported, otherwise fall back to English
                    const deviceLocale = Localization.locale.split('-')[0];
                    const supportedLocale = translations[deviceLocale] ? deviceLocale : 'en';
                    setLocale(supportedLocale);
                    await offlineManager.storeData('USER_LOCALE', supportedLocale, true);
                }
            } catch (error) {
                console.error('Failed to load locale:', error);
            } finally {
                setInitialized(true);
            }
        };

        loadSavedLocale();
    }, []);

    // Set i18n locale
    i18n.locale = locale;

    // Function to change locale
    const changeLocale = async (newLocale) => {
        if (translations[newLocale]) {
            setLocale(newLocale);
            await offlineManager.storeData('USER_LOCALE', newLocale, true);
        }
    };

    // Get supported locales for dropdown
    const getSupportedLocales = () => {
        return Object.keys(translations).map(code => ({
            code,
            name: getLanguageName(code),
        }));
    };

    // Get human-readable language name
    const getLanguageName = (code) => {
        const languageNames = {
            en: 'English',
            hi: 'हिन्दी (Hindi)',
            te: 'తెలుగు (Telugu)',
            ta: 'தமிழ் (Tamil)',
            kn: 'ಕನ್ನಡ (Kannada)',
        };
        return languageNames[code] || code;
    };

    const localizationContext = {
        t: (key, config) => i18n.t(key, config),
        locale,
        changeLocale,
        getSupportedLocales,
        isRTL: Localization.isRTL,
        initialized,
    };

    if (!initialized) {
        // Return empty view while loading locale
        return null;
    }

    return (
        <LocalizationContext.Provider value={localizationContext}>
            {children}
        </LocalizationContext.Provider>
    );
};

// Custom hook for accessing localization context
export const useLocalization = () => useContext(LocalizationContext);

export default LocalizationContext; 