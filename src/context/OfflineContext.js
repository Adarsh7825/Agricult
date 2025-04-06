import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
export const OfflineContext = createContext({
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
    const [lastSyncDate, setLastSyncDate] = useState(new Date());

    // Mock implementation of offline detection
    useEffect(() => {
        // Simulate connection status changes
        const intervalId = setInterval(() => {
            // Randomly go offline occasionally (10% chance)
            const goOffline = Math.random() < 0.1;
            setIsOffline(goOffline);

            if (!goOffline) {
                // If "online", update last sync time
                setLastSyncDate(new Date());
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(intervalId);
    }, []);

    // Mock data storage functions
    const storeData = async (key, data) => {
        try {
            console.log(`[Mock] Storing data for key: ${key}`);
            return true;
        } catch (error) {
            console.error('Error storing data:', error);
            return false;
        }
    };

    const getData = async (key) => {
        try {
            console.log(`[Mock] Getting data for key: ${key}`);
            return null; // Mock implementation returns null
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    };

    const syncNow = async () => {
        if (!isOffline) {
            console.log('[Mock] Syncing data...');
            setPendingSyncCount(0);
            setLastSyncDate(new Date());
            return true;
        }
        return false;
    };

    const value = {
        isOffline,
        pendingSyncCount,
        lastSyncDate,
        storeData,
        getData,
        syncNow,
        storeOfflineData: storeData,
        getOfflineData: getData,
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