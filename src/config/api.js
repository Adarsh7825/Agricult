// API base URL - will be different in development vs production
export const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.agricult.example.com/api'
    : 'http://localhost:4000/api';

// API request timeout in milliseconds
export const API_TIMEOUT = 15000;

// API endpoints
export const ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        RESET_PASSWORD: '/auth/forgot-password',
        CHECK: '/auth/check',
    },

    // User endpoints
    USER: {
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/profile',
        CHANGE_PASSWORD: '/user/change-password',
    },

    // Weather endpoints
    WEATHER: {
        CURRENT: '/weather/current',
        FORECAST: '/weather/forecast',
        ALERTS: '/weather/alerts',
    },

    // Market endpoints
    MARKET: {
        PRODUCTS: '/market/products',
        PRODUCT_DETAIL: (id) => `/market/products/${id}`,
        PRICES: '/market/prices',
        PRICES_BY_LOCATION: (locationId) => `/market/prices/location/${locationId}`,
        LOCATIONS: '/market/locations',
    },

    // Content endpoints
    CONTENT: {
        EDUCATIONAL: '/content/educational',
        EDUCATIONAL_BY_ID: (id) => `/content/educational/${id}`,
        NEWS: '/content/news',
        NEWS_BY_ID: (id) => `/content/news/${id}`,
    },
};

// Default headers for all requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Error codes and messages
export const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    SERVER_ERROR: 'SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
};

// API response status codes
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
}; 