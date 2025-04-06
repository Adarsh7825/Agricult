const axios = require('axios');

// Helper function to make weather API calls
const fetchWeatherData = async (endpoint, params) => {
    try {
        const response = await axios.get(`https://api.weatherapi.com/v1/${endpoint}`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                ...params,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Weather API error:', error.response?.data || error.message);
        throw new Error('Failed to fetch weather data');
    }
};

// Get current weather
exports.getCurrentWeather = async (req, res, next) => {
    try {
        const { lat, lon, q } = req.query;

        // Require either coordinates or location query
        if (!q && (!lat || !lon)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide location coordinates (lat & lon) or a location query (q)'
            });
        }

        // Set up query parameter
        const queryParam = q || `${lat},${lon}`;

        // Fetch weather data
        const weatherData = await fetchWeatherData('current.json', { q: queryParam });

        // Format response
        const response = {
            location: {
                name: weatherData.location.name,
                region: weatherData.location.region,
                country: weatherData.location.country,
                coordinates: {
                    lat: weatherData.location.lat,
                    lon: weatherData.location.lon,
                },
                localtime: weatherData.location.localtime,
            },
            current: {
                temperature: {
                    c: weatherData.current.temp_c,
                    f: weatherData.current.temp_f,
                },
                condition: {
                    text: weatherData.current.condition.text,
                    icon: weatherData.current.condition.icon,
                    code: weatherData.current.condition.code,
                },
                wind: {
                    kph: weatherData.current.wind_kph,
                    mph: weatherData.current.wind_mph,
                    degree: weatherData.current.wind_degree,
                    direction: weatherData.current.wind_dir,
                },
                precipitation: {
                    mm: weatherData.current.precip_mm,
                    in: weatherData.current.precip_in,
                },
                humidity: weatherData.current.humidity,
                cloud: weatherData.current.cloud,
                feelslike: {
                    c: weatherData.current.feelslike_c,
                    f: weatherData.current.feelslike_f,
                },
                uv: weatherData.current.uv,
                lastUpdated: weatherData.current.last_updated,
            },
        };

        res.status(200).json({
            success: true,
            data: response,
            message: 'Current weather retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get weather forecast
exports.getWeatherForecast = async (req, res, next) => {
    try {
        const { lat, lon, q, days = 3 } = req.query;

        // Require either coordinates or location query
        if (!q && (!lat || !lon)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide location coordinates (lat & lon) or a location query (q)'
            });
        }

        // Set up query parameter
        const queryParam = q || `${lat},${lon}`;

        // Validate days parameter
        const forecastDays = Math.min(Math.max(parseInt(days), 1), 7); // Between 1 and 7 days

        // Fetch forecast data
        const forecastData = await fetchWeatherData('forecast.json', {
            q: queryParam,
            days: forecastDays,
            aqi: 'yes', // Include air quality data
            alerts: 'yes', // Include weather alerts
        });

        // Format response - simplified version for farmers
        const response = {
            location: {
                name: forecastData.location.name,
                region: forecastData.location.region,
                country: forecastData.location.country,
                coordinates: {
                    lat: forecastData.location.lat,
                    lon: forecastData.location.lon,
                },
                localtime: forecastData.location.localtime,
            },
            current: {
                temperature: forecastData.current.temp_c,
                condition: forecastData.current.condition.text,
                icon: forecastData.current.condition.icon,
                precipitation: forecastData.current.precip_mm,
                humidity: forecastData.current.humidity,
                wind: {
                    speed: forecastData.current.wind_kph,
                    direction: forecastData.current.wind_dir,
                },
                uv: forecastData.current.uv,
            },
            forecast: forecastData.forecast.forecastday.map(day => ({
                date: day.date,
                maxTemp: day.day.maxtemp_c,
                minTemp: day.day.mintemp_c,
                avgTemp: day.day.avgtemp_c,
                condition: day.day.condition.text,
                icon: day.day.condition.icon,
                chanceOfRain: day.day.daily_chance_of_rain,
                totalPrecipitation: day.day.totalprecip_mm,
                avgHumidity: day.day.avghumidity,
                sunrise: day.astro.sunrise,
                sunset: day.astro.sunset,
                hourly: day.hour.map(hour => ({
                    time: hour.time,
                    temp: hour.temp_c,
                    condition: hour.condition.text,
                    icon: hour.condition.icon,
                    chanceOfRain: hour.chance_of_rain,
                    precipitation: hour.precip_mm,
                    humidity: hour.humidity,
                    windSpeed: hour.wind_kph,
                    windDirection: hour.wind_dir,
                })),
            })),
            alerts: forecastData.alerts?.alert || [], // Weather alerts
        };

        res.status(200).json({
            success: true,
            data: response,
            message: 'Weather forecast retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get weather for specific location
exports.getWeatherByLocation = async (req, res, next) => {
    try {
        const { locationId } = req.params;

        if (!locationId) {
            return res.status(400).json({
                success: false,
                message: 'Location ID is required'
            });
        }

        // Fetch weather data
        const weatherData = await fetchWeatherData('current.json', { q: locationId });

        // Format response
        const response = {
            location: {
                name: weatherData.location.name,
                region: weatherData.location.region,
                country: weatherData.location.country,
                coordinates: {
                    lat: weatherData.location.lat,
                    lon: weatherData.location.lon,
                },
                localtime: weatherData.location.localtime,
            },
            current: {
                temperature: weatherData.current.temp_c,
                condition: weatherData.current.condition.text,
                icon: weatherData.current.condition.icon,
                precipitation: weatherData.current.precip_mm,
                humidity: weatherData.current.humidity,
                wind: {
                    speed: weatherData.current.wind_kph,
                    direction: weatherData.current.wind_dir,
                },
                uv: weatherData.current.uv,
            },
        };

        res.status(200).json({
            success: true,
            data: response,
            message: 'Weather for location retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get weather alerts for region
exports.getWeatherAlerts = async (req, res, next) => {
    try {
        const { lat, lon, q } = req.query;

        // Require either coordinates or location query
        if (!q && (!lat || !lon)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide location coordinates (lat & lon) or a location query (q)'
            });
        }

        // Set up query parameter
        const queryParam = q || `${lat},${lon}`;

        // Fetch forecast data with alerts
        const forecastData = await fetchWeatherData('forecast.json', {
            q: queryParam,
            days: 1, // Minimum days required
            alerts: 'yes',
        });

        // Extract alerts
        const alerts = forecastData.alerts?.alert || [];

        res.status(200).json({
            success: true,
            data: {
                location: {
                    name: forecastData.location.name,
                    region: forecastData.location.region,
                    country: forecastData.location.country,
                },
                alerts: alerts.map(alert => ({
                    headline: alert.headline,
                    severity: alert.severity,
                    urgency: alert.urgency,
                    areas: alert.areas,
                    category: alert.category,
                    event: alert.event,
                    effective: alert.effective,
                    expires: alert.expires,
                    description: alert.desc,
                    instruction: alert.instruction,
                })),
            },
            message: 'Weather alerts retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
}; 