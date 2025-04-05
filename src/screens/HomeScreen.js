import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Animated,
    Dimensions,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedCard from '../components/AnimatedCard';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const featureCards = [
        {
            id: 1,
            title: 'Crop Disease Detection',
            description: 'Identify plant diseases with AI-powered image recognition',
            iconName: 'leaf',
            backgroundColor: '#4CAF50',
            route: 'Disease',
        },
        {
            id: 2,
            title: 'Market Access',
            description: 'Connect directly with buyers for your produce',
            iconName: 'store',
            backgroundColor: '#FF9800',
            route: 'Market',
        },
        {
            id: 3,
            title: 'Price Prediction',
            description: 'Get forecasts for better selling decisions',
            iconName: 'chart-line',
            backgroundColor: '#2196F3',
            route: 'Prices',
        },
        {
            id: 4,
            title: 'Smart Assistant',
            description: 'Chat with AI in your language for farming advice',
            iconName: 'chat',
            backgroundColor: '#9C27B0',
            route: 'Chatbot',
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Header Section */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: translateYAnim }]
                        }
                    ]}
                >
                    <View style={styles.greetingContainer}>
                        <Text style={styles.welcomeText}>Welcome to</Text>
                        <Text style={styles.appName}>Agricult</Text>
                        <Text style={styles.tagline}>Your Smart Farming Assistant</Text>
                    </View>
                    <View style={styles.weatherContainer}>
                        <View style={styles.weatherCard}>
                            <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color="#4CAF50" />
                            <Text style={styles.weatherText}>30°C</Text>
                            <Text style={styles.locationText}>Sunny</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Feature Cards */}
                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Features</Text>
                </View>

                {featureCards.map((card, index) => (
                    <AnimatedCard
                        key={card.id}
                        title={card.title}
                        description={card.description}
                        iconName={card.iconName}
                        backgroundColor={card.backgroundColor}
                        route={card.route}
                    />
                ))}

                {/* Quick Actions Section */}
                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Quick Actions</Text>
                </View>

                <View style={styles.quickActionsContainer}>
                    <CustomButton
                        title="Report Disease"
                        onPress={() => navigation.navigate('Disease')}
                        icon={<MaterialCommunityIcons name="bug-outline" size={18} color="#FFFFFF" />}
                        style={styles.actionButton}
                    />
                    <CustomButton
                        title="Check Market"
                        onPress={() => navigation.navigate('Market')}
                        icon={<MaterialCommunityIcons name="cart-outline" size={18} color="#FFFFFF" />}
                        style={styles.actionButton}
                    />
                </View>

                <View style={styles.quickActionsContainer}>
                    <CustomButton
                        title="Weather Forecast"
                        onPress={() => { }}
                        primary={false}
                        icon={<MaterialCommunityIcons name="weather-cloudy" size={18} color="#4CAF50" />}
                        style={styles.actionButton}
                    />
                    <CustomButton
                        title="Get Help"
                        onPress={() => navigation.navigate('Chatbot')}
                        primary={false}
                        icon={<MaterialCommunityIcons name="help-circle-outline" size={18} color="#4CAF50" />}
                        style={styles.actionButton}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
        marginBottom: 10,
    },
    greetingContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 14,
        color: '#7E8C8D',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 16,
        color: '#2E4053',
        opacity: 0.8,
    },
    weatherContainer: {
        marginLeft: 10,
    },
    weatherCard: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 12,
    },
    weatherText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E4053',
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#7E8C8D',
    },
    sectionTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E4053',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginVertical: 8,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
});

export default HomeScreen; 