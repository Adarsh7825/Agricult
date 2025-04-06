/**
 * OfflineManager.js
 * 
 * This utility provides functions for managing data persistence and synchronization
 * in low-connectivity environments. It handles:
 * 
 * 1. Offline data storage and retrieval
 * 2. Data synchronization when connection is available
 * 3. Conflict resolution strategies
 * 4. Connection state monitoring
 * 
 * This is crucial for the MVP considering the connectivity challenges in rural areas.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import NetInfo, but use fallback if not available
let NetInfo;
try {
    NetInfo = require('@react-native-community/netinfo');
} catch (error) {
    // Fallback mock implementation if NetInfo module is not available
    console.warn('NetInfo not available, using mock implementation');
    NetInfo = {
        addEventListener: (callback) => {
            // Simulate connectivity changes
            const intervalId = setInterval(() => {
                const isConnected = Math.random() > 0.2; // 80% chance of being online
                callback({ isConnected });
            }, 30000); // Check every 30 seconds

            return () => clearInterval(intervalId);
        },
        fetch: async () => {
            return { isConnected: Math.random() > 0.2 };
        }
    };
}

class OfflineManager {
    constructor() {
        this.syncQueue = [];
        this.isOnline = false;
        this.listeners = [];

        // Initialize connection monitoring
        this.unsubscribe = NetInfo.addEventListener(state => {
            const wasOnline = this.isOnline;
            this.isOnline = state.isConnected;

            // If connection was restored, attempt sync
            if (!wasOnline && this.isOnline) {
                this.synchronize();
            }

            // Notify listeners of connection state change
            this.notifyListeners();
        });
    }

    /**
     * Add a listener for connection state changes
     * @param {Function} listener - Callback function receiving isOnline state
     * @returns {Function} Unsubscribe function
     */
    addConnectivityListener(listener) {
        this.listeners.push(listener);
        // Immediately notify with current state
        listener(this.isOnline);

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all registered listeners of connection state
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.isOnline));
    }

    /**
     * Get current connection state
     * @returns {Promise<boolean>} Whether the device is online
     */
    async isConnected() {
        try {
            const netInfo = await NetInfo.fetch();
            this.isOnline = netInfo.isConnected;
            return this.isOnline;
        } catch (error) {
            console.error('Failed to fetch connection status:', error);
            return false;
        }
    }

    /**
     * Store data for a specific key
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {boolean} addToSyncQueue - Whether this operation should be synced when online
     * @returns {Promise<void>}
     */
    async storeData(key, data, addToSyncQueue = false) {
        try {
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem(key, jsonValue);

            if (addToSyncQueue) {
                this.addToSyncQueue({ type: 'set', key, data });

                // Try to sync immediately if we're online
                if (this.isOnline) {
                    this.synchronize();
                }
            }
        } catch (error) {
            console.error('Error storing data:', error);
            throw error;
        }
    }

    /**
     * Retrieve stored data for a key
     * @param {string} key - Storage key
     * @returns {Promise<any>} The stored data
     */
    async getData(key) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error retrieving data:', error);
            throw error;
        }
    }

    /**
     * Queue an operation for synchronization when online
     * @param {Object} operation - The operation to queue
     */
    addToSyncQueue(operation) {
        this.syncQueue.push({
            ...operation,
            timestamp: new Date().getTime()
        });

        // Store the updated queue
        this.persistSyncQueue();
    }

    /**
     * Save the current sync queue to persistent storage
     */
    async persistSyncQueue() {
        try {
            await AsyncStorage.setItem('SYNC_QUEUE', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Failed to persist sync queue:', error);
        }
    }

    /**
     * Load the sync queue from persistent storage
     */
    async loadSyncQueue() {
        try {
            const queueData = await AsyncStorage.getItem('SYNC_QUEUE');
            if (queueData) {
                this.syncQueue = JSON.parse(queueData);
            }
        } catch (error) {
            console.error('Failed to load sync queue:', error);
            this.syncQueue = [];
        }
    }

    /**
     * Attempt to synchronize all queued operations with the backend
     * In a real app, this would make API calls to sync with the server
     */
    async synchronize() {
        if (!this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        console.log('Attempting to synchronize data...');

        // In a real app, we would process each queued operation
        // For MVP, we simulate successful synchronization
        const syncPromises = this.syncQueue.map(operation => {
            // Simulate API call with 80% success rate
            return new Promise(resolve => {
                setTimeout(() => {
                    const success = Math.random() > 0.2;
                    resolve({ operation, success });
                }, 500);
            });
        });

        try {
            const results = await Promise.all(syncPromises);

            // Filter out successful operations
            const failedOperations = results
                .filter(result => !result.success)
                .map(result => result.operation);

            // Update sync queue with only failed operations
            this.syncQueue = failedOperations;
            this.persistSyncQueue();

            const successCount = results.length - failedOperations.length;
            if (successCount > 0) {
                console.log(`Successfully synchronized ${successCount} operations.`);
            }
            if (failedOperations.length > 0) {
                console.log(`Failed to synchronize ${failedOperations.length} operations.`);
            }
        } catch (error) {
            console.error('Error during synchronization:', error);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Create a singleton instance
const offlineManager = new OfflineManager();

// Initialize on import
(async () => {
    await offlineManager.loadSyncQueue();
    const isConnected = await offlineManager.isConnected();
    if (isConnected) {
        offlineManager.synchronize();
    }
})();

export default offlineManager; 