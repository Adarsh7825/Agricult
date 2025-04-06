import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';
import { useLocalization } from '../context/LocalizationContext';
import { useWeather } from '../context/WeatherContext';

const WeatherScreen = () => {
    const { isOffline } = useOffline();
    const { t, locale } = useLocalization();
    const {
        currentWeather,
        forecast,
        alerts,
        isLoading,
        error,
        lastUpdated,
        fetchCurrentWeather,
        fetchWeatherForecast,
        fetchWeatherAlerts,
        refreshWeatherData
    } = useWeather();

    const [refreshing, setRefreshing] = useState(false);
    const [userLocation, setUserLocation] = useState({ lat: 28.6139, lon: 77.2090 }); // Default: Delhi

    useEffect(() => {
        loadWeatherData();
    }, []);

    const loadWeatherData = async () => {
        try {
            // Load weather data from API or cache
            await fetchCurrentWeather({ lat: userLocation.lat, lon: userLocation.lon });
            await fetchWeatherForecast({ lat: userLocation.lat, lon: userLocation.lon, days: 5 });
            await fetchWeatherAlerts({ lat: userLocation.lat, lon: userLocation.lon });
        } catch (err) {
            console.error('Failed to load weather data:', err);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshWeatherData({ lat: userLocation.lat, lon: userLocation.lon, days: 5 });
        } catch (err) {
            console.error('Failed to refresh weather data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(locale, options);
    };

    // Get weather icon
    const getWeatherIcon = (condition) => {
        const conditions = {
            'Clear': 'sunny',
            'Sunny': 'sunny',
            'Partly cloudy': 'partly-sunny',
            'Cloudy': 'cloudy',
            'Overcast': 'cloudy',
            'Mist': 'cloud',
            'Patchy rain possible': 'rainy',
            'Patchy snow possible': 'snow',
            'Patchy sleet possible': 'snow',
            'Patchy freezing drizzle possible': 'snow',
            'Thundery outbreaks possible': 'thunderstorm',
            'Blowing snow': 'snow',
            'Blizzard': 'snow',
            'Fog': 'cloud',
            'Freezing fog': 'cloud',
            'Patchy light drizzle': 'rainy',
            'Light drizzle': 'rainy',
            'Freezing drizzle': 'snow',
            'Heavy freezing drizzle': 'snow',
            'Patchy light rain': 'rainy',
            'Light rain': 'rainy',
            'Moderate rain at times': 'rainy',
            'Moderate rain': 'rainy',
            'Heavy rain at times': 'rainy',
            'Heavy rain': 'rainy',
            'Light freezing rain': 'snow',
            'Moderate or heavy freezing rain': 'snow',
            'Light sleet': 'snow',
            'Moderate or heavy sleet': 'snow',
            'Patchy light snow': 'snow',
            'Light snow': 'snow',
            'Patchy moderate snow': 'snow',
            'Moderate snow': 'snow',
            'Patchy heavy snow': 'snow',
            'Heavy snow': 'snow',
            'Ice pellets': 'snow',
            'Light rain shower': 'rainy',
            'Moderate or heavy rain shower': 'rainy',
            'Torrential rain shower': 'rainy',
            'Light sleet showers': 'snow',
            'Moderate or heavy sleet showers': 'snow',
            'Light snow showers': 'snow',
            'Moderate or heavy snow showers': 'snow',
            'Light showers of ice pellets': 'snow',
            'Moderate or heavy showers of ice pellets': 'snow',
            'Patchy light rain with thunder': 'thunderstorm',
            'Moderate or heavy rain with thunder': 'thunderstorm',
            'Patchy light snow with thunder': 'thunderstorm',
            'Moderate or heavy snow with thunder': 'thunderstorm',
        };

        return conditions[condition] || 'cloud';
    };

    // Render alerts section
    const renderAlerts = () => {
        if (!alerts || alerts.length === 0) {
            return null;
        }

        return (
            <View style={styles.alertsContainer}>
                <Text style={styles.alertsTitle}>{t('weather_alerts')}</Text>
                {alerts.map((alert, index) => (
                    <View key={index} style={styles.alertItem}>
                        <MaterialCommunityIcons name="alert" size={24} color="#e74c3c" />
                        <View style={styles.alertContent}>
                            <Text style={styles.alertHeadline}>{alert.headline}</Text>
                            <Text style={styles.alertDetails}>{alert.event} - {alert.severity}</Text>
                            <Text style={styles.alertAreas}>{t('affected_areas')}: {alert.areas}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    if (isLoading && !currentWeather && !forecast) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3E7D44" />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !currentWeather && !forecast) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={50} color="#F57C00" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorSubtext}>{t('weather_error')}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadWeatherData}>
                        <Text style={styles.retryButtonText}>{t('retry')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!currentWeather || !forecast) {
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
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Current Weather */}
                <View style={styles.currentWeatherContainer}>
                    <Text style={styles.locationText}>
                        {currentWeather.location.name}, {currentWeather.location.country}
                    </Text>

                    <View style={styles.weatherMain}>
                        <Ionicons
                            name={getWeatherIcon(currentWeather.current.condition.text)}
                            size={80}
                            color="#3E7D44"
                        />
                        <Text style={styles.tempText}>
                            {Math.round(currentWeather.current.temperature.c)}°C
                        </Text>
                    </View>

                    <Text style={styles.weatherDescription}>
                        {currentWeather.current.condition.text}
                    </Text>

                    <View style={styles.weatherDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="water" size={22} color="#3E7D44" />
                            <Text style={styles.detailText}>
                                {currentWeather.current.humidity}%
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="speedometer" size={22} color="#3E7D44" />
                            <Text style={styles.detailText}>
                                {currentWeather.current.wind.kph} km/h
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Weather Alerts */}
                {renderAlerts()}

                {/* 5-Day Forecast */}
                <View style={styles.forecastContainer}>
                    <Text style={styles.forecastTitle}>{t('5_day_forecast')}</Text>

                    {forecast.forecast.map((day, index) => (
                        <View key={index} style={styles.forecastDay}>
                            <Text style={styles.dayText}>{formatDate(day.date)}</Text>

                            <View style={styles.dayDetails}>
                                <Ionicons
                                    name={getWeatherIcon(day.condition)}
                                    size={28}
                                    color="#3E7D44"
                                />

                                <View style={styles.tempRange}>
                                    <Text style={styles.maxTemp}>{Math.round(day.maxTemp)}°</Text>
                                    <Text style={styles.minTemp}>{Math.round(day.minTemp)}°</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Last Updated */}
                <View style={styles.lastUpdatedContainer}>
                    <Ionicons name="time-outline" size={16} color="#757575" />
                    <Text style={styles.lastUpdatedText}>
                        {t('last_updated')}: {lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}
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
    retryButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#3E7D44',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
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
        textAlign: 'center',
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
    alertsContainer: {
        backgroundColor: '#FFEBEE',
        borderRadius: 10,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    alertsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#C62828',
        marginBottom: 16,
    },
    alertItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FFCDD2',
    },
    alertContent: {
        flex: 1,
        marginLeft: 10,
    },
    alertHeadline: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    alertDetails: {
        fontSize: 14,
        color: '#666666',
        marginVertical: 4,
    },
    alertAreas: {
        fontSize: 12,
        color: '#757575',
    },
});

export default WeatherScreen; 