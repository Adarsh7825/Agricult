import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';
import { useLocalization } from '../context/LocalizationContext';
import offlineManager from '../utils/OfflineManager';

// Mock weather data for offline usage
const mockWeatherData = {
    current: {
        temp: 28,
        humidity: 65,
        wind_speed: 5.2,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
    },
    daily: [
        {
            dt: Date.now() / 1000,
            temp: { min: 22, max: 30 },
            weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        },
        {
            dt: Date.now() / 1000 + 86400,
            temp: { min: 23, max: 31 },
            weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
        },
        {
            dt: Date.now() / 1000 + 86400 * 2,
            temp: { min: 24, max: 29 },
            weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        },
        {
            dt: Date.now() / 1000 + 86400 * 3,
            temp: { min: 22, max: 28 },
            weather: [{ main: 'Rain', description: 'moderate rain', icon: '10d' }],
        },
        {
            dt: Date.now() / 1000 + 86400 * 4,
            temp: { min: 21, max: 27 },
            weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04d' }],
        },
    ],
    location: 'Default Location'
};

const WeatherScreen = () => {
    const { isOffline } = useOffline();
    const { t, locale } = useLocalization();

    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const fetchWeatherData = async () => {
        try {
            setLoading(true);

            // Check for cached weather data
            const cachedWeather = await offlineManager.getData('CACHED_WEATHER');
            const cachedTime = await offlineManager.getData('WEATHER_CACHE_TIME');

            if (isOffline) {
                // In offline mode, use cached data or mock data
                if (cachedWeather) {
                    setWeatherData(cachedWeather);
                    setLastUpdated(new Date(cachedTime || Date.now()).toLocaleString());
                } else {
                    // Use mock data if no cached data available
                    setWeatherData(mockWeatherData);
                    setLastUpdated(t('offline_data'));
                }
            } else {
                // In online mode
                const cacheExpired = !cachedTime || (Date.now() - cachedTime > 60 * 60 * 1000); // 1 hour

                if (cacheExpired) {
                    // Simulate API call
                    // In a real app, this would be a fetch call to a weather API
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // For the MVP, we'll use mock data as if it came from an API
                    const apiData = { ...mockWeatherData, location: 'Current Location' };

                    // Cache the new data
                    await offlineManager.storeData('CACHED_WEATHER', apiData, true);
                    await offlineManager.storeData('WEATHER_CACHE_TIME', Date.now(), true);

                    setWeatherData(apiData);
                    setLastUpdated(new Date().toLocaleString());
                } else {
                    // Use cached data if it's still valid
                    setWeatherData(cachedWeather);
                    setLastUpdated(new Date(cachedTime).toLocaleString());
                }
            }
        } catch (err) {
            console.error('Failed to fetch weather data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Format date from timestamp
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(locale, options);
    };

    // Get weather icon
    const getWeatherIcon = (iconCode) => {
        // In a real app, we would use actual weather icons from the API
        // For MVP, we'll use Ionicons based on the weather condition
        switch (iconCode.substr(0, 2)) {
            case '01': return 'sunny';
            case '02': return 'partly-sunny';
            case '03':
            case '04': return 'cloudy';
            case '09':
            case '10': return 'rainy';
            case '11': return 'thunderstorm';
            case '13': return 'snow';
            case '50': return 'cloud';
            default: return 'cloud';
        }
    };

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

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={50} color="#F57C00" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorSubtext}>{t('weather_error')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Current Weather */}
                <View style={styles.currentWeatherContainer}>
                    <Text style={styles.locationText}>{weatherData.location}</Text>

                    <View style={styles.weatherMain}>
                        <Ionicons
                            name={getWeatherIcon(weatherData.current.weather[0].icon)}
                            size={80}
                            color="#3E7D44"
                        />
                        <Text style={styles.tempText}>{Math.round(weatherData.current.temp)}°C</Text>
                    </View>

                    <Text style={styles.weatherDescription}>
                        {weatherData.current.weather[0].description}
                    </Text>

                    <View style={styles.weatherDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="water" size={22} color="#3E7D44" />
                            <Text style={styles.detailText}>
                                {weatherData.current.humidity}%
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="speedometer" size={22} color="#3E7D44" />
                            <Text style={styles.detailText}>
                                {weatherData.current.wind_speed} km/h
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 5-Day Forecast */}
                <View style={styles.forecastContainer}>
                    <Text style={styles.forecastTitle}>{t('5_day_forecast')}</Text>

                    {weatherData.daily.map((day, index) => (
                        <View key={index} style={styles.forecastDay}>
                            <Text style={styles.dayText}>{formatDate(day.dt)}</Text>

                            <View style={styles.dayDetails}>
                                <Ionicons
                                    name={getWeatherIcon(day.weather[0].icon)}
                                    size={28}
                                    color="#3E7D44"
                                />

                                <View style={styles.tempRange}>
                                    <Text style={styles.maxTemp}>{Math.round(day.temp.max)}°</Text>
                                    <Text style={styles.minTemp}>{Math.round(day.temp.min)}°</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Last Updated */}
                <View style={styles.lastUpdatedContainer}>
                    <Ionicons name="time-outline" size={16} color="#757575" />
                    <Text style={styles.lastUpdatedText}>
                        {t('last_updated')}: {lastUpdated}
                    </Text>
                </View>

                {/* Offline Notice */}
                {isOffline && (
                    <View style={styles.offlineNotice}>
                        <Ionicons name="cloud-offline" size={20} color="#F57C00" />
                        <Text style={styles.offlineText}>{t('offline_weather_notice')}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        paddingBottom: 20,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: '#666666',
        textAlign: 'center',
    },
    errorSubtext: {
        marginTop: 8,
        color: '#999999',
        textAlign: 'center',
    },
    currentWeatherContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        margin: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    locationText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    weatherMain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    tempText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#333333',
        marginLeft: 20,
    },
    weatherDescription: {
        fontSize: 18,
        color: '#666666',
        textTransform: 'capitalize',
        marginBottom: 20,
    },
    weatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 16,
        color: '#666666',
        marginLeft: 8,
    },
    forecastContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    forecastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 16,
    },
    forecastDay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dayText: {
        fontSize: 16,
        color: '#666666',
    },
    dayDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tempRange: {
        flexDirection: 'row',
        width: 80,
        justifyContent: 'flex-end',
        marginLeft: 16,
    },
    maxTemp: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginRight: 8,
    },
    minTemp: {
        fontSize: 16,
        color: '#999999',
    },
    lastUpdatedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    lastUpdatedText: {
        fontSize: 12,
        color: '#757575',
        marginLeft: 4,
    },
    offlineNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        borderRadius: 10,
        marginHorizontal: 16,
        marginTop: 10,
        padding: 10,
    },
    offlineText: {
        fontSize: 14,
        color: '#F57C00',
        marginLeft: 8,
    },
});

export default WeatherScreen; 