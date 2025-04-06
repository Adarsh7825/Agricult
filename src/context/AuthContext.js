import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, ENDPOINTS } from '../config/api';
import { useOffline } from './OfflineContext';
import apiClient from '../config/apiClient';

// Create context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    const { isOffline, storeOfflineData, getOfflineData } = useOffline();

    // Initialize auth state from AsyncStorage on app load
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('auth_token');
                const storedUser = await AsyncStorage.getItem('auth_user');

                if (storedToken && storedUser) {
                    // Set auth token as default for all future axios requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                    setAuthState({
                        token: storedToken,
                        user: JSON.parse(storedUser),
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    setAuthState({
                        token: null,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error) {
                console.error('Failed to load auth state', error);
                setAuthState({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Failed to load authentication state',
                });
            }
        };

        loadAuthState();
    }, []);

    // Login function
    const login = async (email, password) => {
        if (isOffline) {
            // Check if we have cached credentials
            try {
                const cachedUser = await getOfflineData('auth_user');
                const cachedCredentials = await getOfflineData('auth_credentials');

                if (cachedUser && cachedCredentials &&
                    cachedCredentials.email === email &&
                    cachedCredentials.password === password) {

                    setAuthState({
                        token: 'offline-token',
                        user: JSON.parse(cachedUser),
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return {
                        user: JSON.parse(cachedUser),
                        offlineMode: true
                    };
                } else {
                    throw new Error('Login failed in offline mode');
                }
            } catch (error) {
                throw new Error('Login failed in offline mode');
            }
        }

        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
                email,
                password,
            });

            const { token, user } = response.data;

            // Store in AsyncStorage
            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('auth_user', JSON.stringify(user));

            // Cache credentials for offline login
            await storeOfflineData('auth_credentials', { email, password });
            await storeOfflineData('auth_user', JSON.stringify(user));

            // Set auth token as default for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setAuthState({
                token,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { user, offlineMode: false };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';

            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));

            throw new Error(errorMessage);
        }
    };

    // Register function
    const register = async (userData) => {
        if (isOffline) {
            throw new Error('Registration is not available in offline mode');
        }

        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);

            const { token, user } = response.data;

            // Store in AsyncStorage
            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('auth_user', JSON.stringify(user));

            // Cache credentials for offline login
            await storeOfflineData('auth_credentials', {
                email: userData.email,
                password: userData.password
            });
            await storeOfflineData('auth_user', JSON.stringify(user));

            // Set auth token as default for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setAuthState({
                token,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';

            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));

            throw new Error(errorMessage);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Call logout endpoint if online
            if (!isOffline) {
                await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
            }

            // Remove auth data from AsyncStorage
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');

            // Clear auth header
            delete axios.defaults.headers.common['Authorization'];

            setAuthState({
                token: null,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error('Logout error', error);

            // Still clear local auth state even if server logout fails
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');

            delete axios.defaults.headers.common['Authorization'];

            setAuthState({
                token: null,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    };

    // Reset password function
    const resetPassword = async (email) => {
        if (isOffline) {
            throw new Error('Password reset is not available in offline mode');
        }

        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { email });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Password reset failed';
            throw new Error(errorMessage);
        }
    };

    // Update user profile
    const updateProfile = async (userData) => {
        if (isOffline) {
            throw new Error('Profile update is not available in offline mode');
        }

        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, userData);

            const updatedUser = response.data;

            // Update stored user data
            await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
            await storeOfflineData('auth_user', JSON.stringify(updatedUser));

            setAuthState(prev => ({
                ...prev,
                user: updatedUser,
                isLoading: false,
                error: null,
            }));

            return updatedUser;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Profile update failed';

            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));

            throw new Error(errorMessage);
        }
    };

    // Refresh token function
    const refreshToken = async () => {
        if (isOffline || !authState.token) {
            return false;
        }

        try {
            const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);

            const { token } = response.data;

            // Update stored token
            await AsyncStorage.setItem('auth_token', token);

            // Update auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setAuthState(prev => ({
                ...prev,
                token,
                error: null,
            }));

            return true;
        } catch (error) {
            console.error('Token refresh failed', error);

            // If token refresh fails due to invalid token, logout the user
            if (error.response?.status === 401) {
                await logout();
            }

            return false;
        }
    };

    // Check auth status (helpful for protected routes)
    const checkAuthStatus = async () => {
        if (isOffline) {
            // In offline mode, trust the locally stored authentication
            return authState.isAuthenticated;
        }

        if (!authState.token) {
            return false;
        }

        try {
            await apiClient.get(ENDPOINTS.AUTH.CHECK);
            return true;
        } catch (error) {
            // If check fails due to invalid token, try refreshing
            if (error.response?.status === 401) {
                return await refreshToken();
            }
            return false;
        }
    };

    // Context value
    const authContext = {
        ...authState,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        refreshToken,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 