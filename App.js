import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import assets module for preloading
import { Asset } from 'expo-asset';
import { Image } from 'react-native';

// Import AppImages
import AppImages from './src/utils/AppImages';

// Import Context Providers
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { LocalizationProvider, useLocalization } from './src/context/LocalizationContext';

// Preload all images to avoid runtime loading issues
const preloadImages = () => {
  const images = Object.values(AppImages);

  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

// Offline banner component to show connectivity status
const OfflineBanner = () => {
  const { isOffline } = useOffline();
  const { t } = useLocalization();

  if (!isOffline) return null;

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineBannerText}>
        {t('offline_message')}
      </Text>
    </View>
  );
};

// Main application content with offline banner
const AppContent = () => {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
      <OfflineBanner />
    </>
  );
};

export default function App() {
  // Load assets
  React.useEffect(() => {
    preloadImages();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocalizationProvider>
          <OfflineProvider>
            <AppContent />
          </OfflineProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F57C00',
    padding: 8,
    zIndex: 1000,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
