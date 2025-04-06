import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_TIMEOUT, DEFAULT_HEADERS } from './api';
import { isNetworkAvailable } from '../utils/networkUtils';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: DEFAULT_HEADERS,
});

// Request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        // Check network status
        const networkAvailable = await isNetworkAvailable();
        if (!networkAvailable) {
            // If we're offline, reject the request with a custom error
            return Promise.reject({
                response: {
                    status: 0,
                    data: {
                        message: 'Network unavailable',
                        isOfflineError: true,
                    },
                },
            });
        }

        // Get token from storage
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            // Add authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Any status code that lies within the range of 2xx
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle token expiration - attempt to refresh token and retry
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('auth_token')}`,
                    },
                });

                // If token refresh is successful
                if (res.status === 200) {
                    const newToken = res.data.token;

                    // Store the new token
                    await AsyncStorage.setItem('auth_token', newToken);

                    // Update authorization header with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                    // Retry the original request
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // If refresh token fails, redirect to login
                await AsyncStorage.removeItem('auth_token');
                return Promise.reject(refreshError);
            }
        }

        // Network errors handling
        if (!error.response) {
            // No response from server (network issue)
            return Promise.reject({
                ...error,
                response: {
                    status: 0,
                    data: {
                        message: 'Network error, please check your connection',
                        isNetworkError: true,
                    },
                },
            });
        }

        // Pass the error down the chain
        return Promise.reject(error);
    }
);

export default apiClient; 