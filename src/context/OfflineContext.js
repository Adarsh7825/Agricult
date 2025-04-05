import React, { createContext, useState, useContext, useEffect } from 'react';
import offlineManager from '../utils/OfflineManager';

// Create the context
const OfflineContext = createContext({
    isOffline: false,
    pendingSyncCount: 0,
    lastSyncDate: null,
});

/**
 * Provider component that wraps the app to provide offline status information
 */
export const OfflineProvider = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [lastSyncDate, setLastSyncDate] = useState(null);

    useEffect(() => {
        // Subscribe to connection state changes
        const unsubscribe = offlineManager.addConnectivityListener((isConnected) => {
            setIsOffline(!isConnected);

            // If connected, update last sync time
            if (isConnected) {
                setLastSyncDate(new Date());
            }
        });

        // Check sync queue status periodically
        const intervalId = setInterval(async () => {
            // In a real implementation, this would check the actual queue length
            const queueLength = offlineManager.syncQueue?.length || 0;
            setPendingSyncCount(queueLength);
        }, 5000);

        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, []);

    // Provide methods to interact with the offline manager
    const storeData = async (key, data, addToSyncQueue = false) => {
        return offlineManager.storeData(key, data, addToSyncQueue);
    };

    const getData = async (key) => {
        return offlineManager.getData(key);
    };

    const syncNow = async () => {
        if (!isOffline) {
            await offlineManager.synchronize();
            setPendingSyncCount(offlineManager.syncQueue.length);
            setLastSyncDate(new Date());
        }
    };

    const value = {
        isOffline,
        pendingSyncCount,
        lastSyncDate,
        storeData,
        getData,
        syncNow,
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
};

/**
 * Hook to access the offline context
 */
export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};

export default OfflineContext; 