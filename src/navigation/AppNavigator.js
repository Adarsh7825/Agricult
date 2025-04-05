import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../context/LocalizationContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EducationScreen from '../screens/EducationScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const AppNavigator = () => {
    const { t } = useLocalization();

    return (
        <NavigationContainer>
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
                    component={HomeScreen}
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
        </NavigationContainer>
    );
};

export default AppNavigator; 