import NetInfo from '@react-native-community/netinfo';

/**
 * Check if network is available
 * @returns {Promise<boolean>} True if network is available, false otherwise
 */
export const isNetworkAvailable = async () => {
    try {
        const state = await NetInfo.fetch();
        return state.isConnected && state.isInternetReachable;
    } catch (error) {
        console.error('Error checking network status:', error);
        return false;
    }
};

/**
 * Subscribe to network status changes
 * @param {Function} callback Function to call when network status changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNetworkChanges = (callback) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
        const isConnected = state.isConnected && state.isInternetReachable;
        callback(isConnected);
    });

    return unsubscribe;
};

/**
 * Ping a server to check for internet connectivity
 * @param {string} url URL to ping
 * @param {number} timeout Timeout in milliseconds
 * @returns {Promise<boolean>} True if ping succeeds, false otherwise
 */
export const pingServer = async (url = 'https://www.google.com', timeout = 5000) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.error('Ping failed:', error);
        return false;
    }
};

/**
 * Get connection type and quality information
 * @returns {Promise<Object>} Connection information
 */
export const getConnectionInfo = async () => {
    try {
        const state = await NetInfo.fetch();
        return {
            isConnected: state.isConnected,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
            isWifi: state.type === 'wifi',
            isCellular: state.type === 'cellular',
            isWifiEnabled: state.isWifiEnabled,
            details: state.details,
        };
    } catch (error) {
        console.error('Error getting connection info:', error);
        return {
            isConnected: false,
            isInternetReachable: false,
            type: 'unknown',
            isWifi: false,
            isCellular: false,
            isWifiEnabled: false,
            details: null,
        };
    }
}; 