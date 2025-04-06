import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';
import { useAuth } from '../context/AuthContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EducationScreen from '../screens/EducationScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import PricePredictionScreen from '../screens/PricePredictionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => {
    const { t } = useLocalization();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />
        </Stack.Navigator>
    );
};

// Education Stack Navigator
const EducationStack = () => {
    const { t } = useLocalization();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="EducationMain"
                component={EducationScreen}
            />
            <Stack.Screen
                name="VideoPlayer"
                component={VideoPlayerScreen}
                options={{
                    headerShown: true,
                    title: t('video_player'),
                    headerBackTitleVisible: false,
                }}
            />
        </Stack.Navigator>
    );
};

// Profile Stack Navigator
const ProfileStack = () => {
    const { t } = useLocalization();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    headerShown: true,
                    title: t('settings'),
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen
                name="LanguageSettings"
                component={LanguageSettingsScreen}
                options={{
                    headerShown: true,
                    title: t('language'),
                    headerBackTitleVisible: false,
                }}
            />
        </Stack.Navigator>
    );
};

// Home Stack Navigator
const HomeStack = () => {
    const { t } = useLocalization();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
            />
            <Stack.Screen
                name="Disease"
                component={DiseaseDetectionScreen}
                options={{
                    headerShown: true,
                    title: t('disease_detection'),
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen
                name="Chatbot"
                component={ChatbotScreen}
                options={{
                    headerShown: true,
                    title: t('smart_assistant'),
                    headerBackTitleVisible: false,
                }}
            />
            <Stack.Screen
                name="Prices"
                component={PricePredictionScreen}
                options={{
                    headerShown: true,
                    title: t('price_prediction'),
                    headerBackTitleVisible: false,
                }}
            />
        </Stack.Navigator>
    );
};

// Main Tab Navigator
const MainTabNavigator = () => {
    const { t } = useLocalization();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Market') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Weather') {
                        iconName = focused ? 'cloudy' : 'cloudy-outline';
                    } else if (route.name === 'Education') {
                        iconName = focused ? 'school' : 'school-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#3E7D44',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{ title: t('home') }}
            />
            <Tab.Screen
                name="Market"
                component={MarketScreen}
                options={{ title: t('market') }}
            />
            <Tab.Screen
                name="Weather"
                component={WeatherScreen}
                options={{ title: t('weather') }}
            />
            <Tab.Screen
                name="Education"
                component={EducationStack}
                options={{ title: t('education') }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{ title: t('profile') }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading screen while checking authentication
    if (isLoading) {
        return null;
    }

    return isAuthenticated ? <MainTabNavigator /> : <AuthStack />;
};

export default AppNavigator; 