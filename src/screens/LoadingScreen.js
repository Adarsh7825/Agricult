import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Image,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '../context/LocalizationContext';

const { width } = Dimensions.get('window');
const logoSize = width * 0.4;

const LoadingScreen = ({ message }) => {
    const insets = useSafeAreaInsets();
    const { t } = useLocalization();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                }
            ]}
        >
            <View style={styles.contentContainer}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>{t('app_name')}</Text>

                <ActivityIndicator
                    size="large"
                    color="#4CAF50"
                    style={styles.loader}
                />

                <Text style={styles.loadingText}>
                    {message || t('loading')}
                </Text>
            </View>

            <Text style={styles.footerText}>{t('footer_message')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: logoSize,
        height: logoSize,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 30,
    },
    loader: {
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#616161',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9E9E9E',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default LoadingScreen; 