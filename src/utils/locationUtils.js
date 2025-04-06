// Wrapper for location services that works in web and mobile environments
// This utility handles the platform differences between web and native

// Only use this utility on web platform
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isExpo = !isReactNative && typeof document === 'undefined';
const isWeb = !isReactNative && !isExpo && typeof document !== 'undefined';

// Safely require expo modules to avoid crashes
const safeRequire = (moduleName) => {
    if (isWeb) return null;

    try {
        return require(moduleName);
    } catch (error) {
        console.warn(`Error requiring ${moduleName}:`, error);
        return null;
    }
};

// Constants
export const Accuracy = {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
};

// Default permission status
let locationPermissionStatus = 'undetermined';

// Request location permissions
export const requestForegroundPermissionsAsync = async () => {
    // For web, check if Geolocation API is available
    if (isWeb) {
        if ('geolocation' in navigator) {
            try {
                // The web doesn't have a direct way to check permissions,
                // so we'll just return 'granted' and handle permission denials in getCurrentPositionAsync
                return { status: 'granted' };
            } catch (error) {
                console.error('Error requesting location permission:', error);
                return { status: 'denied' };
            }
        } else {
            console.warn('Geolocation API not available in this browser');
            return { status: 'denied' };
        }
    }

    // For Expo/React Native, this file shouldn't actually be used
    // This is just a fallback implementation
    try {
        return { status: 'granted' };
    } catch (error) {
        console.error('Error requesting location permissions:', error);
        return { status: 'error', error };
    }
};

// Get current position
export const getCurrentPositionAsync = async (options = {}) => {
    // For web
    if (isWeb) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        coords: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            altitude: position.coords.altitude,
                            accuracy: position.coords.accuracy,
                            altitudeAccuracy: position.coords.altitudeAccuracy,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                        },
                        timestamp: position.timestamp,
                    });
                },
                (error) => {
                    console.error('Error getting location in web:', error);
                    reject(new Error('Location permission denied or timeout'));
                },
                {
                    enableHighAccuracy: options.accuracy >= Accuracy.High,
                    timeout: options.timeout || 15000,
                    maximumAge: options.maximumAge || 0,
                }
            );
        });
    }

    // For Expo/React Native, this file shouldn't actually be used
    // This is just a fallback implementation
    return {
        coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: null,
            accuracy: 5,
            altitudeAccuracy: null,
            heading: null,
            speed: null
        },
        timestamp: Date.now()
    };
};

// Geocode an address to coordinates
export const geocodeAsync = async (address) => {
    if (isWeb) {
        try {
            console.warn('Geocoding on web requires a third-party service');
            return [{ latitude: 0, longitude: 0 }];
        } catch (error) {
            console.error('Geocoding error on web:', error);
            throw new Error('Geocoding failed on web');
        }
    }

    // For Expo/React Native, this file shouldn't actually be used
    // This is just a fallback implementation
    return [{ latitude: 0, longitude: 0 }];
};

// Reverse geocode coordinates to address
export const reverseGeocodeAsync = async (location) => {
    if (isWeb) {
        try {
            console.warn('Reverse geocoding on web requires a third-party service');
            return [{
                city: 'Unknown City',
                country: 'Unknown Country',
                district: null,
                isoCountryCode: 'XX',
                name: 'Unknown Location',
                postalCode: null,
                region: null,
                street: null,
                streetNumber: null,
                subregion: null,
                timezone: null
            }];
        } catch (error) {
            console.error('Reverse geocoding error on web:', error);
            throw new Error('Reverse geocoding failed on web');
        }
    }

    // For Expo/React Native, this file shouldn't actually be used
    // This is just a fallback implementation
    return [{
        city: 'Unknown City',
        country: 'Unknown Country',
        district: null,
        isoCountryCode: 'XX',
        name: 'Unknown Location',
        postalCode: null,
        region: null,
        street: null,
        streetNumber: null,
        subregion: null,
        timezone: null
    }];
};

// Function to determine if running in Expo Go
export const isRunningInExpoGo = () => {
    return false; // This utility should only be used on web, so always return false
};

// Export a default object for compatibility with import * as Location syntax
export default {
    Accuracy,
    requestForegroundPermissionsAsync,
    getCurrentPositionAsync,
    geocodeAsync,
    reverseGeocodeAsync,
    isRunningInExpoGo
}; 