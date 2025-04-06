import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { LocalizationProvider } from './src/context/LocalizationContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WeatherProvider } from './src/context/WeatherContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

// Import assets module for preloading
import { Asset } from 'expo-asset';
import { Image } from 'react-native';

// Import AppImages
import AppImages from './src/utils/AppImages';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetail}>{this.state.error?.message || 'Unknown error'}</Text>
          <Text style={styles.retryText} onPress={() => this.setState({ hasError: false })}>
            Tap to retry
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Auth loading component
const AuthLoadingScreen = () => {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3498db" />
    </View>
  );
};

// Offline banner component to show when user is offline
const OfflineBanner = () => {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineBannerText}>
        You are offline. Some features may be limited.
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
      <AuthLoadingScreen />
    </>
  );
};

// Main app component
const App = () => {
  const [isReady, setIsReady] = useState(false);

  // Simulate app initialization process
  useEffect(() => {
    const initialize = async () => {
      try {
        // Simulate loading resources, initializing services, etc.
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
        // Handle initialization error
        setIsReady(true); // Still set ready to true to avoid app hanging
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <LocalizationProvider>
          <LoadingScreen message="Starting up..." />
        </LocalizationProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
        <LocalizationProvider>
          <OfflineProvider>
            <AuthProvider>
              <WeatherProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <OfflineBanner />
                </NavigationContainer>
              </WeatherProvider>
            </AuthProvider>
          </OfflineProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#EF6C00',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  offlineBannerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default App;

