import React, { createContext, useState, useContext, useEffect } from 'react';
import { useOffline } from './OfflineContext';
import { useAuth } from './AuthContext';
import apiClient from '../config/apiClient';
import { ENDPOINTS } from '../config/api';
import * as Location from 'expo-location'; // Direct import for Expo

// Mock data for weather (fallback when offline or during development)
const MOCK_WEATHER_DATA = {
    currentWeather: {
        temp: 25,
        condition: 'Sunny',
        windSpeed: 12,
        humidity: 60,
        pressure: 1013,
        description: 'Clear sky',
        icon: '01d',
        location: 'Sample Location'
    },
    forecast: [
        { day: 'Mon', temp: 26, condition: 'Sunny', icon: '01d' },
        { day: 'Tue', temp: 24, condition: 'Partially cloudy', icon: '02d' },
        { day: 'Wed', temp: 22, condition: 'Rain', icon: '10d' },
        { day: 'Thu', temp: 23, condition: 'Cloudy', icon: '03d' },
        { day: 'Fri', temp: 25, condition: 'Sunny', icon: '01d' }
    ],
    alerts: [],
    location: {
        latitude: 37.7749,
        longitude: -122.4194
    },
    lastUpdated: new Date()
};

// Create the context
export const WeatherContext = createContext();

// Weather provider component
export const WeatherProvider = ({ children }) => {
    const [weatherState, setWeatherState] = useState({
        currentWeather: MOCK_WEATHER_DATA.currentWeather,
        forecast: MOCK_WEATHER_DATA.forecast,
        alerts: MOCK_WEATHER_DATA.alerts,
        location: MOCK_WEATHER_DATA.location,
        lastUpdated: MOCK_WEATHER_DATA.lastUpdated,
        isLoading: false,
        error: null,
    });

    const { isOffline, storeOfflineData, getOfflineData } = useOffline();
    const { isAuthenticated } = useAuth();

    // Get user's location
    const getUserLocation = async () => {
        try {
            // Check if we have permission
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setWeatherState(prev => ({
                    ...prev,
                    error: 'Permission to access location was denied',
                }));
                return null;
            }

            // Get current position
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting location:', error);
            setWeatherState(prev => ({
                ...prev,
                error: 'Unable to determine your location',
            }));
            return null;
        }
    };

    // Fetch current weather data
    const fetchCurrentWeather = async (coords) => {
        if (isOffline) {
            try {
                const cachedWeather = await getOfflineData('current_weather');
                if (cachedWeather) {
                    return JSON.parse(cachedWeather);
                }
            } catch (error) {
                console.error('Error getting cached weather:', error);
            }
            return MOCK_WEATHER_DATA.currentWeather;
        }

        try {
            const response = await apiClient.get(ENDPOINTS.WEATHER.CURRENT, {
                params: {
                    lat: coords.latitude,
                    lon: coords.longitude,
                },
            });

            const weatherData = response.data.data;

            // Cache the weather data for offline use
            await storeOfflineData('current_weather', JSON.stringify(weatherData));

            return weatherData;
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw new Error('Failed to fetch current weather data');
        }
    };

    // Fetch forecast data
    const fetchForecast = async (coords) => {
        if (isOffline) {
            try {
                const cachedForecast = await getOfflineData('weather_forecast');
                if (cachedForecast) {
                    return JSON.parse(cachedForecast);
                }
            } catch (error) {
                console.error('Error getting cached forecast:', error);
            }
            return MOCK_WEATHER_DATA.forecast;
        }

        try {
            const response = await apiClient.get(ENDPOINTS.WEATHER.FORECAST, {
                params: {
                    lat: coords.latitude,
                    lon: coords.longitude,
                    days: 5, // 5-day forecast
                },
            });

            const forecastData = response.data.data;

            // Cache the forecast data for offline use
            await storeOfflineData('weather_forecast', JSON.stringify(forecastData));

            return forecastData;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw new Error('Failed to fetch forecast data');
        }
    };

    // Fetch weather alerts
    const fetchAlerts = async (coords) => {
        if (isOffline) {
            try {
                const cachedAlerts = await getOfflineData('weather_alerts');
                if (cachedAlerts) {
                    return JSON.parse(cachedAlerts);
                }
            } catch (error) {
                console.error('Error getting cached alerts:', error);
            }
            return [];
        }

        try {
            const response = await apiClient.get(ENDPOINTS.WEATHER.ALERTS, {
                params: {
                    lat: coords.latitude,
                    lon: coords.longitude,
                },
            });

            const alertsData = response.data.data.alerts;

            // Cache the alerts data for offline use
            await storeOfflineData('weather_alerts', JSON.stringify(alertsData));

            return alertsData;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return []; // Return empty array on error
        }
    };

    // Load all weather data
    const loadWeatherData = async (coords = null) => {
        setWeatherState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Get coordinates if not provided
            const coordinates = coords || await getUserLocation();

            if (!coordinates) {
                setWeatherState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Could not determine location',
                }));
                return;
            }

            // Fetch all weather data in parallel
            const [currentWeather, forecast, alerts] = await Promise.all([
                fetchCurrentWeather(coordinates),
                fetchForecast(coordinates),
                fetchAlerts(coordinates),
            ]);

            setWeatherState({
                currentWeather,
                forecast,
                alerts: alerts || [],
                location: coordinates,
                lastUpdated: new Date(),
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error('Error loading weather data:', error);
            setWeatherState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to load weather data',
            }));
        }
    };

    // Load weather data on initial render if user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadWeatherData();
        }
    }, [isAuthenticated]);

    // Weather context value
    const weatherContext = {
        ...weatherState,
        refreshWeather: loadWeatherData,
        fetchCurrentWeather,
        fetchWeatherForecast: fetchForecast,
        fetchWeatherAlerts: fetchAlerts,
        refreshWeatherData: loadWeatherData,
    };

    return (
        <WeatherContext.Provider value={weatherContext}>
            {children}
        </WeatherContext.Provider>
    );
};

// Custom hook to use the weather context
export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (context === undefined) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
}; 