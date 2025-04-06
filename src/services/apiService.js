import apiClient from '../config/apiClient';
import { ENDPOINTS } from '../config/api';
import axios from 'axios';

// Authentication API
export const authAPI = {
    login: (credentials) => apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => apiClient.post(ENDPOINTS.AUTH.REGISTER, userData),
    logout: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
    refreshToken: () => apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN),
    resetPassword: (email) => apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { email }),
    checkAuth: () => apiClient.get(ENDPOINTS.AUTH.CHECK),
};

// User API
export const userAPI = {
    getProfile: () => apiClient.get(ENDPOINTS.USER.PROFILE),
    updateProfile: (userData) => apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, userData),
    changePassword: (passwordData) => apiClient.post(ENDPOINTS.USER.CHANGE_PASSWORD, passwordData),
};

// Weather API
export const weatherAPI = {
    getCurrentWeather: (params) => apiClient.get(ENDPOINTS.WEATHER.CURRENT, { params }),
    getWeatherForecast: (params) => apiClient.get(ENDPOINTS.WEATHER.FORECAST, { params }),
    getWeatherAlerts: (params) => apiClient.get(ENDPOINTS.WEATHER.ALERTS, { params }),
};

// Market API
export const marketAPI = {
    getProducts: (params) => apiClient.get(ENDPOINTS.MARKET.PRODUCTS, { params }),
    getProductDetail: (id) => apiClient.get(ENDPOINTS.MARKET.PRODUCT_DETAIL(id)),
    getPrices: (params) => apiClient.get(ENDPOINTS.MARKET.PRICES, { params }),
    getPricesByLocation: (locationId, params) =>
        apiClient.get(ENDPOINTS.MARKET.PRICES_BY_LOCATION(locationId), { params }),
    getLocations: () => apiClient.get(ENDPOINTS.MARKET.LOCATIONS),
};

// Content API
export const contentAPI = {
    getEducationalContent: (params) => apiClient.get(ENDPOINTS.CONTENT.EDUCATIONAL, { params }),
    getEducationalContentById: (id) => apiClient.get(ENDPOINTS.CONTENT.EDUCATIONAL_BY_ID(id)),
    getNews: (params) => apiClient.get(ENDPOINTS.CONTENT.NEWS, { params }),
    getNewsById: (id) => apiClient.get(ENDPOINTS.CONTENT.NEWS_BY_ID(id)),
};

// Chat API - connects to Flask server
export const chatAPI = {
    sendMessage: (query) => {
        // Direct API call to Flask server instead of going through our main API
        return axios.post('http://localhost:5000/chat', { query });
    }
};

export default {
    authAPI,
    userAPI,
    weatherAPI,
    marketAPI,
    contentAPI,
    chatAPI,
}; 